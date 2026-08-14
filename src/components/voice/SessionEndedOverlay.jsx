/* ============================================================
   SessionEndedOverlay.jsx
   Popup overlay shown when session ends naturally or by user action

   Features:
   - Spring-animated entrance
   - Success icon with gradient
   - Customizable message
   - Countdown ring for auto-redirect
   - "Go Home" button (and optional "New Session" button)
   ============================================================ */

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

/* ── Countdown ring SVG ──────────────────────────────────── */
const CountdownRing = ({ total, remaining }) => {
  const size    = 48;
  const stroke  = 3;
  const radius  = (size - stroke) / 2;
  const circum  = 2 * Math.PI * radius;
  const progress = remaining / total;
  const dashOffset = circum * (1 - progress);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-gray-200 dark:text-white/10"
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="url(#countGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circum}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      <defs>
        <linearGradient id="countGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ── Success icon ───────────────────────────────────────── */
const SuccessIcon = () => (
  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

/* ── Main SessionEndedOverlay ────────────────────────────── */
const SessionEndedOverlay = ({ 
  onHome, 
  onRetry, 
  title = "Session Complete", 
  message = "Your conversation has been saved. Thank you for using Sonexa AI.",
  autoCloseDelay = 3000 
}) => {
  const totalSeconds  = Math.round(autoCloseDelay / 1000);
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef   = useRef(null);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    redirectTimerRef.current = setTimeout(() => {
      onHome();
    }, autoCloseDelay);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(redirectTimerRef.current);
    };
  }, [onHome, autoCloseDelay]);

  const handleGoHome = () => {
    clearInterval(intervalRef.current);
    clearTimeout(redirectTimerRef.current);
    onHome();
  };

  const handleRetry = () => {
    clearInterval(intervalRef.current);
    clearTimeout(redirectTimerRef.current);
    if (onRetry) onRetry();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.05 }}
        className="w-full max-w-sm bg-white dark:bg-[#111113] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-gray-100 dark:border-white/[0.06]"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 350, damping: 20 }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #9333ea)' }}
        >
          <SuccessIcon />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {title}
        </motion.h3>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6"
        >
          {message}
        </motion.p>

        {/* Countdown ring + label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="relative">
            <CountdownRing total={totalSeconds} remaining={remaining} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
              {remaining}
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Redirecting in {remaining}s...
          </span>
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {/* Go Home Button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            onClick={handleGoHome}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition-opacity duration-150 shadow-sm"
          >
            Go Home
          </motion.button>

          {/* Retry Button (only shown if onRetry provided) */}
          {onRetry && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              onClick={handleRetry}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity duration-150 shadow-sm"
            >
              New Session
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SessionEndedOverlay;