import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button/Button';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title       = 'Are you sure?',
  message     = '',
  confirmText = 'Confirm',
  cancelText  = 'Cancel',
  variant     = 'danger',   // 'danger' | 'primary'
  isLoading   = false,
  showInput   = false,      // New prop for rename
  inputValue  = '',         // Current value for rename
  onInputChange = null,     // Callback for input change
  inputPlaceholder = '',    // Placeholder for input
}) => {
  const [localValue, setLocalValue] = useState(inputValue);

  // Update local value when inputValue prop changes
  useEffect(() => {
    setLocalValue(inputValue);
  }, [inputValue]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    // For rename: send the current local value to parent before confirming
    if (showInput && onInputChange) {
      onInputChange(localValue);
    }
    // Call the confirm action (delete or rename API call)
    onConfirm();
    // Close modal
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    // Immediately update parent state while typing
    if (showInput && onInputChange) {
      onInputChange(newValue);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 dark:bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 z-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${
              variant === 'danger'
                ? 'bg-red-100 dark:bg-red-500/12'
                : 'bg-indigo-100 dark:bg-indigo-500/12'
            }`}>
              {variant === 'danger' ? (
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>

            {/* Input field for rename */}
            {showInput && (
              <input
                type="text"
                value={localValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={inputPlaceholder}
                autoFocus
                className="w-full mb-6 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            )}

            <div className="flex items-center gap-3 justify-end">
              <Button variant="ghost" size="md" onClick={onClose} disabled={isLoading}>
                {cancelText}
              </Button>
              <Button
                variant={variant}
                size="md"
                loading={isLoading}
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;