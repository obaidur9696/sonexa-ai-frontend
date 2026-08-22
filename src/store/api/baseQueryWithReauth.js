import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API slices have independent base-query instances. Keeping refresh promises in
// module scope makes concurrent 401 responses share one refresh request.
const refreshRequests = new Map();

export const createBaseQueryWithReauth = (baseUrl = apiBaseUrl) => {
  const baseQuery = fetchBaseQuery({ baseUrl, credentials: 'include' });

  return async (args, api, extraOptions = {}) => {
    let result = await baseQuery(args, api, extraOptions);
    const requestUrl = typeof args === 'string' ? args : args?.url;

    if (
      result.error?.status !== 401 ||
      requestUrl === '/v1/users/refresh-token' ||
      extraOptions.skipReauth
    ) {
      return result;
    }

    let refreshRequest = refreshRequests.get(baseUrl);
    if (!refreshRequest) {
      refreshRequest = baseQuery(
        { url: '/v1/users/refresh-token', method: 'POST' },
        api,
        { ...extraOptions, skipReauth: true }
      ).finally(() => refreshRequests.delete(baseUrl));
      refreshRequests.set(baseUrl, refreshRequest);
    }

    const refreshResult = await refreshRequest;
    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions);
    }

    return result;
  };
};
