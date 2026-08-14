/* ============================================================
   FailedOverlay.jsx
   Popup overlay shown when connection fails or session error occurs

   Features:
   - Spring-animated entrance
   - Error icon with red gradient
   - Clear error message
   - Countdown timer before auto-redirect (12 seconds)
   - Retry and Go Home buttons
   ============================================================ */

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

/* ── Countdown ring SVG (red gradient) ──────────────────── */
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
        stroke="url(#errorCountGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circum}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      <defs>
        <linearGradient id="errorCountGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ── Error icon ─────────────────────────────────────────── */
const ErrorIcon = () => (
  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ── Main FailedOverlay ── */
const FailedOverlay = ({ onGoHome, onRetry, errorMessage, autoCloseDelay = 12000 }) => {
  const totalSeconds = Math.round(autoCloseDelay / 1000);
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef(null);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    // Countdown tick
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-redirect after full delay
    redirectTimerRef.current = setTimeout(() => {
      onGoHome();
    }, autoCloseDelay);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(redirectTimerRef.current);
    };
  }, [onGoHome, autoCloseDelay]);

  const handleRetry = () => {
    clearInterval(intervalRef.current);
    clearTimeout(redirectTimerRef.current);
    onRetry();
  };

  const handleGoHome = () => {
    clearInterval(intervalRef.current);
    clearTimeout(redirectTimerRef.current);
    onGoHome();
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
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 350, damping: 20 }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/20"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
        >
          <ErrorIcon />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2"
        >
          Connection Failed
        </motion.h3>

        {/* Error Message */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6"
        >
          {errorMessage || 'Unable to connect to the voice service. Please check your internet and try again.'}
        </motion.p>

        {/* Countdown Timer */}
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="flex flex-col gap-3"
        >
          <motion.button
            onClick={handleRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity duration-150 shadow-sm"
          >
            Retry Connection
          </motion.button>

          <motion.button
            onClick={handleGoHome}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors duration-150"
          >
            Go Home
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FailedOverlay;