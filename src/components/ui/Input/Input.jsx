import { forwardRef, useId } from 'react';

const Input = forwardRef(({
  type           = 'text',
  label,
  error,
  hint,
  icon,
  iconPosition   = 'left',
  placeholder,
  value,
  onChange,
  onBlur,
  disabled       = false,
  fullWidth      = false,
  required       = false,
  className      = '',
  inputClassName = '',
  ...rest
}, ref) => {
  const generatedId = useId();
  const inputId = rest.id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const hasError  = Boolean(error);
  const hasIcon   = Boolean(icon);
  const iconLeft  = hasIcon && iconPosition === 'left';
  const iconRight = hasIcon && iconPosition === 'right';

  return (
    <div className={`field-group ${fullWidth ? 'w-full' : 'w-64'} ${className}`}>

      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
          {required && (
            <span className="text-red-500 ml-0.5 normal-case tracking-normal font-normal">*</span>
          )}
        </label>
      )}

      <div className="relative flex items-center">

        {/* Left icon — pointer-events-none so it never blocks input */}
        {iconLeft && (
          <span className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : hint ? hintId : undefined}
          className={[
            'input',
            hasError  ? 'input-error' : '',
            disabled  ? 'opacity-50 cursor-not-allowed' : '',
            fullWidth ? 'w-full' : '',
            inputClassName,
          ].filter(Boolean).join(' ')}
          style={{
            paddingLeft:  iconLeft  ? '2.25rem' : '1rem',
            paddingRight: iconRight ? '2.25rem' : '1rem',
          }}
          {...rest}
        />

        {/* Right icon */}
        {iconRight && (
          <span className="absolute right-3 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center">
            {icon}
          </span>
        )}
      </div>

      {hasError && (
        <p id={errorId} className="field-error">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {hint && !hasError && (
        <p id={hintId} className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
