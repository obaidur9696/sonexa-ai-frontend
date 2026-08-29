/* ============================================================
   webrtcService.js — WebRTC Peer Connection Manager

   RESPONSIBILITY:
   - Gets user's microphone (local audio track)
   - Creates and manages the RTCPeerConnection
   - Creates SDP offer and sends it via WebSocket
   - Applies SDP answer received from server
   - Handles ICE candidate exchange (both directions)
   - Plays incoming bot audio via an <Audio> element

   KEY FIX vs old version:
   ICE CANDIDATE QUEUE:
   The server can send ICE candidates immediately after the
   answer — sometimes BEFORE setRemoteDescription() finishes.
   Calling addIceCandidate() before remote desc is set throws
   an error and drops the candidate → connection never forms.
   
   Fix: candidates arriving early are queued. Once remote
   description is set, the queue is flushed in order.
   ============================================================ */

import { wsService } from './websocketService';
/* ── STUN servers for ICE gathering ── */
const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

// A brief spoken pause must not be treated as the end of a bot response.
const BOT_PLAYBACK_COMPLETE_SILENCE_MS = 800;

class WebRTCService {
  constructor() {
    /* ── Core WebRTC objects ── */
    this.pc = null; // RTCPeerConnection
    this.localStream = null; // User's mic MediaStream
    this.remoteStream = null; // Bot's audio MediaStream
    this.audioElement = null; // Internal <audio> owned by the WebRTC service
    this._botSpeaking = false;
    this._botSpeakingInterval = null;
    this._botSpeakingCleanup = null;
    this._botPlaybackCompleteTimer = null;
    this._hasActiveBotPlayback = false;

    /* ── ICE candidate queue ──
       Candidates from server are queued here until
       setRemoteDescription() has been called. ── */
    this._pendingCandidates = [];
    this._remoteDescriptionSet = false;

    /* ── Callbacks (set by the hook) ── */
    this.onRemoteStream = null; // (stream: MediaStream) => void
    this.onBotSpeakingChange = null; // (isSpeaking: boolean) => void
    this.onBotPlaybackComplete = null; // () => void, after audible bot audio has finished
    this.onConnectionState = null; // (state: string) => void
    this.onIceState = null; // (state: string) => void
  }

  /* ─────────────────────────────────────────
     init()
     
     Entry point. Call once per session.
     1. Creates RTCPeerConnection with event handlers
     2. Requests microphone access
     3. Adds mic tracks to peer connection
     ───────────────────────────────────────── */
  async init() {
    if (this.pc) {
      console.log('[WebRTC] Already initialized — skipping');
      return;
    }

    console.log('[WebRTC] Initializing...');
    const peerConnection = this._createPeerConnection();
    await this._getUserMedia(peerConnection);
  }

  /* ─────────────────────────────────────────
     createOffer()
     
     Creates an SDP offer (our media capabilities),
     sets it as local description, then sends it to
     the server via WebSocket as a 'signal' message.
     
     Server responds with a 'signal' message containing
     an SDP answer → handled by handleAnswer() below.
     ───────────────────────────────────────── */
  async createOffer() {
    if (!this.pc) {
      throw new Error('[WebRTC] Cannot create offer — not initialized');
    }

    console.log('[WebRTC] Creating SDP offer...');

    const peerConnection = this.pc;
    const offer = await peerConnection.createOffer();
    if (this.pc !== peerConnection || peerConnection.connectionState === 'closed') {
      throw new Error('[WebRTC] Offer creation cancelled');
    }
    await peerConnection.setLocalDescription(offer);
    if (this.pc !== peerConnection || peerConnection.connectionState === 'closed') {
      throw new Error('[WebRTC] Offer creation cancelled');
    }

    // Send offer to server — server will respond with 'signal' answer
    wsService.send({
      type: 'signal',
      payload: {
        data: { description: offer } // matches server's expected format
      }
    });

    console.log('[WebRTC] Offer sent to server');
  }

  /* ─────────────────────────────────────────
     handleAnswer(sdp)
     
     Called when server sends back an SDP answer.
     Sets the remote description, then flushes any
     ICE candidates that arrived early.
     ───────────────────────────────────────── */
  async handleAnswer(sdp) {
    if (!this.pc) {
      throw new Error('[WebRTC] Cannot handle answer — not initialized');
    }

    if (this._remoteDescriptionSet) {
      console.warn('[WebRTC] Duplicate SDP answer ignored');
      return;
    }

    console.log('[WebRTC] Applying SDP answer from server...');

    const peerConnection = this.pc;
    const answer = new RTCSessionDescription({ type: 'answer', sdp });
    await peerConnection.setRemoteDescription(answer);
    if (this.pc !== peerConnection || peerConnection.connectionState === 'closed') return;

    // Mark flag so future ICE candidates are added directly
    this._remoteDescriptionSet = true;
    console.log('[WebRTC] Remote description set ✓');

    // Flush any ICE candidates that arrived before the answer
    await this._flushPendingCandidates();
  }

  /* ─────────────────────────────────────────
     handleIceCandidate(candidate)
     
     Called when server sends an ICE candidate.
     
     IMPORTANT: If remote description isn't set yet,
     we queue the candidate instead of dropping it.
     ───────────────────────────────────────── */
  async handleIceCandidate(candidate) {
    if (!this.pc) {
      console.warn('[WebRTC] Received ICE candidate but no peer connection — dropped');
      return;
    }

    if (!this._remoteDescriptionSet) {
      // Queue it — will be applied once answer is set
      console.log('[WebRTC] ICE candidate queued (remote desc not yet set)');
      this._pendingCandidates.push(candidate);
      return;
    }

    await this._applyIceCandidate(candidate);
  }

  /* ─────────────────────────────────────────
     setMuted(muted: boolean)
     
     Enables/disables the local audio track.
     Does NOT stop the track — just silences it.
     ───────────────────────────────────────── */
  setMuted(muted) {
    if (!this.localStream) return;
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = !muted;
    });
    console.log('[WebRTC] Mic', muted ? 'muted' : 'unmuted');
  }

  /* ─────────────────────────────────────────
     isMuted()
     
     Returns true if the local mic is currently muted.
     ───────────────────────────────────────── */
  isMuted() {
    const track = this.localStream?.getAudioTracks()[0];
    return track ? !track.enabled : false;
  }

  /* ─────────────────────────────────────────
     close()
     
     Full cleanup. Call on session end.
     Stops mic, closes peer connection, clears audio.
     ───────────────────────────────────────── */
  close() {
    console.log('[WebRTC] Closing...');
    this._stopBotSpeakingMonitor();
    // Stop microphone tracks (releases hardware)
    this.localStream?.getTracks().forEach(track => {
      track.stop();
      console.log('[WebRTC] Stopped track:', track.kind);
    });
    this.localStream = null;

    // Close peer connection (stops ICE, closes DTLS, etc.)
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    // Detach audio element to stop playback
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      this.audioElement = null;
    }

    // Reset all state
    this.remoteStream = null;
    this._pendingCandidates = [];
    this._remoteDescriptionSet = false;
    this.onRemoteStream = null;
    this.onBotSpeakingChange = null;
    this.onBotPlaybackComplete = null;
    this.onConnectionState = null;
    this.onIceState = null;

    console.log('[WebRTC] Closed ✓');
  }

  /* ══════════════════════════════════════════
     PRIVATE METHODS
     ══════════════════════════════════════════ */

  /* ─────────────────────────────────────────
     _createPeerConnection()
     
     Creates RTCPeerConnection and wires up all
     the event handlers it needs.
     ───────────────────────────────────────── */
  _createPeerConnection() {
    const peerConnection = new RTCPeerConnection(ICE_CONFIG);
    this.pc = peerConnection;
    this._pendingCandidates = [];
    this._remoteDescriptionSet = false;

    /* ── Incoming audio track from bot ──
       Fires when the server's audio track arrives.
       We attach it to an <audio> element for autoplay. */
    peerConnection.ontrack = (event) => {
      if (peerConnection !== this.pc) return;
      const track = event.track;
      if (!track) return;

      console.log('[WebRTC] Remote track received:', track.kind);

      if (track.kind === 'audio') {
        // ✅ Always bind track → stream (industry standard)
        const stream = new MediaStream([track]);
        this.remoteStream = stream;

        // ✅ Create audio element once
        if (!this.audioElement) {
          this.audioElement = new Audio();
          this.audioElement.autoplay = true;
          this.audioElement.playsInline = true;
        }

        this.audioElement.srcObject = stream;
        this._startBotSpeakingMonitor(peerConnection, track);

        // ✅ Production-safe play handling (autoplay retry)
        this.audioElement.play().catch((err) => {
          console.warn('[WebRTC] audio.play() rejected:', err);

          // retry once (matches your company pattern)
          setTimeout(() => {
            this.audioElement?.play().catch(() => { });
          }, 1000);
        });

        // expose to React if needed
        if (this.onRemoteStream) this.onRemoteStream(stream);

        console.log('[WebRTC] Bot audio playing');
      }
    };

    /* ── Our ICE candidates ready to send to server ──
       Browser gathered a network candidate → send it
       to server via WebSocket so it can reach us. */
    peerConnection.onicecandidate = (event) => {
      if (peerConnection !== this.pc) return;
      if (!event.candidate) return; // null = gathering complete
      console.log('[WebRTC] Local ICE candidate gathered, sending to server');
      wsService.send({
        type: 'signal',
        payload: {
          data: { candidate: event.candidate }
        }
      });
    };

    /* ── Overall connection state (use for UI) ── */
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection !== this.pc) return;
      const state = peerConnection.connectionState;
      console.log('[WebRTC] Connection state:', state);
      if (this.onConnectionState) this.onConnectionState(state);
    };

    /* ── ICE-specific state (useful for debugging) ── */
    peerConnection.oniceconnectionstatechange = () => {
      if (peerConnection !== this.pc) return;
      const state = peerConnection.iceConnectionState;
      console.log('[WebRTC] ICE state:', state);
      if (this.onIceState) this.onIceState(state);
    };

    return peerConnection;
  }

  _setBotSpeaking(isSpeaking) {
    if (this._botSpeaking === isSpeaking) return;
    this._botSpeaking = isSpeaking;

    if (isSpeaking) {
      this._hasActiveBotPlayback = true;
      this._clearBotPlaybackCompleteTimer();
    } else if (this._hasActiveBotPlayback) {
      this._scheduleBotPlaybackComplete();
    }

    this.onBotSpeakingChange?.(isSpeaking);
  }

  _clearBotPlaybackCompleteTimer() {
    if (!this._botPlaybackCompleteTimer) return;
    clearTimeout(this._botPlaybackCompleteTimer);
    this._botPlaybackCompleteTimer = null;
  }

  cancelBotPlaybackCompletion() {
    this._clearBotPlaybackCompleteTimer();
    this._hasActiveBotPlayback = false;
  }

  _scheduleBotPlaybackComplete() {
    this._clearBotPlaybackCompleteTimer();
    this._botPlaybackCompleteTimer = setTimeout(() => {
      this._botPlaybackCompleteTimer = null;
      if (this._botSpeaking || !this._hasActiveBotPlayback) return;

      this._hasActiveBotPlayback = false;
      this.onBotPlaybackComplete?.();
    }, BOT_PLAYBACK_COMPLETE_SILENCE_MS);
  }

  _stopBotSpeakingMonitor() {
    if (this._botSpeakingInterval) {
      clearInterval(this._botSpeakingInterval);
      this._botSpeakingInterval = null;
    }
    this._botSpeakingCleanup?.();
    this._botSpeakingCleanup = null;
    this._clearBotPlaybackCompleteTimer();
    this._hasActiveBotPlayback = false;
    this._setBotSpeaking(false);
  }

  _startBotSpeakingMonitor(peerConnection, track) {
    this._stopBotSpeakingMonitor();

    const receiver = peerConnection.getReceivers().find((item) => item.track === track);
    let canReadAudioLevel = typeof receiver?.getSynchronizationSources === 'function';
    const audioElement = this.audioElement;
    const handlePlaybackStart = () => {
      if (!canReadAudioLevel) this._setBotSpeaking(true);
    };
    const handlePlaybackStop = () => this._setBotSpeaking(false);
    const handleTrackUnmute = () => {
      if (!canReadAudioLevel) this._setBotSpeaking(true);
    };
    const handleTrackEnded = () => this._setBotSpeaking(false);

    audioElement?.addEventListener('playing', handlePlaybackStart);
    audioElement?.addEventListener('pause', handlePlaybackStop);
    audioElement?.addEventListener('ended', handlePlaybackStop);
    track.addEventListener('unmute', handleTrackUnmute);
    track.addEventListener('ended', handleTrackEnded);

    this._botSpeakingCleanup = () => {
      audioElement?.removeEventListener('playing', handlePlaybackStart);
      audioElement?.removeEventListener('pause', handlePlaybackStop);
      audioElement?.removeEventListener('ended', handlePlaybackStop);
      track.removeEventListener('unmute', handleTrackUnmute);
      track.removeEventListener('ended', handleTrackEnded);
    };

    if (!canReadAudioLevel) return;

    let lastAudibleAt = 0;
    const updateSpeakingState = () => {
      if (peerConnection !== this.pc || track.readyState === 'ended') return;
      if (!canReadAudioLevel) return;

      try {
        const sources = receiver.getSynchronizationSources();
        const isAudible = sources.some((source) => (source.audioLevel ?? 0) > 0.01);
        if (isAudible) lastAudibleAt = Date.now();
        this._setBotSpeaking(Date.now() - lastAudibleAt < 350);
      } catch {
        // Fall back to the media element when a browser rejects audio-level reads.
        canReadAudioLevel = false;
        if (!audioElement?.paused) this._setBotSpeaking(true);
      }
    };

    updateSpeakingState();
    this._botSpeakingInterval = setInterval(updateSpeakingState, 100);
  }

  /* ─────────────────────────────────────────
     _getUserMedia()
     
     Requests microphone access from the browser.
     Adds the mic track to the peer connection so
     our voice is sent to the server/bot.
     ───────────────────────────────────────── */
  async _getUserMedia(peerConnection) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      console.log('[WebRTC] Microphone access granted ✓');

      if (this.pc !== peerConnection || peerConnection.connectionState === 'closed') {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('[WebRTC] Microphone request completed after session cleanup');
      }

      this.localStream = stream;

      // Add mic tracks to the peer connection
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
        console.log('[WebRTC] Added track:', track.kind);
      });

    } catch (err) {
      console.error('[WebRTC] Microphone access denied:', err);
      throw err; // propagate so hook can show error state
    }
  }

  /* ─────────────────────────────────────────
     _applyIceCandidate(candidate)
     
     Actually adds an ICE candidate to the connection.
     Wrapped separately so it can be called from both
     handleIceCandidate() and _flushPendingCandidates().
     ───────────────────────────────────────── */
  async _applyIceCandidate(candidate) {
    const peerConnection = this.pc;
    if (!peerConnection || peerConnection.connectionState === 'closed') return;
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('[WebRTC] ICE candidate applied');
    } catch (err) {
      console.error('[WebRTC] Failed to apply ICE candidate:', err);
    }
  }

  /* ─────────────────────────────────────────
     _flushPendingCandidates()
     
     Applies all queued ICE candidates in order.
     Called right after remote description is set.
     ───────────────────────────────────────── */
  async _flushPendingCandidates() {
    const count = this._pendingCandidates.length;
    if (count === 0) return;

    console.log(`[WebRTC] Flushing ${count} queued ICE candidate(s)...`);

    // Process in order, one at a time
    while (this._pendingCandidates.length > 0) {
      const candidate = this._pendingCandidates.shift();
      await this._applyIceCandidate(candidate);
    }

    console.log('[WebRTC] ICE candidate queue flushed ✓');
  }
}

/* ── Single shared instance ── */
export const webrtcService = new WebRTCService();
export default WebRTCService;
