import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from './baseQueryWithReauth';

const baseQueryWithReauth = createBaseQueryWithReauth(import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
console.log("url", import.meta.env.VITE_API_URL);  
export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    getWebRTCConfiguration: builder.query({
      query: ({ corporate, webrtcId, deviceFingerprint }) => ({
        url: '/v1/projects/configuration',
        params: { corporate, webrtcId },
        headers: {
          'X-Device-Fingerprint': deviceFingerprint || '',
        },
      }),
      transformResponse: (response) => response.data,
      providesTags: (result, error, { webrtcId }) => [
        { type: 'Project', id: webrtcId },
      ],
    }),
  }),
});

export const {
  useGetWebRTCConfigurationQuery,
  useLazyGetWebRTCConfigurationQuery,
} = projectApi;