import { useEffect, useId, useRef, useState } from 'react';
import {
  CheckIcon,
  getSelectOptionClasses,
  getSelectTriggerClasses,
  SelectChevron,
  selectMenuClasses,
} from '../Select/selectStyles';

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  label,
  error,
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];

  const focusOption = (index) => {
    window.requestAnimationFrame(() => optionRefs.current[index]?.focus());
  };

  const openDropdown = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    if (disabled || options.length === 0) return;
    setIsOpen(true);
    focusOption(index);
  };

  const closeDropdown = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const selectOption = (option) => {
    onChange(option);
    closeDropdown(true);
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

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeDropdown(true);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openDropdown(selectedIndex >= 0 ? selectedIndex : 0);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openDropdown(selectedIndex >= 0 ? selectedIndex : options.length - 1);
    }
  };

  const handleOptionKeyDown = (event, index, option) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusOption((index + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption((index - 1 + options.length) % options.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusOption(options.length - 1);
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
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listId : undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error) || undefined}
        className={getSelectTriggerClasses({ error, disabled })}
      >
        <span className={selectedOption ? 'truncate text-gray-900 dark:text-gray-100' : 'truncate text-gray-400 dark:text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <SelectChevron open={isOpen} />
      </button>

      {isOpen && (
        <div id={listId} role="listbox" aria-labelledby={label ? labelId : undefined} className={selectMenuClasses}>
          <div className="max-h-56 overflow-y-auto py-1">
            {options.map((option, index) => {
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
                  className={`flex items-center gap-2 ${getSelectOptionClasses(isSelected)}`}
                >
                  {isSelected ? <CheckIcon /> : <span className="w-3.5 shrink-0" />}
                  <span className="min-w-0 whitespace-normal break-words">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p id={errorId} className="field-error mt-1">{error}</p>}
    </div>
  );
};

export default Dropdown;
