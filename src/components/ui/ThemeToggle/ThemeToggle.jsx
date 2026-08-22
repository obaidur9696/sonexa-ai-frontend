import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../providers/ThemeProvider';

const ThemeToggle = ({ compact = false, showTooltip = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      onFocus={() => setIsTooltipVisible(true)}
      onBlur={() => setIsTooltipVisible(false)}
      aria-label={label}
      title={label}
      className={`group relative inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-400/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
    >
      <Icon
        aria-hidden="true"
        className="h-4 w-4 transition-transform duration-300 ease-out group-hover:rotate-12 group-active:scale-90"
      />
      {showTooltip && isTooltipVisible && (
        <span role="tooltip" className="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-gray-700">
          {label}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
