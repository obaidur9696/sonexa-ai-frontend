import { useEffect, useId, useMemo, useRef, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import {
  CheckIcon,
  getSelectOptionClasses,
  getSelectTriggerClasses,
  SelectChevron,
  selectMenuClasses,
} from '../Select/selectStyles';

const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Search...',
  label,
  error,
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionRefs = useRef([]);
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const selected = options.find((option) => option.value === value);
  const filteredOptions = useMemo(
    () => options.filter((option) => option.label?.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  const closeDropdown = (restoreFocus = false) => {
    setIsOpen(false);
    setSearch('');
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const openDropdown = () => {
    if (!disabled) setIsOpen(true);
  };

  const selectOption = (option) => {
    onChange(option);
    closeDropdown(true);
  };

  const focusOption = (index) => {
    window.requestAnimationFrame(() => optionRefs.current[index]?.focus());
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) closeDropdown();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const handleSearchKeyDown = (event) => {
    if (event.key === 'ArrowDown' && filteredOptions.length) {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === 'ArrowUp' && filteredOptions.length) {
      event.preventDefault();
      focusOption(filteredOptions.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown(true);
    }
  };

  const handleOptionKeyDown = (event, index, option) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusOption((index + 1) % filteredOptions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index === 0) searchInputRef.current?.focus();
      else focusOption(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusOption(filteredOptions.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown(true);
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      selectOption(option);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? 'w-full' : 'w-64'} ${className}`}>
      {label && <span id={labelId} className="field-label mb-1.5 block">{label}</span>}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            openDropdown();
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listId : undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error) || undefined}
        className={getSelectTriggerClasses({ error, disabled })}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2 text-gray-900 dark:text-gray-100">
            {selected.countryCode && <ReactCountryFlag countryCode={selected.countryCode} svg style={{ width: 18, height: 18, borderRadius: 2 }} />}
            <span className="truncate">{selected.label}</span>
          </span>
        ) : (
          <span className="truncate text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
        <SelectChevron open={isOpen} />
      </button>

      {isOpen && (
        <div id={listId} role="listbox" aria-labelledby={label ? labelId : undefined} className={selectMenuClasses}>
          <div className="border-b border-gray-100 p-2 dark:border-white/6">
            <div className="relative">
              <svg aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search..."
                aria-label={`Search ${label || 'options'}`}
                className="input w-full text-sm"
                style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '2.25rem', paddingRight: '0.75rem' }}
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {filteredOptions.length ? filteredOptions.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  ref={(element) => { optionRefs.current[index] = element; }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectOption(option)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index, option)}
                  className={`flex items-center gap-2.5 ${getSelectOptionClasses(isSelected)}`}
                >
                  {option.countryCode && <ReactCountryFlag countryCode={option.countryCode} svg style={{ width: 16, height: 16, borderRadius: 2, flexShrink: 0 }} />}
                  <span className="min-w-0 flex-1 whitespace-normal break-words">{option.label}</span>
                  {isSelected && <span className="ml-auto shrink-0"><CheckIcon /></span>}
                </button>
              );
            }) : (
              <p className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">No results found</p>
            )}
          </div>
        </div>
      )}

      {error && <p id={errorId} className="field-error mt-1">{error}</p>}
    </div>
  );
};

export default SearchableDropdown;
