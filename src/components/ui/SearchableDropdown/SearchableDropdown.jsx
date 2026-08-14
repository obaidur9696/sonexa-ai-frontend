import { useState, useRef, useEffect } from 'react';
import ReactCountryFlag from 'react-country-flag';

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  label,
  error,
  disabled  = false,
  fullWidth = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  return (
    <div ref={ref} className={`relative ${fullWidth ? 'w-full' : 'w-64'} ${className}`}>
      {label && <label className="field-label mb-1.5 block">{label}</label>}

      {/* Trigger */}
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
        {selected ? (
          <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            {selected.countryCode && (
              <ReactCountryFlag countryCode={selected.countryCode} svg style={{ width: 18, height: 18, borderRadius: 2 }} />
            )}
            {selected.label}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-lg dark:shadow-dark-lg overflow-hidden animate-scale-in origin-top">

          {/* Search bar - FIXED VERSION */}
          <div className="p-2 border-b border-gray-100 dark:border-white/6">
            <div className="relative">
              {/* Search Icon */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Input with proper padding */}
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length > 0 ? filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                className={[
                  'w-full px-3.5 py-2.5 text-sm text-left flex items-center gap-2.5 transition-colors duration-100',
                  opt.value === value
                    ? 'bg-indigo-50 dark:bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5',
                ].join(' ')}
              >
                {opt.countryCode && (
                  <ReactCountryFlag countryCode={opt.countryCode} svg style={{ width: 16, height: 16, borderRadius: 2, shrink: 0 }} />
                )}
                {opt.label}
                {opt.value === value && (
                  <svg className="w-3.5 h-3.5 ml-auto text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" />
                  </svg>
                )}
              </button>
            )) : (
              <div className="px-4 py-6 text-sm text-center text-gray-400 dark:text-gray-500">
                No results found
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="field-error mt-1">{error}</p>}
    </div>
  );
};

export default SearchableDropdown;