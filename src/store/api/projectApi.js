import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseUrl, createBaseQueryWithReauth } from './baseQueryWithReauth';

const baseQueryWithReauth = createBaseQueryWithReauth(apiBaseUrl);
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
      keepUnusedDataFor: 60 * 60,
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
