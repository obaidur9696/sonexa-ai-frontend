import { forwardRef } from 'react';

const RangeSlider = forwardRef(({
  label,
  value,
  onChange,
  min       = 0,
  max       = 100,
  step      = 1,
  disabled  = false,
  fullWidth = false,
  showValue = true,
  valueSuffix = '',
  className = '',
  ...rest
}, ref) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-64'} ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="field-label">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {value}{valueSuffix}
            </span>
          )}
        </div>
      )}

      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200 dark:bg-white/10" />

        {/* Filled track */}
        <div
          className="absolute h-1.5 rounded-full left-0"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #4f46e5, #9333ea)',
          }}
        />

        {/* Thumb */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white dark:bg-gray-100 border-2 border-indigo-600 dark:border-indigo-400 shadow-md pointer-events-none transition-transform duration-100"
          style={{ left: `calc(${pct}% - 8px)` }}
        />

        {/* Native input (invisible but interactive) */}
        <input
          ref={ref}
          type="range"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          {...rest}
        />
      </div>
    </div>
  );
});

RangeSlider.displayName = 'RangeSlider';
export default RangeSlider;
