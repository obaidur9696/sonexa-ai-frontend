import { AlertCircle, Check, LoaderCircle, Mic, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_CONTENT = {
  checking: {
    title: 'Checking microphone access',
    description: 'We will make sure everything is ready before your conversation begins.',
  },
  prompt: {
    title: 'Enable your microphone',
    description: 'Please allow microphone access to start your conversation.',
  },
  granted: {
    title: 'Microphone ready',
    description: 'Your voice is ready for a smooth conversation.',
  },
  denied: {
    title: 'Microphone is blocked',
    description: 'Allow microphone access for this site in browser settings, then try again.',
  },
  unavailable: {
    title: 'Microphone unavailable',
    description: 'This browser does not support microphone access.',
  },
  error: {
    title: 'Could not access microphone',
    description: 'Check that another app is not using it, then try again.',
  },
};

const MicrophoneAccess = ({ status, onRequest }) => {
  const content = STATUS_CONTENT[status] ?? STATUS_CONTENT.prompt;
  const isReady = status === 'granted';
  const isChecking = status === 'checking';
  const isBlocked = status === 'denied' || status === 'unavailable' || status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex flex-col gap-3 rounded-2xl border p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4 ${
        isReady
          ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10'
          : isBlocked
            ? 'border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/10'
            : 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-500/10'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isReady
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
            : isBlocked
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
        }`}>
          {isReady ? <Check aria-hidden="true" className="h-5 w-5" /> : isChecking ? <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" /> : isBlocked ? <AlertCircle aria-hidden="true" className="h-5 w-5" /> : <Mic aria-hidden="true" className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{content.title}</p>
          <p className="mt-0.5 text-xs leading-5 text-gray-600 dark:text-gray-400">{content.description}</p>
        </div>
      </div>

      {isReady ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 sm:self-auto">
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" /> Ready
        </span>
      ) : status !== 'unavailable' && (
        <button
          type="button"
          onClick={onRequest}
          disabled={isChecking}
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-wait disabled:opacity-60 dark:border-indigo-400/20 dark:bg-gray-900 dark:text-indigo-300 dark:hover:border-indigo-300/40 dark:hover:bg-indigo-500/15 sm:self-auto"
        >
          {status === 'denied' || status === 'error' ? 'Try again' : 'Enable microphone'}
        </button>
      )}
    </motion.div>
  );
};

export default MicrophoneAccess;
