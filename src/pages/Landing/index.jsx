import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useWebRTCConfig } from '../../hooks/useProject';
import { useGlobalSessionStats } from '../../hooks/useSessions';
import { getDeviceFingerprint } from '../../utils/deviceFingerprint';
import { languageOptions as fallbackLanguageOptions } from '../../utils/constants/languageConstants';
import { topicOptions as fallbackTopicOptions } from '../../utils/constants/topicConstants';
import { voiceAccents as fallbackVoiceAccents } from '../../utils/constants/voiceAccents';
import { discussionDepth as fallbackDiscussionDepth } from '../../utils/constants/discussionDepth';
import { sensitivityRange as fallbackSensitivityRange } from '../../utils/constants/sensitivityConstants';
import FeaturesSection from './components/FeaturesSection';
import HeroSection from './components/HeroSection';
import LandingFooter from './components/LandingFooter';
import LandingHeader from './components/LandingHeader';
import SessionSetup from './components/SessionSetup';

const formatDuration = (seconds) => {
  const safeSeconds = Number(seconds) || 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (!hours && !minutes) return `${remainingSeconds}s`;
  if (!hours) return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  if (!minutes) return remainingSeconds ? `${hours}h ${remainingSeconds}s` : `${hours}h`;
  return remainingSeconds ? `${hours}h ${minutes}m ${remainingSeconds}s` : `${hours}h ${minutes}m`;
};

const getDeviceIdentifier = async () => {
  const storedDeviceId = window.localStorage.getItem('deviceFingerprint');
  if (storedDeviceId) return storedDeviceId;

  const deviceInfo = await getDeviceFingerprint();
  window.localStorage.setItem('deviceFingerprint', deviceInfo.fingerprint);
  return deviceInfo.fingerprint;
};

const useHeroImageSlider = (images) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    let isActive = true;
    const preloaders = [];

    setCurrentImageIndex(0);
    if (!images.length) {
      setImagesReady(false);
      return () => { isActive = false; };
    }

    setImagesReady(false);
    let remaining = images.length;
    const finish = () => {
      remaining -= 1;
      if (remaining === 0 && isActive) setImagesReady(true);
    };

    images.forEach((source) => {
      const image = new Image();
      image.onload = finish;
      image.onerror = finish;
      image.src = source;
      preloaders.push(image);
    });

    return () => {
      isActive = false;
      preloaders.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [images]);

  useEffect(() => {
    if (!imagesReady || images.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setCurrentImageIndex((index) => (index + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [images.length, imagesReady]);

  return { currentImageIndex, imagesReady, setCurrentImageIndex };
};

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);
  const corporate = import.meta.env.VITE_DEFAULT_CORPORATE || 'A2plus';
  const webrtcId = import.meta.env.VITE_DEFAULT_WEBRTC_ID || 'webrtc_talk';
  const { data: configData } = useWebRTCConfig(corporate, webrtcId, deviceFingerprint);
  const { globalSessionStats, isLoading: statsLoading } = useGlobalSessionStats();

  useEffect(() => {
    let isActive = true;

    const loadDevice = async () => {
      try {
        const fingerprint = await getDeviceIdentifier();
        if (isActive) setDeviceFingerprint(fingerprint);
      } catch {
        if (isActive) setDeviceFingerprint('');
      }
    };

    loadDevice();
    return () => { isActive = false; };
  }, []);

  const images = useMemo(
    () => (Array.isArray(configData?.heroicImages) ? configData.heroicImages.filter(Boolean) : []),
    [configData]
  );
  const { currentImageIndex, imagesReady, setCurrentImageIndex } = useHeroImageSlider(images);

  const languages = configData?.languages?.length ? configData.languages : fallbackLanguageOptions;
  const topics = configData?.topics?.length ? configData.topics : fallbackTopicOptions;
  const voiceAccents = configData?.voiceAccents?.length ? configData.voiceAccents : fallbackVoiceAccents;
  const discussionDepth = configData?.discussionDepth?.length ? configData.discussionDepth : fallbackDiscussionDepth;
  const sensitivityRange = configData?.sensitivityRange || fallbackSensitivityRange;
  const timerConfig = configData?.timerConfig || {};
  const silencePeriod = configData?.silencePeriod || 1000;
  const anonymousMinutes = timerConfig.maxDurationMinutes?.anonymous || 5;
  const authenticatedMinutes = timerConfig.maxDurationMinutes?.authenticated || 15;
  const totalSessions = globalSessionStats?.totalSessions || 0;
  const totalTalkTime = formatDuration(globalSessionStats?.totalTalkTimeSeconds || 0);

  const handleStart = useCallback((form) => {
    const formData = {
      firstName: user ? undefined : form.firstName,
      lastName: user ? undefined : form.lastName,
      gender: user ? undefined : form.gender,
      language: form.language,
      topic: form.topic,
      voiceAccent: form.voiceAccent,
      discussionDepth: form.discussionDepth,
      sensitivity: form.sensitivity,
      userId: user?.data?._id || user?._id || null,
      deviceFingerprint,
      timestamp: Date.now(),
    };

    navigate('/session/new', { state: { formData } });
  }, [deviceFingerprint, navigate, user]);

  const handleLogin = useCallback(() => navigate('/login'), [navigate]);
  const handleSignup = useCallback(() => navigate('/signup'), [navigate]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-gray-950">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"><div className="orb orb-brand-1 animate-orb-pulse" /><div className="orb orb-brand-2 animate-orb-alt" style={{ top: '45%', right: '-8rem' }} /><div className="orb orb-accent animate-float-slow" style={{ bottom: '5%', left: '12%' }} /></div>
      {!user && <LandingHeader onLogin={handleLogin} onSignup={handleSignup} />}
      <HeroSection user={user} images={images} imagesReady={imagesReady} currentImageIndex={currentImageIndex} onSlideChange={setCurrentImageIndex} totalSessions={totalSessions} totalTalkTime={totalTalkTime} statsLoading={statsLoading} silencePeriod={silencePeriod} />
      <FeaturesSection />
      <SessionSetup user={user} languages={languages} topics={topics} voiceAccents={voiceAccents} discussionDepth={discussionDepth} sensitivityRange={sensitivityRange} anonymousMinutes={anonymousMinutes} authenticatedMinutes={authenticatedMinutes} onStart={handleStart} />
      <LandingFooter />
    </div>
  );
};

export default Landing;
