export const getSelectTriggerClasses = ({ error, disabled }) => [
  'input w-full flex items-center justify-between gap-2 text-left',
  error ? 'input-error' : '',
  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
].filter(Boolean).join(' ');

export const selectMenuClasses =
  'absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg animate-scale-in origin-top dark:border-white/10 dark:bg-gray-900';

export const getSelectOptionClasses = (selected) => [
  'w-full px-3.5 py-2.5 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:bg-indigo-50 dark:focus-visible:bg-indigo-500/12',
  selected
    ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/12 dark:text-indigo-300'
    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5',
].join(' ');

export const SelectChevron = ({ open }) => (
  <svg
    aria-hidden="true"
    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const CheckIcon = () => (
  <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" />
  </svg>
);
