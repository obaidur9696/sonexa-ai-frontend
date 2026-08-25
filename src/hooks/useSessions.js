import { useState, useCallback } from 'react';
import {
  useGetUserSessionsQuery,
  useGetSessionByIdQuery,
  useRenameSessionMutation,
  useDeleteSessionMutation,
  useGetGlobalSessionStatsQuery,
} from '../store/api/sessionApi';
import { useAuth } from '../providers/AuthProvider';
import toast from 'react-hot-toast';

/* ─── Get User Sessions (paginated + infinite scroll) ─── */
export const useUserSessions = (initialPage = 1, limit = 10) => {
  const [page, setPage] = useState(initialPage);
  const { user } = useAuth();

  const { data, isLoading, isFetching, error, refetch } =
    useGetUserSessionsQuery(
      { page, limit },
      { skip: !user, refetchOnFocus: true }
    );

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

/* ─── Get Single Session ─────────────────────────────── */
export const useSession = (sessionId) => {
  const { user } = useAuth();

  const { data: session, isLoading, error, refetch } = useGetSessionByIdQuery(
    sessionId,
    { skip: !sessionId || !user, refetchOnFocus: true }
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
