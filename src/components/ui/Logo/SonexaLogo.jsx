/* Sonexa AI — Universal Logo Component
   Single source of truth for all logo instances across the application
*/

const SonexaLogo = ({
  size = 32,           // Size in pixels (affects icon + text proportionally)
  showText = true,     // Whether to show "Sonexa AI" text
  textVariant = 'full', // 'full' shows both lines, 'compact' shows single line
  className = '',
  iconOnly = false,    // Overrides showText to false
}) => {
  // Icon size calculation (text scales proportionally)
  const iconSize = size;
  const textSize = Math.max(size * 0.35, 12);
  const subTextSize = Math.max(size * 0.22, 9);

  // Determine if we should show text
  const shouldShowText = !iconOnly && showText;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Mark - Gradient Square with Waveform */}
      <div
        className="relative shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105"
        style={{
          width: iconSize,
          height: iconSize,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #9333ea 100%)',
          borderRadius: Math.round(iconSize * 0.28),
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
        }}
      >
        {/* Waveform Icon */}
        <svg
          width={iconSize * 0.58}
          height={iconSize * 0.58}
          viewBox="0 0 24 24"
          fill="none"
          className="transition-all duration-300"
        >
          {/* Sound waves / AI representation */}
          <path
            d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.92"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {shouldShowText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold tracking-[-0.02em] text-gray-900 dark:text-white whitespace-nowrap"
            style={{ fontSize: textSize }}
          >
            Sonexa
          </span>
          <span
            className="font-semibold tracking-[0.12em] uppercase whitespace-nowrap"
            style={{
              fontSize: subTextSize,
              color: '#7c3aed',
              marginTop: textVariant === 'compact' ? '-2px' : '0',
            }}
          >
            AI
          </span>
        </div>
      )}

      {/* Compact single-line text variant */}
      {shouldShowText && textVariant === 'compact' && (
        <span
          className="font-bold tracking-[-0.02em] text-gray-900 dark:text-white whitespace-nowrap"
          style={{ fontSize: textSize }}
        >
          Sonexa<span style={{ color: '#7c3aed' }}>AI</span>
        </span>
      )}
    </div>
  );
};

export default SonexaLogo;