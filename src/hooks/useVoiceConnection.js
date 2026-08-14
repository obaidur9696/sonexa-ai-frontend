/* ============================================================
   useVoiceConnection.js - UPDATED for SENTENCE streaming
   ============================================================ */

import { useState, useEffect, useCallback, useRef } from 'react';
import { wsService } from '../services/webrtc/websocketService';
import { webrtcService } from '../services/webrtc/webrtcService';
import { sessionService } from '../services/webrtc/sessionService';

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

const normalizeChunk = (value) => {
  if (value == null) return '';
  return String(value);
};

// Replace instead of merge - since we receive full sentence
const replaceChunkText = (currentText, chunk) => {
  const next = normalizeChunk(chunk);
  if (!next) return currentText || '';
  return next;
};

const finalizeText = (text) => {
  return normalizeChunk(text)
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

/* ============================================================
   MAIN HOOK
   ============================================================ */

export const useVoiceConnection = ({ formData = {} } = {}) => {

  /* ================================
     STATE
  ================================ */
  const [connectionState, setConnectionState] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [sessionExpireMessage, setSessionExpireMessage] = useState(null);
  /* ================================
     REFS
  ================================ */
  const roomIdRef = useRef(null);
  const sessionIdRef = useRef(null); // ✅ Actual sessionId from backend
  const hasStartedRef = useRef(false);
  const formDataRef = useRef(formData);
  const activeTurnRef = useRef(null);        // { id, sender, text }
  const listenersCleanupRef = useRef(null);
  const messageCounterRef = useRef(0);
  const timerSyncIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const connectionStateRef = useRef(connectionState);

  /* ================================
     UPDATE FORM DATA REF
  ================================ */
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  /* ================================
     HELPER FUNCTIONS
  ================================ */

  const generateMessageId = useCallback(() => {
    messageCounterRef.current += 1;
    return `msg_${Date.now()}_${messageCounterRef.current}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
  }, []);

  const getFormattedTimestamp = useCallback(() => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const removeOrFinalizeMessage = useCallback((messageId, finalText) => {
    const text = finalizeText(finalText);

    setMessages((prev) => {
      if (!text) {
        return prev.filter((msg) => msg.id !== messageId);
      }

      return prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, text, isStreaming: false }
          : msg
      );
    });
  }, []);

  /* ================================
     TURN MACHINE (Transcript Handling)
  ================================ */

  const startTurn = useCallback(
    (sender) => {
      if (!sender) return null;

      const current = activeTurnRef.current;

      if (current && current.sender === sender) {
        return current.id;
      }

      const previous = current;
      const newId = generateMessageId();
      const timestamp = getFormattedTimestamp();

      activeTurnRef.current = {
        id: newId,
        sender,
        text: '',
      };

      setMessages((prev) => {
        let nextMessages = prev;

        if (previous) {
          const previousFinalText = finalizeText(previous.text);

          if (!previousFinalText) {
            nextMessages = prev.filter((msg) => msg.id !== previous.id);
          } else {
            nextMessages = prev.map((msg) =>
              msg.id === previous.id
                ? { ...msg, text: previousFinalText, isStreaming: false }
                : msg
            );
          }
        }

        return [
          ...nextMessages,
          {
            id: newId,
            sender,
            text: '',
            isStreaming: true,
            timestamp,
          },
        ];
      });

      console.log(`[TRANSCRIPT] 🔒 Started new ${sender} turn`);
      return newId;
    },
    [generateMessageId, getFormattedTimestamp]
  );

  const appendChunkToTurn = useCallback(
    (sender, rawChunk) => {
      const chunk = normalizeChunk(rawChunk);
      if (!sender || !chunk) return;

      const current = activeTurnRef.current;

      if (!current) {
        startTurn(sender);
      }

      const active = activeTurnRef.current;

      if (!active || active.sender !== sender) {
        console.log(
          `[TRANSCRIPT] ⚠️ Ignoring stray ${sender} chunk while locked to ${active?.sender ?? 'none'}`
        );
        return;
      }

      // Replace text with new full sentence (no merging needed)
      const nextText = replaceChunkText(active.text, chunk);
      activeTurnRef.current = { ...active, text: nextText };

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === active.id
            ? { ...msg, text: nextText, isStreaming: true }
            : msg
        )
      );

      console.log(`[TRANSCRIPT] 📝 ${sender} sentence updated: "${chunk}"`);
    },
    [startTurn]
  );

  const endTurn = useCallback(
    (sender) => {
      const current = activeTurnRef.current;
      if (!current) return;

      if (sender && current.sender !== sender) {
        console.log(
          `[TRANSCRIPT] ⚠️ Ignoring end from ${sender} because active is ${current.sender}`
        );
        return;
      }

      console.log(`[TRANSCRIPT] ✅ ${current.sender} finished speaking`);

      removeOrFinalizeMessage(current.id, current.text);
      activeTurnRef.current = null;
    },
    [removeOrFinalizeMessage]
  );

  /* ================================
     TIMER FUNCTIONS
  ================================ */

  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleSessionExpired = useCallback(() => {
    console.log('[Timer] Session expired');

    wsService.send({
      type: 'session_timer_termination',
      roomId: roomIdRef.current,
      payload: { reason: 'time_expired' }
    });
  }, []);

  const startCountdown = useCallback((seconds) => {
    stopCountdown();

    if (seconds <= 0) {
      handleSessionExpired();
      return;
    }

    setRemainingSeconds(seconds);

    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          stopCountdown();
          handleSessionExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopCountdown, handleSessionExpired]);

  /* ================================
     WEBSOCKET EVENT HANDLERS
  ================================ */

  const handleTranscriptStart = useCallback(
    (data) => {
      const sender = data?.sender;
      if (!sender) return;
      console.log(`[TRANSCRIPT] 🎤 ${sender} started speaking`);
      startTurn(sender);
    },
    [startTurn]
  );

  const handleTranscriptChunk = useCallback(
    (data) => {
      const sender = data?.sender;
      const text = data?.text; // Changed from 'word' to 'text'
      appendChunkToTurn(sender, text);
    },
    [appendChunkToTurn]
  );

  const handleTranscriptEnd = useCallback(
    (data) => {
      const sender = data?.sender;
      endTurn(sender);
    },
    [endTurn]
  );

  const handleSignal = useCallback(async (data) => {
    const payload = data.payload?.data ?? data.payload ?? {};

    if (payload.description?.type === 'answer') {
      await webrtcService.handleAnswer(payload.description.sdp);
    }

    if (payload.candidate) {
      await webrtcService.handleIceCandidate(payload.candidate);
    }
  }, []);

  useEffect(() => {
    connectionStateRef.current = connectionState;
  }, [connectionState]);

  const handleBotReady = useCallback((data) => {
    setConnectionState('connected');

    if (data?.sessionId) {
      sessionIdRef.current = data.sessionId;
      console.log('[VoiceConnection] ✅ Session ID received:', sessionIdRef.current);
    } else {
      console.warn('[VoiceConnection] ⚠️ No sessionId in bot-ready event:', data);
    }

    wsService.send({
      type: 'sync_timer',
      roomId: roomIdRef.current
    });

    timerSyncIntervalRef.current = setInterval(() => {
      if (connectionStateRef.current === 'connected' && roomIdRef.current) {
        wsService.send({
          type: 'sync_timer',
          roomId: roomIdRef.current
        });
        console.log('[Timer] Sync request sent');
      }
    }, 60000);
  }, []);

  /* ================================
     WEBSOCKET EVENT REGISTRATION
  ================================ */

  const registerEventListeners = useCallback(() => {
    listenersCleanupRef.current?.();

    wsService.on('signal', handleSignal);
    wsService.on('bot-ready', handleBotReady);
    wsService.on('transcript_start', handleTranscriptStart);
    wsService.on('transcript_chunk', handleTranscriptChunk);
    wsService.on('transcript_end', handleTranscriptEnd);
    wsService.on('session_error', (data) => {
      console.log('[WS] Session error:', data);
      const msg = data.message || data.payload?.message || 'Session validation failed';
      setErrorMessage(msg);
      setConnectionState('failed');
      disconnect();
    });

    wsService.on('session_expired', (data) => {
      console.log('[WS] Session expired:', data);
      const msg = data.message || 'Your session has expired. Thank you for using Sonexa AI.';
      setSessionExpireMessage(msg);
      setConnectionState('ended');
      disconnect();
    });

    wsService.on('timer_sync', (data) => {
      const { remainingSeconds } = data.payload || data;
      console.log('[WS] Timer sync received:', remainingSeconds);
      if (remainingSeconds !== undefined && remainingSeconds > 0) {
        startCountdown(remainingSeconds);
      }
    });

    const cleanup = () => {
      wsService.off('signal', handleSignal);
      wsService.off('bot-ready', handleBotReady);
      wsService.off('transcript_start', handleTranscriptStart);
      wsService.off('transcript_chunk', handleTranscriptChunk);
      wsService.off('transcript_end', handleTranscriptEnd);
    };

    listenersCleanupRef.current = cleanup;
    return cleanup;
  }, [
    handleSignal,
    handleBotReady,
    handleTranscriptStart,
    handleTranscriptChunk,
    handleTranscriptEnd,
    startCountdown
  ]);

  /* ================================
     SEND EVENT
  ================================ */

  const sendEvent = useCallback((type, payload = {}) => {
    wsService.send({
      type,
      roomId: roomIdRef.current,
      payload,
    });
  }, []);

  /* ================================
     DISCONNECT (Cleanup)
  ================================ */

  const disconnect = useCallback(() => {
    stopCountdown();

    if (timerSyncIntervalRef.current) {
      clearInterval(timerSyncIntervalRef.current);
      timerSyncIntervalRef.current = null;
    }

    listenersCleanupRef.current?.();
    listenersCleanupRef.current = null;

    webrtcService.close();
    wsService.disconnect();
    sessionService.clear();

    webrtcService.onRemoteStream = null;

    setRemoteStream(null);
    setLocalStream(null);
    setMessages([]);
    setIsMuted(false);
    setRemainingSeconds(null);

    hasStartedRef.current = false;
    roomIdRef.current = null;
    activeTurnRef.current = null;
    messageCounterRef.current = 0;
  }, [stopCountdown]);

  /* ================================
     LEAVE SESSION
  ================================ */

  const leaveSession = useCallback(() => {
    if (roomIdRef.current) {
      wsService.send({
        type: 'leave',
        roomId: roomIdRef.current,
        payload: { reason: 'user_left' },
      });
    }
    setConnectionState('ended');
    disconnect();
  }, [disconnect]);

  /* ================================
     MUTE TOGGLE
  ================================ */

  const toggleMute = useCallback(() => {
    const nowMuted = !webrtcService.isMuted();
    webrtcService.setMuted(nowMuted);
    setIsMuted(nowMuted);
  }, []);

  /* ================================
     CONNECT
  ================================ */

  const connect = useCallback(
    async (cancelledRef) => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      try {
        setConnectionState('connecting');

        const roomId = sessionService.generateRoomId();
        roomIdRef.current = roomId;

        registerEventListeners();

        webrtcService.onRemoteStream = (stream) => {
          if (!cancelledRef.current) {
            setRemoteStream(stream);
          }
        };

        wsService.connect();

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('WebSocket timeout')), 10000);
          const checkInterval = setInterval(() => {
            if (wsService.connected) {
              clearTimeout(timeout);
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });

        if (cancelledRef.current) return;
console.log("data at join time", formDataRef.current);
        wsService.send({
          type: 'join',
          roomId,
          data: formDataRef.current,
        });

        await webrtcService.init();

        if (cancelledRef.current) return;

        setLocalStream(webrtcService.localStream);
        await webrtcService.createOffer();
      } catch (err) {
        console.error('[useVoiceConnection] Connection error:', err);
        if (!cancelledRef.current) {
          setConnectionState('failed');
          hasStartedRef.current = false;
        }
      }
    },
    [registerEventListeners]
  );

  /* ================================
     LIFECYCLE
  ================================ */

  useEffect(() => {
    const cancelledRef = { current: false };
    connect(cancelledRef);
    return () => {
      cancelledRef.current = true;
      disconnect();
    };
  }, []);

  /* ================================
     RETURN API
  ================================ */

  return {
    connectionState,
    isMuted,
    remoteStream,
    localStream,
    messages,
    errorMessage,
    sessionExpireMessage,
    remainingSeconds,
    isConnecting: connectionState === 'connecting',
    isConnected: connectionState === 'connected',
    isFailed: connectionState === 'failed',
    isEnded: connectionState === 'ended',
    toggleMute,
    leaveSession,
    disconnect,
    sendEvent,
    sessionId: sessionIdRef.current //
  };
};