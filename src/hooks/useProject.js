import { useGetWebRTCConfigurationQuery } from '../store/api/projectApi';

/* ─── Get WebRTC Configuration ─────────────────────────────── */
export const useWebRTCConfig = (corporate, webrtcId, deviceFingerprint) => {
  const { data, isLoading, error, refetch } = useGetWebRTCConfigurationQuery(
    { corporate, webrtcId, deviceFingerprint },
    { 
      skip: !corporate || !webrtcId,
      refetchOnMountOrArgChange: true 
    }
  );

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};