import { useEffect, useRef } from 'react';
import SidebarHeader from './SidebarHeader';
import NewChatButton from './NewChatButton';
import HistoryList   from './HistoryList';
import BottomMenu    from './BottomMenu';

const SidebarContent = ({ isOpen, onToggle, showToggle, onClose }) => (
  <div className="flex flex-col h-full overflow-visible">
    <SidebarHeader isOpen={isOpen} onToggle={onToggle ?? onClose} showToggle={showToggle} />

    <div className="px-3 pt-3 shrink-0">
      <NewChatButton isOpen={isOpen} />
    </div>

    {/* History — only when open */}
    {isOpen && (
      <div className="flex-1 min-h-0 px-3 pt-4 overflow-hidden">
        <HistoryList isOpen={isOpen} />
      </div>
    )}

    {/* Spacer when closed */}
    {!isOpen && <div className="flex-1" />}

    <div className="shrink-0 px-3 pb-3 pt-2 border-t border-gray-100 dark:border-white/6">
      <BottomMenu isOpen={isOpen} />
    </div>
  </div>
);

const Sidebar = ({ isMobile, isOpen, mobileOpen, onToggleDesktop, onMobileClose }) => {
  const mobilePanelRef = useRef(null);

  const handleMobilePanelKeyDown = (event) => {
    if (event.key !== 'Tab') return;
    const focusable = mobilePanelRef.current?.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (document.activeElement === mobilePanelRef.current) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    if (!isMobile || !mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => mobilePanelRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onMobileClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, mobileOpen, onMobileClose]);

  if (isMobile) {
    if (!mobileOpen) return null;
    return (
      <>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={onMobileClose}
        />
        <aside
          ref={mobilePanelRef}
          id="mobile-sidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar navigation"
          tabIndex={-1}
          onKeyDown={handleMobilePanelKeyDown}
          className="fixed left-0 top-0 z-50 h-full w-64 overflow-visible border-r border-gray-100 bg-white shadow-xl outline-none animate-slide-left dark:border-white/6 dark:bg-gray-950"
        >
          <SidebarContent isOpen={true} onClose={onMobileClose} showToggle />
        </aside>
      </>
    );
  }

  return (
    <aside
      aria-label="Sidebar navigation"
      className="fixed left-0 top-0 z-40 flex h-full flex-col overflow-visible border-r border-gray-100 bg-white transition-all duration-300 ease-smooth dark:border-white/6 dark:bg-gray-950"
      style={{ width: isOpen ? '16rem' : '4.5rem' }}
    >
      <SidebarContent
        isOpen={isOpen}
        onToggle={onToggleDesktop}
        showToggle={true}
      />
    </aside>
  );
};

export default Sidebar;
