import { useRef, useCallback, useEffect } from 'react';
import HistoryItem from './HistoryItem';
import { useUserSessions } from '../../../hooks/useSessions';
import Loader from '../../ui/Loader/Loader';

const formatDate = (dateString) => {
  if (!dateString) return 'Just now';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const HistoryList = ({ isOpen }) => {
  const { sessions, isLoading, isLoadingMore, hasMore, loadMore, error } = useUserSessions(1, 10);
  const observer = useRef(null);

  useEffect(() => {
    return () => observer.current?.disconnect();
  }, []);

  const lastRef = useCallback((node) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) loadMore();
    }, { threshold: 0.5 });
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, loadMore]);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4">
        <p className="text-xs text-red-500 dark:text-red-400 font-medium">Failed to load sessions</p>
      </div>
    );
  }

  return (
    <nav aria-label="Recent conversations" className="h-full flex flex-col">
      {isOpen && (
        <p className="text-label pb-2.5 shrink-0 px-1">Recent Chats</p>
      )}

      <div
        className="flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-1"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent',
        }}
      >
        {isLoading ? (
          <div className="flex justify-center pt-8">
            <Loader size="sm" />
          </div>
        ) : sessions.length > 0 ? (
          <>
            {sessions.map((session, idx) => (
              <div
                key={session.id}
                ref={idx === sessions.length - 1 ? lastRef : null}
              >
                <HistoryItem
                  item={{
                    id: session.id,
                    title: session.title || 'New Conversation',
                    date: formatDate(session.date || session.createdAt),
                    createdAt: session.createdAt || session.date,
                    _isNew: session._isNew || false,
                  }}
                  isOpen={isOpen}
                />
              </div>
            ))}

            {isLoadingMore && (
              <div className="py-3 flex justify-center">
                <Loader size="sm" />
              </div>
            )}

            {!hasMore && sessions.length > 3 && isOpen && (
              <p className="py-4 text-center text-[0.6rem] text-gray-400 dark:text-gray-500 tracking-wide uppercase">
                All conversations loaded
              </p>
            )}
          </>
        ) : (
          isOpen && (
            <div className="py-10 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/6 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">No conversations yet</p>
              <p className="text-[0.6rem] text-gray-400 dark:text-gray-500">Start a new chat above</p>
            </div>
          )
        )}
      </div>
    </nav>
  );
};

export default HistoryList;
