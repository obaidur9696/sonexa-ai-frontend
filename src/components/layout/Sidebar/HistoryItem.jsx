import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRenameSession, useDeleteSession } from '../../../hooks/useSessions';
import ConfirmModal from '../../ui/Modal/ConfirmModal';

const MessageIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

  // ✅ Typing animation states
  const [displayTitle, setDisplayTitle] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isNewSession, setIsNewSession] = useState(false);
  const typingTimerRef = useRef(null);
  const prevTitleRef = useRef('');

  const menuRef = useRef(null);
  const dotRef = useRef(null);
  const containerRef = useRef(null);

  const isActive = location.pathname === `/session/${item.id}`;

  // ✅ Detect new session from _isNew flag
  useEffect(() => {
    const isNew =
      item._isNew === true ||
      item.title === 'New Conversation' ||
      (item.createdAt && Date.now() - new Date(item.createdAt).getTime() < 5000);
    setIsNewSession(isNew);
  }, [item.title, item.createdAt, item._isNew]);

  // ✅ Handle typing animation ONLY for new sessions
  useEffect(() => {
    const title = item.title || 'New Conversation';
    const prevTitle = prevTitleRef.current;

    // Clear any existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    // ✅ ONLY animate if this is a new session and title changed
    if (isNewSession && prevTitle && prevTitle !== title) {
      setIsTyping(true);
      
      // Step 1: Delete old title with backspace effect
      let deleteIndex = displayTitle.length || prevTitle.length;
      const deleteInterval = setInterval(() => {
        if (deleteIndex > 0) {
          setDisplayTitle(displayTitle.slice(0, deleteIndex - 1));
          deleteIndex--;
        } else {
          clearInterval(deleteInterval);
          
          // Step 2: Type new title
          let typeIndex = 0;
          const typeInterval = setInterval(() => {
            if (typeIndex < title.length) {
              setDisplayTitle(title.slice(0, typeIndex + 1));
              typeIndex++;
            } else {
              clearInterval(typeInterval);
              setIsTyping(false);
              setIsNewSession(false);
            }
          }, 35);
          
          typingTimerRef.current = typeInterval;
        }
      }, 20);
      
      typingTimerRef.current = deleteInterval;
    } 
    // ✅ First time showing (just type it)
    else if (isNewSession && !prevTitle) {
      setIsTyping(true);
      setDisplayTitle('');
      
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < title.length) {
          setDisplayTitle(title.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 50);
      
      typingTimerRef.current = typeInterval;
    }
    // ✅ Normal display (no animation)
    else {
      setDisplayTitle(title);
      setIsTyping(false);
    }

    prevTitleRef.current = title;

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [item.title, isNewSession, displayTitle]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Close menu on click outside
  useEffect(() => {
    const handler = (e) => {
      if (dotRef.current && dotRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ✅ Close menu on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setShowMenu(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    setRenameValue(item.title);
  }, [item.title]);

  const handleClick = (e) => {
    if (e.target.closest('[data-nodirect]')) return;
    navigate(`/session/${item.id}`);
  };

  const handleRename = async () => {
    if (renameValue.trim() && renameValue !== item.title) {
      await rename(item.id, renameValue.trim());
    }
    setShowRenameModal(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    await deleteSession(item.id);
    setShowDeleteModal(false);
    navigate('/');
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(prev => !prev);
  };

  // Collapsed state
  if (!isOpen) {
    return (
      <div className="relative group">
        <button
          onClick={() => navigate(`/session/${item.id}`)}
          title={item.title}
          className={`w-full flex justify-center py-2 rounded-xl transition-all duration-150 ${
            isActive
              ? 'bg-indigo-50 dark:bg-indigo-500/12 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/7 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <MessageIcon className="w-4.5 h-4.5" />
        </button>
        <span className="tooltip tooltip-right line-clamp-1">{item.title}</span>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
          isActive
            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        <MessageIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-500' : 'text-gray-500 dark:text-gray-400'}`} />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate text-gray-800 dark:text-gray-200">
            {displayTitle || item.title || 'New Conversation'}
            {isTyping && (
              <span className="inline-block w-0.5 h-3 ml-0.5 bg-indigo-400 dark:bg-indigo-300 animate-pulse" />
            )}
          </p>
          <p className="text-[0.6rem] text-gray-500 dark:text-gray-400 mt-0.5">{item.date}</p>
        </div>

        {/* Three-dot menu */}
        <div
          ref={dotRef}
          data-nodirect
          className={`shrink-0 transition-opacity duration-200 ${
            isMobile || isHovered || showMenu ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            disabled={isDeleting}
            onClick={toggleMenu}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/12 active:bg-gray-300 dark:active:bg-white/20 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-lg z-50 overflow-hidden py-1"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => { setShowRenameModal(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/8 active:bg-gray-100 dark:active:bg-white/15 transition-colors duration-150 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Rename
                </button>

                <button
                  onClick={() => { setShowDeleteModal(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 active:bg-red-100 dark:active:bg-red-500/20 transition-colors duration-150 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
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
        showInput={true}
        inputValue={renameValue}
        onInputChange={setRenameValue}
        inputPlaceholder="Enter conversation name"
      />
    </>
  );
};

export default HistoryItem;