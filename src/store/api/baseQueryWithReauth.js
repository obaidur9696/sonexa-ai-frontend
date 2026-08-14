import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const createBaseQueryWithReauth = (baseUrl) => {
    const baseQuery = fetchBaseQuery({
        baseUrl: baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        credentials: 'include',
    });

    const baseQueryWithReauth = async (args, api, extraOptions) => {
        let result = await baseQuery(args, api, extraOptions);
        // If unauthorized, try to refresh token
        if (result.error?.status === 401) {
            // console.log('🔵 Token expired, attempting refresh...');

            // Try to refresh the token
            const refreshResult = await baseQuery(
                { url: '/v1/users/refresh-token', method: 'POST',  credentials: 'include' },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                // console.log('🟢 Token refreshed successfully');
                // Retry the original request
                result = await baseQuery(args, api, extraOptions);
            } else {
                // console.log('🔴 Refresh failed, redirecting to login');
                // If refresh fails, clear user and redirect to login
                // You can dispatch a logout action here if needed
            }
        }

        return result;
    };

    return baseQueryWithReauth;
};