import { useId } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

const PasswordField = ({ label, name, value, onChange, onBlur, error, placeholder, show, onToggle, autoComplete }) => {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">{label}<span className="ml-0.5 font-normal normal-case tracking-normal text-red-500">*</span></label>
      <div className="relative">
        <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input id={id} name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} autoComplete={autoComplete} required aria-invalid={Boolean(error) || undefined} aria-describedby={error ? errorId : undefined} className={`input w-full pl-10 pr-11 ${error ? 'input-error' : ''}`} style={{ paddingLeft: '2.75rem' }} />
        <button type="button" onClick={onToggle} aria-label={`${show ? 'Hide' : 'Show'} ${label.toLowerCase()}`} className="absolute right-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 dark:text-gray-500 dark:hover:bg-white/10 dark:hover:text-gray-200">
          {show ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  );
};

export default PasswordField;
