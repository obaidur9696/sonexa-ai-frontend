import { forwardRef } from 'react';

const SIZE_MAP = {
  xs:  'btn-xs',
  sm:  'btn-sm',
  md:  'btn-md',
  lg:  'btn-lg',
  xl:  'btn-xl',
  '2xl': 'btn-2xl',
};
const VARIANT_MAP = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  outline:   'btn-outline',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  icon:      'btn-icon',
};

const Spinner = ({ size }) => {
  const dim = { xs: 'w-3 h-3', sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-4 h-4', xl: 'w-5 h-5' }[size] ?? 'w-4 h-4';
  return (
    <svg className={`animate-spin ${dim} shrink-0`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

const Button = forwardRef(({
  children,
  type      = 'button',
  variant   = 'primary',
  size      = 'md',
  className = '',
  disabled  = false,
  loading   = false,
  fullWidth = false,
  onClick,
  ...rest
}, ref) => {
  const classes = [
    'btn',
    SIZE_MAP[size]       ?? 'btn-md',
    VARIANT_MAP[variant] ?? 'btn-primary',
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size={size} />}
      {loading && <span className="sr-only">Loading</span>}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
