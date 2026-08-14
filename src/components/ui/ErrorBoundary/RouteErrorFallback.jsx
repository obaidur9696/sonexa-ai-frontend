import { Link, useRouteError } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../Button/Button';

const RouteErrorFallback = () => {
  const error = useRouteError();
  console.error('Route error:', error);

  return (
    <div className="min-h-screen page-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Orbs */}
      <div className="orb orb-brand-1 animate-orb-pulse" />
      <div className="orb orb-accent animate-float-slow" style={{ bottom: '8%', right: '10%' }} />
      <div className="orb orb-brand-2 animate-float-slower" style={{ top: '15%', left: '5%' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-lg relative z-10"
      >
        {/* Animated broken icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            delay: 0.1, 
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 25
          }}
          className="relative mb-8 inline-block"
        >
          <div className="relative">
            {/* Glow behind icon */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-2xl animate-pulse" />
            
            {/* Main icon circle */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/20 backdrop-blur-sm flex items-center justify-center">
              <svg 
                className="w-16 h-16 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Animated cracks */}
            <motion.div
              animate={{ 
                rotate: [0, 5, -3, 0],
                scale: [1, 1.02, 0.98, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute inset-0 pointer-events-none"
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  d="M30 20 L35 35 L28 45 L40 55 L38 70"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.3"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.7 }}
                  d="M70 25 L65 40 L72 50 L60 60"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.3"
                />
              </svg>
            </motion.div>
          </div>

          {/* Floating particles */}
          <motion.span
            animate={{ 
              y: [-8, 8, -8],
              rotate: [0, 15, -10, 0],
              scale: [1, 1.1, 1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute -top-3 -right-4 text-3xl opacity-30 select-none"
          >
            ⚡
          </motion.span>
          <motion.span
            animate={{ 
              y: [6, -6, 6],
              rotate: [0, -12, 8, 0],
              scale: [1, 1.08, 1, 1]
            }}
            transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute -bottom-3 -left-4 text-2xl opacity-30 select-none"
          >
            💫
          </motion.span>
        </motion.div>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-5"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono font-semibold tracking-wider uppercase bg-red-500/10 text-red-600 dark:text-red-400 rounded-full border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {error?.status || '500'} • Unexpected Issue
          </span>
        </motion.div>

        {/* Main text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Oops! Something broke
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-3 leading-relaxed">
            {error?.message || "We hit a small bump. Let's get you back to smooth conversations."}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
            ✨ Looks like a tiny technical glitch — we'll have it fixed in a flash!
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button 
            size="lg" 
            className="min-w-[180px] group"
            onClick={() => window.location.reload()}
          >
            <svg 
              className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Try Again
          </Button>
          <Link to="/">
            <Button variant="outline" size="lg" className="min-w-[180px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Home
            </Button>
          </Link>
        </motion.div>

        {/* Helpful message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mt-10"
        >
          <p className="text-sm text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            Need help? Contact support
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RouteErrorFallback;