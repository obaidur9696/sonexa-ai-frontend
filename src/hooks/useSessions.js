import { useDispatch } from 'react-redux';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  useGetUserSessionsQuery,
  useGetSessionByIdQuery,
  useRenameSessionMutation,
  useDeleteSessionMutation,
  useGetGlobalSessionStatsQuery,
} from '../store/api/sessionApi';
import { sessionApi } from '../store/api/sessionApi';
import { useAuth } from '../providers/AuthProvider';
import toast from 'react-hot-toast';

/* ─── Get User Sessions (paginated + infinite scroll) ─── */
export const useUserSessions = (initialPage = 1, limit = 10) => {
  const [page, setPage] = useState(initialPage);
  const { user } = useAuth();

  const { data, isLoading, isFetching, error, refetch } =
    useGetUserSessionsQuery({ page, limit }, { skip: !user });

  const sessions = data?.sessions ?? [];
  const pagination = data?.pagination;
  const hasMore = pagination ? page < pagination.pages : true;

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) setPage((p) => p + 1);
  }, [hasMore, isFetching]);

  return {
    sessions,
    isLoading: isLoading && page === 1,
    isLoadingMore: isFetching && page > 1,
    error,
    hasMore,
    loadMore,
    refresh: refetch,
  };
};

/* ─── Pending Session Poller ─────────────────────────────── */

export const usePendingSessionPoller = ({ connectionState, sessionId }) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);
  const initialDelay = useRef(null);
  const giveUpRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (connectionState !== 'ended') return;
    if (doneRef.current) return;
    if (!sessionId) return;

    localStorage.setItem('pendingSessionId', sessionId);
    localStorage.setItem('pendingSessionStarted', Date.now().toString());

    console.log('[PendingSessionPoller] 🚀 Starting polling for session:', sessionId);

    const poll = async () => {
      try {
        const result = await dispatch(
          sessionApi.endpoints.getSessionById.initiate(sessionId, { forceRefetch: true })
        );

        if (result?.error) {
          console.log('[PendingSessionPoller] Session not found yet, continuing...');
          return;
        }

        const session = result?.data;
        if (!session) return;

        console.log('[PendingSessionPoller] Session status:', session.status, 'Title:', session.title);

        // ✅ Add/update session in cache
        dispatch(
          sessionApi.util.updateQueryData('getUserSessions', undefined, (draft) => {
            if (!draft?.sessions) return;

            // ✅ More reliable check
            const alreadyThere = draft.sessions.some((s) => String(s.id) === String(session.id));
            if (!alreadyThere) {
              draft.sessions.unshift({ ...session, _isNew: true });
            } else {
              // ✅ If exists, update it instead of adding duplicate
              const index = draft.sessions.findIndex((s) => String(s.id) === String(session.id));
              if (index !== -1) {
                draft.sessions[index] = { ...session, _isNew: false };
              }
            }
          })
        );

        // ✅ If session is ENDED, stop polling
        if (session.status === 'ended') {
          console.log('[PendingSessionPoller] ✅ Session ended! Final title:', session.title);

          localStorage.removeItem('pendingSessionId');
          localStorage.removeItem('pendingSessionStarted');

          clearInterval(intervalRef.current);
          clearTimeout(giveUpRef.current);
          intervalRef.current = null;
          giveUpRef.current = null;
          doneRef.current = true;
        } else {
          console.log('[PendingSessionPoller] Session still active, continuing polling...');
        }
      } catch (error) {
        console.log('[PendingSessionPoller] Error:', error.message);
      }
    };

    initialDelay.current = setTimeout(() => {
      poll();
      intervalRef.current = setInterval(poll, 4000);
    }, 2000);

    giveUpRef.current = setTimeout(() => {
      console.log('[PendingSessionPoller] ⏰ Giving up after 30s');
      localStorage.removeItem('pendingSessionId');
      localStorage.removeItem('pendingSessionStarted');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }, 30_000);

    return () => {
      if (doneRef.current) {
        clearTimeout(initialDelay.current);
        clearInterval(intervalRef.current);
        clearTimeout(giveUpRef.current);
        initialDelay.current = null;
        intervalRef.current = null;
        giveUpRef.current = null;
      }
    };
  }, [connectionState, sessionId, dispatch]);
};

/* ─── Get Single Session ─────────────────────────────── */
export const useSession = (sessionId) => {
  const { user } = useAuth();

  const { data: session, isLoading, error, refetch } = useGetSessionByIdQuery(
    sessionId,
    { skip: !sessionId || !user, refetchOnMountOrArgChange: true, refetchOnFocus: true, }
  );

  return {
    session,
    isLoading,
    error,
    refetch,
    isEmpty: !session?.messages?.length,
  };
};

/* ─── Rename Session ─────────────────────────────────── */
export const useRenameSession = () => {
  const [renameSession, { isLoading }] = useRenameSessionMutation();

  const rename = async (sessionId, newTitle) => {
    if (!newTitle?.trim()) {
      toast.error('Title cannot be empty');
      return { success: false };
    }
    try {
      const result = await renameSession({ sessionId, title: newTitle.trim() }).unwrap();
      toast.success('Session renamed');
      return { success: true, data: result };
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to rename session');
      return { success: false, error };
    }
  };

  return { rename, isLoading };
};

/* ─── Delete Session ─────────────────────────────────── */
export const useDeleteSession = () => {
  const [deleteSession, { isLoading }] = useDeleteSessionMutation();

  const deleteSessionById = async (sessionId) => {
    try {
      await deleteSession(sessionId).unwrap();
      toast.success('Session deleted');
      return { success: true };
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete session');
      return { success: false, error };
    }
  };

  return { deleteSession: deleteSessionById, isLoading };
};

/* ─── Get Global Session Stats ─────────────────────────────── */
/* ─── Get Global Session Stats ─────────────────────────────── */
export const useGlobalSessionStats = () => {
  const { data, isLoading, error, refetch } = useGetGlobalSessionStatsQuery();

  return {
    globalSessionStats: data,  // ← Renamed from 'stats'
    isLoading,
    error,
    refetch,
  };
};


/* ─── Session Stats ──────────────────────────────────── */
export const useSessionStats = () => {
  const { sessions, isLoading } = useUserSessions(1, 100);

  const totalSessions = sessions.length;
  const totalTalkTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const averageDuration = totalSessions
    ? Math.round(totalTalkTime / totalSessions)
    : 0;

  return {
    totalSessions,
    totalTalkTime: Math.round(totalTalkTime / 60),
    averageDuration: Math.round(averageDuration / 60),
    isLoading,
  };
};