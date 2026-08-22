import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SonexaLogo from '../../ui/Logo/SonexaLogo';
import ThemeToggle from '../../ui/ThemeToggle/ThemeToggle';


const SidebarHeader = ({ isOpen, onToggle, showToggle = true }) => {
  const btnRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const handleEnter = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltip({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
      text: isOpen ? 'Close sidebar' : 'Open sidebar',
    });
  };

  const handleLeave = () => setTooltip(null);

  return (
    <div
      className={`flex items-center h-14 px-3 border-b border-gray-100 dark:border-white/6 shrink-0 ${isOpen ? 'justify-between' : 'justify-center'
        }`}
    >
      {/* Logo */}
      {isOpen && (
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center gap-3">
            <SonexaLogo size={30} showText={true} />
          </div>
        </Link>
      )}

      {!isOpen && !showToggle && (
        <Link to="/" aria-label="Sonexa AI home">
          <SonexaLogo />
        </Link>
      )}

      {/* Toggle */}
      {showToggle && (
        <>
          <div className="flex items-center gap-1">
            {isOpen && <ThemeToggle compact showTooltip />}
            <button
              ref={btnRef}
              type="button"
              onClick={onToggle}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              onFocus={handleEnter}
              onBlur={handleLeave}
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* 🔥 GLOBAL TOOLTIP (PORTAL) */}
          {tooltip &&
            createPortal(
              <div
                role="tooltip"
                className="fixed px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gray-900/95 dark:bg-gray-700/95 backdrop-blur-md shadow-xl transition-opacity duration-150"
                style={{
                  top: tooltip.top,
                  left: tooltip.left,
                  transform: 'translateY(-50%)',
                  zIndex: 9999999,
                }}
              >
                {tooltip.text}
              </div>,
              document.body
            )}
        </>
      )}
    </div>
  );
};

export default SidebarHeader;
