import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDeleteSession, useRenameSession } from '../../../hooks/useSessions';
import ConfirmModal from '../../ui/Modal/ConfirmModal';

const MessageIcon = ({ className }) => (
  <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const HistoryItem = ({ item, isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { rename, isLoading: isRenaming } = useRenameSession();
  const { deleteSession, isLoading: isDeleting } = useDeleteSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState(item.title);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const isActive = location.pathname === `/session/${item.id}`;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!showMenu) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target) && !menuButtonRef.current?.contains(event.target)) setShowMenu(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu]);

  const openSession = () => navigate(`/session/${item.id}`);

  const handleRename = async (nextTitle = renameValue) => {
    const title = nextTitle.trim();
    if (title && title !== item.title) await rename(item.id, title);
    setShowRenameModal(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    await deleteSession(item.id);
    setShowDeleteModal(false);
    navigate('/');
  };

  if (!isOpen) {
    return (
      <div className="relative group">
        <button
          type="button"
          onClick={openSession}
          title={item.title}
          aria-label={`Open conversation: ${item.title}`}
          aria-current={isActive ? 'page' : undefined}
          className={`flex w-full justify-center rounded-xl py-2 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
            isActive
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/12 dark:text-indigo-400'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/7 dark:hover:text-gray-200'
          }`}
        >
          <MessageIcon className="h-4 w-4" />
        </button>
        <span className="tooltip tooltip-right line-clamp-1">{item.title}</span>
      </div>
    );
  }

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex items-center gap-1 rounded-xl px-1 py-1 transition-all duration-150 ${
          isActive
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
            : 'text-gray-700 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:bg-white/5'
        }`}
      >
        <button
          type="button"
          onClick={openSession}
          aria-current={isActive ? 'page' : undefined}
          aria-label={`Open conversation: ${item.title || 'New Conversation'}`}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 py-1 text-left focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          <MessageIcon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-500' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-gray-800 dark:text-gray-200">{item.title || 'New Conversation'}</span>
            <span className="mt-0.5 block text-[0.6rem] text-gray-500 dark:text-gray-400">{item.date}</span>
          </span>
        </button>

        <div className={`relative shrink-0 transition-opacity duration-200 ${isMobile || isHovered || showMenu ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <button
            ref={menuButtonRef}
            type="button"
            disabled={isDeleting}
            onClick={() => setShowMenu((open) => !open)}
            aria-label={showMenu ? 'Close conversation menu' : 'Open conversation menu'}
            aria-expanded={showMenu}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-200 active:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/12 dark:active:bg-white/20"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-gray-900"
              >
                <button type="button" onClick={() => { setRenameValue(item.title); setShowRenameModal(true); setShowMenu(false); }} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-indigo-50 dark:text-gray-300 dark:hover:bg-white/8 dark:focus-visible:bg-indigo-500/12">
                  <svg aria-hidden="true" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Rename
                </button>
                <button type="button" onClick={() => { setShowDeleteModal(true); setShowMenu(false); }} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 dark:focus-visible:bg-red-500/10">
                  <svg aria-hidden="true" className="h-4 w-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Conversation"
        message="This conversation will be permanently deleted and cannot be recovered."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onConfirm={handleRename}
        title="Rename Conversation"
        message="Enter a new name for this conversation."
        confirmText="Save"
        cancelText="Cancel"
        variant="primary"
        isLoading={isRenaming}
        showInput
        inputValue={renameValue}
        onInputChange={setRenameValue}
        inputPlaceholder="Enter conversation name"
      />
    </>
  );
};

export default HistoryItem;
