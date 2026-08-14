import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from './baseQueryWithReauth';

const baseQueryWithReauth = createBaseQueryWithReauth(import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

export const sessionApi = createApi({
  reducerPath: 'sessionApi',
  baseQuery: baseQueryWithReauth,  // Use the shared base query with reauth
  tagTypes: ['Sessions', 'Session'],
  endpoints: (builder) => ({
    getUserSessions: builder.query({
      query: ({ page = 1, limit = 10, status = 'ended' }) => ({
        url: '/v1/sessions',
        params: { page, limit, status },
      }),
      transformResponse: (response) => response.data,
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newData, { arg }) => {
    if (!currentCache || arg.page === 1) return newData;
    
    // ✅ Prevent duplicates by checking existing ids
    const existingIds = new Set(currentCache.sessions.map(s => s.id));
    const newSessions = newData.sessions.filter(s => !existingIds.has(s.id));
    
    currentCache.sessions.push(...newSessions);
    currentCache.pagination = newData.pagination;
},
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: (result) =>
        result?.sessions
          ? [
            ...result.sessions.map(({ id }) => ({ type: 'Session', id })),
            { type: 'Sessions', id: 'LIST' },
          ]
          : [{ type: 'Sessions', id: 'LIST' }],
    }),

    getSessionById: builder.query({
      query: (sessionId) => `/v1/sessions/${sessionId}`,
      providesTags: (result, error, sessionId) => [{ type: 'Session', id: sessionId }],
      transformResponse: (response) => response.data,
    }),

    renameSession: builder.mutation({
      query: ({ sessionId, title }) => ({
        url: `/v1/sessions/${sessionId}/rename`,
        method: 'PATCH',
        body: { title },
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'Session', id: sessionId },
        { type: 'Sessions', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
      async onQueryStarted({ sessionId, title }, { dispatch, queryFulfilled }) {
        // ✅ Update in sessions list
        const patchList = dispatch(
          sessionApi.util.updateQueryData('getUserSessions', { page: 1, limit: 10, status: 'ended' }, (draft) => {
            const session = draft.sessions.find(s => s.id === sessionId);
            if (session) {
              session.title = title; // ✅ Only update title
            }
          })
        );

        // ✅ Update in single session
        const patchSingle = dispatch(
          sessionApi.util.updateQueryData('getSessionById', sessionId, (draft) => {
            if (draft) {
              draft.title = title; // ✅ Only update title
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
          patchSingle.undo();
        }
      },
    }),

    deleteSession: builder.mutation({
      query: (sessionId) => ({
        url: `/v1/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
      transformResponse: (response) => response.data,
      async onQueryStarted(sessionId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          sessionApi.util.updateQueryData('getUserSessions', { page: 1, limit: 10, status: 'ended' }, (draft) => {
            draft.sessions = draft.sessions.filter(s => s.id !== sessionId);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Add this to sessionApi.js endpoints
    getGlobalSessionStats: builder.query({
      query: () => ({
        url: '/v1/sessions/stats/global',
        method: 'GET',
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Sessions'],
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