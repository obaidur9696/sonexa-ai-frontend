/* ============================================================
   VoiceSession/index.jsx
   Main voice session page - FIXED (No outer scrollbar)
   ============================================================ */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { useVoiceConnection } from '../../hooks/useVoiceConnection';
import VoiceHeader from '../../components/voice/VoiceHeader';
import { VoiceScreens } from '../../components/voice/VoiceScreens';
import VoiceControls from '../../components/voice/VoiceControls';
import FailedOverlay from '../../components/voice/FailedOverlay';
import SessionEndedOverlay from '../../components/voice/SessionEndedOverlay';
import { useAuth } from '../../providers/AuthProvider';
import ConversationScreen from '../../components/voice/ConversationScreen';
import {
  claimVoiceSessionStartToken,
  expireVoiceSessionStartToken,
} from '../../services/webrtc/voiceSessionStartGuard';

/* ── Ambient background glows ─────────────────────────────── */
const AmbientBackground = () => (
  <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden>
    <div
      className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl"
      style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
    />
    <div
      className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full blur-3xl"
      style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.06) 0%, transparent 70%)' }}
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-3xl opacity-50"
      style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)' }}
    />
  </div>
);

/* ── Bottom controls bar ── */
const ControlsBar = ({ isMuted, onToggleMute, onLeave }) => (
  <div className="
    shrink-0
    border-t border-gray-200 dark:border-white/[0.08]
    bg-white/70 dark:bg-[#09090b]/70
    backdrop-blur-md
    px-4 sm:px-6
    py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:py-5
  ">
    <VoiceControls
      isMuted={isMuted}
      onToggleMute={onToggleMute}
      onLeave={onLeave}
    />

    <p className="
      text-center
      text-[10px] sm:text-[11px]
      text-gray-400 dark:text-gray-500
      mt-2 sm:mt-3
      select-none
    ">
      {isMuted
        ? '🔇 Microphone muted — tap Unmute to speak'
        : '🎙️ Microphone active — speak naturally'}
    </p>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════════════════════ */
const ActiveVoiceSession = ({ formData, user, sessionStartToken }) => {
  const navigate = useNavigate();

  useEffect(() => {
    return () => expireVoiceSessionStartToken(sessionStartToken);
  }, [sessionStartToken]);

  // ✅ SMALL VALIDATION - Show FailedOverlay if no formData
  const enrichedFormData = useMemo(() => ({
    ...formData,
    userId: user?.data?._id || null
  }), [formData, user]);

  const {
    connectionState,
    isMuted,
    isBotSpeaking,
    isFailed,
    errorMessage,
    remainingSeconds,
    isEnded,
    toggleMute,
    leaveSession,
    messages,
    sessionExpireMessage
  } = useVoiceConnection({
    formData: enrichedFormData
  });

  // A session can only begin from Home. Replace this history entry after an
  // exit so browser Back cannot remount the completed session with its old
  // router state and start it again.
  const handleGoHome = useCallback(() => navigate('/', { replace: true }), [navigate]);
  const handleRetry = useCallback(() => window.location.reload(), []);
  const handleNewSession = useCallback(() => navigate('/', { replace: true }), [navigate]);

  const handleLeave = useCallback(() => leaveSession(), [leaveSession]);

  const showControls =
    connectionState === 'connecting' ||
    connectionState === 'connected' ||
    connectionState === 'idle';

  return (
    // ✅ CRITICAL: h-screen + overflow-hidden → NO outer scrollbar
    <main className={`voice-session flex min-h-0 flex-col overflow-hidden bg-gray-50 text-gray-900 dark:bg-[#09090b] dark:text-gray-100 ${user ? 'fixed inset-x-0 bottom-0 top-14 z-10 md:static md:h-screen' : 'voice-session--guest'}`} aria-label="Voice conversation session">

      <AmbientBackground />

      {/* ✅ Header - FIXED, never scrolls */}
      <div className="shrink-0">
        <VoiceHeader
          connectionState={connectionState}
          remainingSeconds={remainingSeconds}
        />
      </div>

      {/* ✅ Middle area - ONLY this can scroll */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full min-h-0 w-full">
          <AnimatePresence mode="wait">
            {connectionState === "connected" ? (
              <ConversationScreen messages={messages} isBotSpeaking={isBotSpeaking} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <VoiceScreens connectionState={connectionState} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ✅ Bottom controls - FIXED, never scrolls */}
      {showControls && (
        <div className="shrink-0">
          <ControlsBar
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onLeave={handleLeave}
          />
        </div>
      )}

      <AnimatePresence>
        {isFailed && (
          <FailedOverlay
            key="failed-overlay"
            onGoHome={handleGoHome}
            onRetry={handleRetry}
            errorMessage={errorMessage}
            autoCloseDelay={12000}  // ← 12 seconds
          />
        )}

        {/* Session ended overlay — user left or session finished */}
        {isEnded && (
          <SessionEndedOverlay
            key="ended-overlay"
            onHome={handleGoHome}
            onRetry={handleNewSession}
            title="Session Complete"
            message={sessionExpireMessage || "Your conversation has been saved. Thank you for using Sonexa AI."}
            autoCloseDelay={10000}
          />
        )}
      </AnimatePresence>

    </main>
  );
};

const VoiceSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const formData = useMemo(() => location.state?.formData ?? null, [location.state]);
  const sessionStartToken = location.state?.sessionStartToken;
  const [hasValidStart] = useState(() => claimVoiceSessionStartToken(sessionStartToken));

  if (!formData || Object.keys(formData).length === 0 || !hasValidStart) {
    return (
      <FailedOverlay
        onGoHome={() => navigate('/', { replace: true })}
        onRetry={() => navigate('/', { replace: true })}
        errorMessage="This session is no longer active. Please start a new session from the home page."
        autoCloseDelay={12000}
      />
    );
  }

  return <ActiveVoiceSession formData={formData} user={user} sessionStartToken={sessionStartToken} />;
};

export default VoiceSession;
