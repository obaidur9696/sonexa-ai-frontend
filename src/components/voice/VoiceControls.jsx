/* ============================================================
   VoiceControls.jsx
   Bottom controls: Mute/Unmute mic + Leave session

   Shown only when connectionState is 'connecting' or 'connected'.
   Hidden on 'failed' and 'ended' (overlays handle those states).

   Props:
     isMuted       boolean         — mic mute state from hook
     onToggleMute  () => void      — from hook's toggleMute
     onLeave       () => void      — from hook's leaveSession (via index.jsx)
   ============================================================ */

import { motion } from 'framer-motion';

/* ── Icons ─────────────────────────────────────────────────── */
const MicOnIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8"  y1="22" x2="16" y2="22" />
  </svg>
);

const MicOffIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="3" x2="21" y2="21" />
    <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
    <path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .26-.02.52-.05.78" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8"  y1="22" x2="16" y2="22" />
  </svg>
);

const PhoneOffIcon = () => (
  <svg className="w-5 h-5 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 003.01 3.01l1.73-1.73a2 2 0 012.11-.47c1.27.55 2.64.84 4.06.84a2 2 0 012 2v3.5a2 2 0 01-2 2C8.4 23 1 15.6 1 6.5a2 2 0 012-2H6.5a2 2 0 012 2c0 1.42.29 2.79.84 4.06a2 2 0 01-.47 2.11L7.1 14.4" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
);

/* ── Control Button wrapper ────────────────────────────────── */
const ControlButton = ({ onClick, children, label, variant = 'default' }) => {
  const variants = {
    default: 'bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/12 shadow-sm',
    muted:   'bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15',
    active:  'border border-transparent text-white shadow-lg shadow-indigo-500/25 hover:opacity-90',
    danger:  'bg-red-500/10 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/20',
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={variant === 'active' ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' } : undefined}
        className={`
          w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
          flex items-center justify-center
          transition-colors duration-200
          cursor-pointer select-none
          ${variants[variant]}
        `}
      >
        {children}
      </motion.button>
      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

/* ── Main Controls ─────────────────────────────────────────── */
const VoiceControls = ({ isMuted, onToggleMute, onLeave }) => {
  return (
    <div className="flex items-end justify-center gap-8 sm:gap-12">

      {/* Mute / Unmute */}
      <ControlButton
        onClick={onToggleMute}
        label={isMuted ? 'Unmute' : 'Mute'}
        variant={isMuted ? 'muted' : 'active'}
      >
        {isMuted ? <MicOffIcon /> : <MicOnIcon />}
      </ControlButton>

      {/* Leave — larger, red tint */}
      <div className="flex flex-col items-center gap-2.5">
        <motion.button
          onClick={onLeave}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="
            h-14 sm:h-16 px-6 sm:px-7 rounded-2xl
            flex items-center gap-2.5
            bg-red-500/10 dark:bg-red-500/10
            border border-red-200 dark:border-red-500/25
            text-red-600 dark:text-red-400
            hover:bg-red-500/20 dark:hover:bg-red-500/20
            transition-colors duration-200
            cursor-pointer select-none
            font-semibold text-sm sm:text-base
          "
        >
          <PhoneOffIcon />
          <span>Leave</span>
        </motion.button>
        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          End session
        </span>
      </div>

    </div>
  );
};

export default VoiceControls;