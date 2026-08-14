/* ============================================================
   VoiceSession/index.jsx
   Main voice session page - FIXED (No outer scrollbar)
   ============================================================ */

import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { useVoiceConnection } from '../../hooks/useVoiceConnection';
import VoiceHeader from '../../components/voice/VoiceHeader';
import { VoiceScreens } from '../../components/voice/VoiceScreens';
import VoiceControls from '../../components/voice/VoiceControls';
import BotAudioPlayer from '../../components/voice/BotAudioPlayer';
import FailedOverlay from '../../components/voice/FailedOverlay';
import SessionEndedOverlay from '../../components/voice/SessionEndedOverlay';
import { useAuth } from '../../providers/AuthProvider';
import ConversationScreen from '../../components/voice/ConversationScreen';
import { usePendingSessionPoller } from '../../hooks/useSessions';

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
    py-4 sm:py-5
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
const VoiceSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const formData = location.state?.formData ?? {};

  // ✅ SMALL VALIDATION - Show FailedOverlay if no formData
  if (Object.keys(formData).length === 0) {
    return (
      <FailedOverlay
        onGoHome={() => navigate('/')}
        onRetry={() => window.location.reload()}
        errorMessage="Invalid session access. Please start a session from the home page."
        autoCloseDelay={12000}
      />
    );
  }

  const enrichedFormData = {
    ...formData,
    userId: user?.data?._id || null
  };

  const {
    connectionState,
    sessionId,
    isMuted,
    remoteStream,
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

  usePendingSessionPoller({ connectionState, sessionId, });

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLeave = () => {
    leaveSession();
  };

  const showControls =
    connectionState === 'connecting' ||
    connectionState === 'connected' ||
    connectionState === 'idle';

  return (
    // ✅ CRITICAL: h-screen + overflow-hidden → NO outer scrollbar
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#09090b] overflow-hidden">

      <AmbientBackground />

      {/* ✅ Header - FIXED, never scrolls */}
      <div className="shrink-0">
        <VoiceHeader
          connectionState={connectionState}
          remainingSeconds={remainingSeconds}
        />
      </div>

      {/* ✅ Middle area - ONLY this can scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="h-full w-full">
          <AnimatePresence mode="wait">
            {connectionState === "connected" ? (
              <ConversationScreen messages={messages} />
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

      <BotAudioPlayer remoteStream={remoteStream} />

      <AnimatePresence>
        {isFailed && (
          <FailedOverlay
            key="failed-overlay"
            onGoHome={handleGoHome}
            onRetry={() => window.location.reload()}
            errorMessage={errorMessage}
            autoCloseDelay={12000}  // ← 12 seconds
          />
        )}

        {/* Session ended overlay — user left or session finished */}
        {isEnded && (
          <SessionEndedOverlay
            key="ended-overlay"
            onHome={handleGoHome}
            onRetry={() => {
              navigate('/');
            }}
            title="Session Complete"
            message={sessionExpireMessage || "Your conversation has been saved. Thank you for using Sonexa AI."}
            autoCloseDelay={10000}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default VoiceSession;