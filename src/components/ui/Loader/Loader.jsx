const Loader = ({ size = 'md', fullScreen = false, text, className = '' }) => {
  const ring = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
    xl: 'w-16 h-16 border-4',
  }[size] ?? 'w-8 h-8 border-2';

  const spinner = (
    <div aria-hidden="true" className={`animate-spin rounded-full border-indigo-500/25 border-t-indigo-600 dark:border-indigo-400/25 dark:border-t-indigo-400 ${ring} ${className}`} />
  );

  if (fullScreen) {
    return (
      <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-sm">
        {spinner}
        <span className="sr-only">{text || 'Loading'}</span>
        {text && <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">{text}</p>}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
      {spinner}
      <span className="sr-only">{text || 'Loading'}</span>
      {text && <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{text}</p>}
    </div>
  );
};

export default Loader;
