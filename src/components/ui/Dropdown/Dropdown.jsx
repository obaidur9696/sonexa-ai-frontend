import { useState, useRef, useEffect } from 'react';

const ChevronIcon = ({ open }) => (
  <svg
    className={`w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  label,
  error,
  disabled  = false,
  fullWidth = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${fullWidth ? 'w-full' : 'w-64'} ${className}`}>
      {label && <label className="field-label mb-1.5 block">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(o => !o)}
        className={[
          'input w-full flex items-center justify-between gap-2 text-left cursor-pointer',
          error    ? 'input-error' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].filter(Boolean).join(' ')}
        style={{ paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
      >
        <span className={selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-lg dark:shadow-dark-lg overflow-hidden animate-scale-in origin-top">
          <div className="max-h-56 overflow-y-auto py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={[
                  'w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 transition-colors duration-150',
                  opt.value === value
                    ? 'bg-indigo-50 dark:bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5',
                ].join(' ')}
              >
                {opt.value === value && (
                  <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" />
                  </svg>
                )}
                {opt.value !== value && <span className="w-3.5 shrink-0" />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="field-error mt-1">{error}</p>}
    </div>
  );
};

export default Dropdown;
