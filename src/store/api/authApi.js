import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from './baseQueryWithReauth';

const baseQueryWithReauth = createBaseQueryWithReauth(import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({ url: '/v1/users/register', method: 'POST', body: userData }),
    }),
    login: builder.mutation({
      query: (credentials) => ({ url: '/v1/users/login', method: 'POST', body: credentials }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/v1/users/logout', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    getCurrentUser: builder.query({
      query: () => '/v1/users/current-user',
      providesTags: ['User'],
    }),
    updateAccount: builder.mutation({
      query: (userData) => ({ url: '/v1/users/update-account', method: 'PATCH', body: userData }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateAccountMutation,
} = authApi;