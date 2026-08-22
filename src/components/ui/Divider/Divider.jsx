const Divider = ({
  label,
  orientation = 'horizontal',
  spacing     = '4',
  className   = '',
}) => {
  const spacingClasses = {
    2: { horizontal: 'my-2', vertical: 'mx-2' },
    3: { horizontal: 'my-3', vertical: 'mx-3' },
    4: { horizontal: 'my-4', vertical: 'mx-4' },
    5: { horizontal: 'my-5', vertical: 'mx-5' },
    6: { horizontal: 'my-6', vertical: 'mx-6' },
  }[spacing] ?? { horizontal: 'my-4', vertical: 'mx-4' };

  if (orientation === 'vertical') {
    return <div role="separator" aria-orientation="vertical" className={`h-full w-px ${spacingClasses.vertical} bg-gray-200 dark:bg-white/8 ${className}`} />;
  }

  if (label) {
    return (
      <div className={`flex items-center gap-3 ${spacingClasses.horizontal} ${className}`}>
        <div className="divider flex-1" />
        <span className="text-label">{label}</span>
        <div className="divider flex-1" />
      </div>
    );
  }

  return <div role="separator" className={`divider ${spacingClasses.horizontal} ${className}`} />;
};

export default Divider;
