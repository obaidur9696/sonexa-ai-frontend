import { useGetWebRTCConfigurationQuery } from '../store/api/projectApi';

/* ─── Get WebRTC Configuration ─────────────────────────────── */
export const useWebRTCConfig = (corporate, webrtcId, deviceFingerprint) => {
  const { data, isLoading, error, refetch } = useGetWebRTCConfigurationQuery(
    { corporate, webrtcId, deviceFingerprint },
    { 
      // The fingerprint is part of the API contract. Waiting for it avoids an
      // initial request with an empty header followed by the real request.
      skip: !corporate || !webrtcId || deviceFingerprint == null,
      refetchOnMountOrArgChange: false,
    }
  );

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
