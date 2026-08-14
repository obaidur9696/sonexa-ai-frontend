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

class WebRTCService {
  constructor() {
    /* ── Core WebRTC objects ── */
    this.pc = null; // RTCPeerConnection
    this.localStream = null; // User's mic MediaStream
    this.remoteStream = null; // Bot's audio MediaStream
    this.audioElement = null; // Internal <audio> to autoplay bot voice

    /* ── ICE candidate queue ──
       Candidates from server are queued here until
       setRemoteDescription() has been called. ── */
    this._pendingCandidates = [];
    this._remoteDescriptionSet = false;

    /* ── Callbacks (set by the hook) ── */
    this.onRemoteStream = null; // (stream: MediaStream) => void
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
    this._createPeerConnection();
    await this._getUserMedia();
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

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

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

    console.log('[WebRTC] Applying SDP answer from server...');

    const answer = new RTCSessionDescription({ type: 'answer', sdp });
    await this.pc.setRemoteDescription(answer);

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
      this.audioElement.srcObject = null;
      this.audioElement = null;
    }

    // Reset all state
    this.remoteStream = null;
    this._pendingCandidates = [];
    this._remoteDescriptionSet = false;

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
    this.pc = new RTCPeerConnection(ICE_CONFIG);
    this._pendingCandidates = [];
    this._remoteDescriptionSet = false;

    /* ── Incoming audio track from bot ──
       Fires when the server's audio track arrives.
       We attach it to an <audio> element for autoplay. */
    this.pc.ontrack = (event) => {
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
    this.pc.onicecandidate = (event) => {
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
    this.pc.onconnectionstatechange = () => {
      const state = this.pc.connectionState;
      console.log('[WebRTC] Connection state:', state);
      if (this.onConnectionState) this.onConnectionState(state);
    };

    /* ── ICE-specific state (useful for debugging) ── */
    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc.iceConnectionState;
      console.log('[WebRTC] ICE state:', state);
      if (this.onIceState) this.onIceState(state);
    };
  }

  /* ─────────────────────────────────────────
     _getUserMedia()
     
     Requests microphone access from the browser.
     Adds the mic track to the peer connection so
     our voice is sent to the server/bot.
     ───────────────────────────────────────── */
  async _getUserMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      console.log('[WebRTC] Microphone access granted ✓');

      // Add mic tracks to the peer connection
      this.localStream.getTracks().forEach(track => {
        this.pc.addTrack(track, this.localStream);
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
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
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