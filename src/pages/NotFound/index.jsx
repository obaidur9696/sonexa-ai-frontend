import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button/Button';

const NotFound = () => (
  <div className="min-h-screen page-gradient flex items-center justify-center p-4 relative overflow-hidden">
    {/* Orbs */}
    <div className="orb orb-brand-1 animate-orb-pulse" />
    <div className="orb orb-accent animate-float-slow" style={{ bottom: '8%', right: '10%' }} />

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center max-w-lg relative z-10"
    >
      {/* 404 number */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="relative mb-6 inline-block"
      >
        <h1
          className="text-[9rem] sm:text-[11rem] font-black leading-none tracking-tighter bg-clip-text text-transparent select-none"
          style={{ backgroundImage: 'var(--grad-brand)' }}
        >
          404
        </h1>

        {/* Floating decorations */}
        <motion.span
          animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute -top-4 -right-6 text-4xl opacity-20 select-none"
        >
          🎙️
        </motion.span>
        <motion.span
          animate={{ rotate: [0, -10, 8, 0], scale: [1, 1.08, 1.04, 1] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute -bottom-2 -left-6 text-3xl opacity-20 select-none"
        >
          💬
        </motion.span>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-heading-1 mb-3">Page not found</h2>
        <p className="text-body max-w-sm mx-auto mb-8">
          The conversation you're looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Link to="/">
          <Button size="lg" className="min-w-[180px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Go Home
          </Button>
        </Link>
        <Button variant="outline" size="lg" className="min-w-[180px]" onClick={() => window.history.back()}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Back
        </Button>
      </motion.div>

      {/* Fun note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-body-sm mt-10"
      >
        ✨ This page is 404% less likely to have voice conversations
      </motion.p>
    </motion.div>
  </div>
);

export default NotFound;
