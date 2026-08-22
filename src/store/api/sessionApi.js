import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseUrl, createBaseQueryWithReauth } from './baseQueryWithReauth';

const baseQueryWithReauth = createBaseQueryWithReauth(apiBaseUrl);
const listCacheArg = { page: 1, limit: 10, status: 'ended' };

export const sessionApi = createApi({
  reducerPath: 'sessionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Sessions', 'Session', 'SessionStats'],
  endpoints: (builder) => ({
    getUserSessions: builder.query({
      query: ({ page = 1, limit = 10, status = 'ended' } = {}) => ({
        url: '/v1/sessions',
        params: { page, limit, status },
      }),
      transformResponse: (response) => response.data,
      // Pages intentionally share a cache entry for an infinite list, but
      // distinct filters and page sizes must never share it.
      serializeQueryArgs: ({ endpointName, queryArgs = {} }) => {
        const { limit = 10, status = 'ended' } = queryArgs;
        return `${endpointName}:${status}:${limit}`;
      },
      merge: (currentCache, newData, { arg }) => {
        if (!currentCache || (arg?.page ?? 1) === 1) return newData;

        const existingIds = new Set((currentCache.sessions ?? []).map((session) => String(session.id)));
        const uniqueIncoming = (newData.sessions ?? []).filter(
          (session) => !existingIds.has(String(session.id))
        );

        currentCache.sessions ??= [];
        currentCache.sessions.push(...uniqueIncoming);
        currentCache.pagination = newData.pagination;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: (result) => [
        ...(result?.sessions ?? []).map(({ id }) => ({ type: 'Session', id })),
        { type: 'Sessions', id: 'LIST' },
      ],
      keepUnusedDataFor: 300,
    }),

    getSessionById: builder.query({
      query: (sessionId) => `/v1/sessions/${sessionId}`,
      transformResponse: (response) => response.data,
      providesTags: (_, __, sessionId) => [{ type: 'Session', id: sessionId }],
      keepUnusedDataFor: 300,
    }),

    renameSession: builder.mutation({
      query: ({ sessionId, title }) => ({
        url: `/v1/sessions/${sessionId}/rename`,
        method: 'PATCH',
        body: { title },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (_, __, { sessionId }) => [{ type: 'Session', id: sessionId }],
      async onQueryStarted({ sessionId, title }, { dispatch, queryFulfilled }) {
        const listPatch = dispatch(
          sessionApi.util.updateQueryData('getUserSessions', listCacheArg, (draft) => {
            const session = draft?.sessions?.find((item) => String(item.id) === String(sessionId));
            if (session) session.title = title;
          })
        );
        const detailPatch = dispatch(
          sessionApi.util.updateQueryData('getSessionById', sessionId, (draft) => {
            if (draft) draft.title = title;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          listPatch.undo();
          detailPatch.undo();
        }
      },
    }),

    deleteSession: builder.mutation({
      query: (sessionId) => ({ url: `/v1/sessions/${sessionId}`, method: 'DELETE' }),
      transformResponse: (response) => response.data,
      // Deleting changes page boundaries, so the active list must reconcile
      // with the server after its optimistic removal.
      invalidatesTags: (_, __, sessionId) => [
        { type: 'Session', id: sessionId },
        { type: 'Sessions', id: 'LIST' },
        { type: 'SessionStats', id: 'GLOBAL' },
      ],
      async onQueryStarted(sessionId, { dispatch, queryFulfilled }) {
        const listPatch = dispatch(
          sessionApi.util.updateQueryData('getUserSessions', listCacheArg, (draft) => {
            if (!draft?.sessions) return;
            const before = draft.sessions.length;
            draft.sessions = draft.sessions.filter((session) => String(session.id) !== String(sessionId));
            if (draft.sessions.length !== before && draft.pagination?.total != null) {
              draft.pagination.total = Math.max(0, draft.pagination.total - 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          listPatch.undo();
        }
      },
    }),

    getGlobalSessionStats: builder.query({
      query: () => '/v1/sessions/stats/global',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'SessionStats', id: 'GLOBAL' }],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetUserSessionsQuery,
  useGetSessionByIdQuery,
  useRenameSessionMutation,
  useDeleteSessionMutation,
  useGetGlobalSessionStatsQuery,
} = sessionApi;
