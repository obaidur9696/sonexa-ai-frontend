/* ============================================================
   VoiceHeader.jsx
   Top header: Sonexa logo (left) + Timer (center) + Status badge (right)

   Features:
   - Animated timer with countdown
   - Warning color when time is low (< 60 seconds)
   - Responsive design (mobile/tablet/desktop)
   - Smooth animations
   ============================================================ */

import { motion, AnimatePresence } from 'framer-motion';
import SonexaLogo from '../ui/Logo/SonexaLogo';

/* ── Helper: Format seconds to MM:SS ─────────────────────── */
const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/* ── Status config map ───────────────────────────────────── */
const STATUS_CONFIG = {
  idle: {
    dot: 'bg-gray-400',
    text: 'Initializing...',
    bg: 'bg-gray-50 dark:bg-gray-500/10',
    border: 'border-gray-200 dark:border-gray-500/20',
    textColor: 'text-gray-500 dark:text-gray-400',
  },
  connecting: {
    dot: 'bg-amber-400 animate-pulse',
    text: 'Connecting...',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  connected: {
    dot: 'bg-emerald-500 animate-pulse',
    text: 'Live',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  failed: {
    dot: 'bg-red-500',
    text: 'Failed',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    textColor: 'text-red-600 dark:text-red-400',
  },
  ended: {
    dot: 'bg-gray-400',
    text: 'Ended',
    bg: 'bg-gray-50 dark:bg-gray-500/10',
    border: 'border-gray-200 dark:border-gray-500/20',
    textColor: 'text-gray-500 dark:text-gray-400',
  },
};

const VoiceHeader = ({ connectionState, remainingSeconds = null }) => {
  const status = STATUS_CONFIG[connectionState] ?? STATUS_CONFIG.connecting;

  // Keep the timer area visible as soon as the session connects. The initial
  // placeholder avoids the mobile header appearing to lose its timer while the
  // first timer event is still in flight.
  const showTimer = connectionState === 'connected';

  // Warning when less than 60 seconds remaining
  const isTimerWarning = remainingSeconds !== null && remainingSeconds <= 60;

  // Animate timer when time is low
  const timerAnimation = isTimerWarning ? { scale: [1, 1.05, 1] } : {};

  return (
    <header className="
    sticky top-0 z-30 shrink-0
    flex items-center justify-between
    px-3 sm:px-6 h-14 sm:h-16
    border-b border-gray-200 dark:border-white/[0.08]
    bg-white/80 dark:bg-[#09090b]/80
    backdrop-blur-md
  ">
      {/* ── Logo Section (Left) ── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex shrink-0 items-center"
      >
        <SonexaLogo size={28} showText={false} />
      </motion.div>

      {/* ── Timer + Status Section (Right) ── */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">

        {/* Timer Display - Only when connected */}
        <AnimatePresence>
          {showTimer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 10 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                <polyline points="12 6 12 12 16 14" strokeWidth="1.5" />
              </svg>

              <motion.span
                animate={timerAnimation}
                transition={{ duration: 0.5, repeat: isTimerWarning ? Infinity : 0 }}
                className={`
                font-mono text-sm sm:text-base font-bold tracking-wider
                ${isTimerWarning
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300'
                  }
              `}
              >
                {formatTime(remainingSeconds)}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status.text}
            initial={{ opacity: 0, y: -6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.92 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`
            flex items-center gap-1.5 sm:gap-2
            px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border
            ${status.bg} ${status.border}
            shadow-sm
          `}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
            <span className={`
            text-[0.6rem] sm:text-[0.65rem] md:text-[0.7rem]
            font-semibold uppercase tracking-wider
            ${status.textColor}
          `}>
              {status.text}
            </span>
          </motion.div>
        </AnimatePresence>

      </div>
    </header>
  );
};

export default VoiceHeader;
