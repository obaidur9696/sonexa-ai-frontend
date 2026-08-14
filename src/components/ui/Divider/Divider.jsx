const Divider = ({
  label,
  orientation = 'horizontal',
  spacing     = '4',
  className   = '',
}) => {
  if (orientation === 'vertical') {
    return <div className={`h-full w-px mx-${spacing} bg-gray-200 dark:bg-white/8 ${className}`} />;
  }

  if (label) {
    return (
      <div className={`flex items-center gap-3 my-${spacing} ${className}`}>
        <div className="divider flex-1" />
        <span className="text-label">{label}</span>
        <div className="divider flex-1" />
      </div>
    );
  }

  return <div className={`divider my-${spacing} ${className}`} />;
};

export default Divider;
