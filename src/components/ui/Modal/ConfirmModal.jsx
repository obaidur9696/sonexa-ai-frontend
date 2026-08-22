import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../Button/Button';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  showInput = false,
  inputValue = '',
  onInputChange = null,
  inputPlaceholder = '',
}) => {
  const [localValue, setLocalValue] = useState(inputValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const id = useId();
  const titleId = `${id}-title`;
  const messageId = `${id}-message`;
  const busy = isLoading || isSubmitting;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    setLocalValue(inputValue);
  }, [inputValue]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => {
      (showInput ? inputRef.current : cancelButtonRef.current || dialogRef.current)?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busyRef.current) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose, showInput]);

  const handleConfirm = async () => {
    if (busy) return;

    setIsSubmitting(true);
    try {
      await onConfirm(showInput ? localValue : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setLocalValue(nextValue);
    onInputChange?.(nextValue);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close dialog"
            className="absolute inset-0 cursor-default bg-black/50 dark:bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !busy && onClose()}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={message ? messageId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl dark:border-white/8 dark:bg-gray-900 sm:p-6"
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${
              variant === 'danger' ? 'bg-red-100 dark:bg-red-500/12' : 'bg-indigo-100 dark:bg-indigo-500/12'
            }`}>
              {variant === 'danger' ? (
                <svg aria-hidden="true" className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : (
                <svg aria-hidden="true" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )}
            </div>

            <h3 id={titleId} className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            {message && <p id={messageId} className="mb-4 text-sm text-gray-600 dark:text-gray-400">{message}</p>}

            <form onSubmit={(event) => { event.preventDefault(); handleConfirm(); }}>
              {showInput && (
                <input
                  ref={inputRef}
                  type="text"
                  value={localValue}
                  onChange={handleInputChange}
                  placeholder={inputPlaceholder}
                  aria-label={inputPlaceholder || title}
                  disabled={busy}
                  className="input mb-6 w-full"
                />
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <Button ref={cancelButtonRef} type="button" variant="ghost" size="md" onClick={onClose} disabled={busy}>
                  {cancelText}
                </Button>
                <Button type="submit" variant={variant} size="md" loading={busy}>
                  {confirmText}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
