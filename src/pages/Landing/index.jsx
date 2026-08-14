import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../providers/AuthProvider';
import Button from '../../components/ui/Button/Button';
import SearchableDropdown from '../../components/ui/SearchableDropdown/SearchableDropdown';
import Dropdown from '../../components/ui/Dropdown/Dropdown';
import RangeSlider from '../../components/ui/RangeSlider/RangeSlider';
import Input from '../../components/ui/Input/Input';
import SonexaLogo from '../../components/ui/Logo/SonexaLogo';
// ✅ Fallback constants (will be used if API fails)
import { languageOptions as fallbackLanguageOptions } from '../../utils/constants/languageConstants';
import { topicOptions as fallbackTopicOptions } from '../../utils/constants/topicConstants';
import { voiceAccents as fallbackVoiceAccents } from '../../utils/constants/voiceAccents';
import { discussionDepth as fallbackDiscussionDepth } from '../../utils/constants/discussionDepth';
import { sensitivityRange as fallbackSensitivityRange } from '../../utils/constants/sensitivityConstants';
import { useWebRTCConfig } from '../../hooks/useProject';
import { useGlobalSessionStats } from '../../hooks/useSessions';
import { getDeviceFingerprint } from '../../utils/deviceFingerprint';

/* ── Dark mode hook ── */
const useDarkMode = () => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.theme = dark ? 'dark' : 'light';
  }, [dark]);
  return [dark, setDark];
};

const STATS = [
  { n: '100+', label: 'Languages', icon: '🌐' },
  { n: '1000+', label: 'Topics', icon: '🎯' },
  { n: '<1000ms', label: 'Latency', icon: '⚡' },
  { n: '24/7', label: 'Available', icon: '🕐' },
];

const FEATURES = [
  {
    icon: '🌍',
    title: 'Multi-Language Support',
    desc: 'Speak naturally in 100+ languages with near-native voice quality and real-time translation.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: '🧠',
    title: 'Deep Conversation AI',
    desc: 'Intelligent, context-aware conversations that feel human — from casual chats to deep insights.',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'Ultra-low latency responses. Real-time voice AI that keeps up with your thoughts.',
    gradient: 'from-orange-500 to-rose-500'
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    desc: 'Bank-grade encryption, data privacy, and compliance. Your conversations are always secure.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: '🎯',
    title: 'Personalized Experience',
    desc: 'Adapts to your speaking style, preferences, and learning goals for a truly tailored interaction.',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: '📊',
    title: 'Conversation Insights',
    desc: 'Get detailed analytics on your communication skills, engagement, and language proficiency.',
    gradient: 'from-indigo-500 to-purple-500'
  },
];

const GENDER_OPTS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

/* ── Icon Component ── */
const Icon = ({ name, className = 'w-5 h-5' }) => {
  const paths = {
    globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    brain: <><path d="M12 4.5a4.5 4.5 0 0 1 4.5 4.5c0 1.5-.75 2.75-1.5 3.75A4.5 4.5 0 0 1 12 9.75a4.5 4.5 0 0 1-3-2.5A4.5 4.5 0 0 1 12 4.5z" /><path d="M12 9.75v7.5" /><path d="M8.25 12h7.5" /><path d="M4.5 9.75A4.5 4.5 0 0 1 9 14.25 4.5 4.5 0 0 1 4.5 18.75 4.5 4.5 0 0 1 0 14.25 4.5 4.5 0 0 1 4.5 9.75z" /><path d="M19.5 9.75A4.5 4.5 0 0 1 24 14.25 4.5 4.5 0 0 1 19.5 18.75 4.5 4.5 0 0 1 15 14.25 4.5 4.5 0 0 1 19.5 9.75z" /></>,
    zap: <><path d="M13 2L4 14h7l-3 8 9-12h-7l3-8z" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
    chart: <><path d="M3 20h18" /><path d="M6 16v4" /><path d="M10 12v8" /><path d="M14 8v12" /><path d="M18 4v16" /></>,
    arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

/* ── Format Seconds to HH:MM:SS ── */
const formatDuration = (seconds) => {
  const safeSeconds = Number(seconds) || 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours === 0 && minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (hours === 0) {
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    if (minutes === 0 && remainingSeconds === 0) return `${hours}h`;
    if (minutes === 0) return `${hours}h ${remainingSeconds}s`;
    if (remainingSeconds === 0) return `${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
};

/* ══════════════════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════════════════ */
const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dark, setDark] = useDarkMode();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [projectConfig, setProjectConfig] = useState(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [heroicImages, setHeroicImages] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const sliderTimerRef = useRef(null);

  // ── Form state with validation errors ──
  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: '',
    language: '', topic: '', voiceAccent: '',
    discussionDepth: 'concise', sensitivity: 0.7,
  });

  // ── Validation errors state ──
  const [errors, setErrors] = useState({
    language: '',
    topic: '',
    voiceAccent: '',
  });

  // ── Hooks ──
  const { globalSessionStats, isLoading: statsLoading, refetch } = useGlobalSessionStats();

  // ✅ Refetch global stats every time landing page mounts
  useEffect(() => {
    if (typeof refetch === 'function') {
      refetch();
    }
  }, [refetch]);

  const getDeviceIdentifier = async () => {
    const storedDeviceId = localStorage.getItem('deviceFingerprint');
    if (storedDeviceId) {
      return { fingerprint: storedDeviceId, source: 'localStorage' };
    }
    const deviceInfo = await getDeviceFingerprint();
    localStorage.setItem('deviceFingerprint', deviceInfo.fingerprint);
    return { fingerprint: deviceInfo.fingerprint, source: 'new' };
  };

  useEffect(() => {
    const loadDevice = async () => {
      const deviceData = await getDeviceIdentifier();
      setDeviceFingerprint(deviceData.fingerprint);
    };
    loadDevice();
  }, []);

  const corporate = import.meta.env.VITE_DEFAULT_CORPORATE || 'A2plus';
  const webrtcId = import.meta.env.VITE_DEFAULT_WEBRTC_ID || 'webrtc_talk';

  // ✅ Project config is cached by RTK Query - no extra API calls
  const { data: configData, isLoading: configLoading } = useWebRTCConfig(
    corporate,
    webrtcId,
    deviceFingerprint
  );

  // ✅ Extract values from API with fallback to constants
  const languages = configData?.languages?.length > 0 ? configData.languages : fallbackLanguageOptions;
  const topics = configData?.topics?.length > 0 ? configData.topics : fallbackTopicOptions;
  const voiceAccents = configData?.voiceAccents?.length > 0 ? configData.voiceAccents : fallbackVoiceAccents;
  const discussionDepth = configData?.discussionDepth?.length > 0 ? configData.discussionDepth : fallbackDiscussionDepth;
  const sensitivityRange = configData?.sensitivityRange || fallbackSensitivityRange;

  useEffect(() => {
    if (configData) {
      console.log('[Landing] Project config loaded from cache:', configData);
      setProjectConfig(configData);

      const images = configData?.heroicImages || [];
      if (images.length > 0) {
        setHeroicImages(images);
        preloadImages(images);
      } else {
        setImagesLoaded(true);
      }
    }
  }, [configData]);

  const preloadImages = (images) => {
    if (!images || images.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setImagesLoaded(true);
          startSlider(images.length);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setImagesLoaded(true);
          startSlider(images.length);
        }
      };
    });
  };

  const startSlider = (totalImages) => {
    if (sliderTimerRef.current) {
      clearInterval(sliderTimerRef.current);
    }
    if (totalImages > 1) {
      sliderTimerRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % totalImages);
      }, 5000);
    }
  };

  useEffect(() => {
    if (heroicImages.length > 1) {
      startSlider(heroicImages.length);
    }
    return () => {
      if (sliderTimerRef.current) {
        clearInterval(sliderTimerRef.current);
        sliderTimerRef.current = null;
      }
    };
  }, [heroicImages]);

  const set = (key) => (val) =>
    setForm((f) => ({ ...f, [key]: typeof val === 'object' ? val.value : val }));

  const handleStart = () => {
    // ✅ Clear previous errors
    setErrors({ language: '', topic: '', voiceAccent: '' });

    let hasError = false;
    const newErrors = { language: '', topic: '', voiceAccent: '' };

    if (!form.language) {
      newErrors.language = 'Please select a language';
      hasError = true;
    }
    if (!form.topic) {
      newErrors.topic = 'Please select a topic';
      hasError = true;
    }
    if (!form.voiceAccent) {
      newErrors.voiceAccent = 'Please select a voice accent';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);

      // Scroll to first error
      if (!form.language) {
        document.getElementById('lang-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!form.topic) {
        document.getElementById('topic-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!form.voiceAccent) {
        document.getElementById('accent-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

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
      deviceFingerprint: deviceFingerprint,
      timestamp: Date.now(),
    };

    console.log('[Landing] Sending formData:', formData);
    navigate('/session/new', { state: { formData } });
  };

  // ── Get timer values from project config ──
  const timerConfig = projectConfig?.timerConfig || {};
  const silencePeriod = projectConfig?.silencePeriod || 1000;
  const anonymousMinutes = timerConfig.maxDurationMinutes?.anonymous || 5;
  const authenticatedMinutes = timerConfig.maxDurationMinutes?.authenticated || 15;

  // ── Stats ──
  const totalSessions = globalSessionStats?.totalSessions || 0;
  const totalTalkTimeFormatted = formatDuration(globalSessionStats?.totalTalkTimeSeconds || 0);
  const hasImages = heroicImages.length > 0 && imagesLoaded;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* ── Ambient Orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="orb orb-brand-1 animate-orb-pulse" />
        <div className="orb orb-brand-2 animate-orb-alt" style={{ top: '45%', right: '-8rem' }} />
        <div className="orb orb-accent animate-float-slow" style={{ bottom: '5%', left: '12%' }} />
      </div>

      {/* ════════ HEADER ════════ */}
      {!user && (
        <header className="sticky top-0 z-50 border-b border-gray-100/50 dark:border-white/5 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
                <SonexaLogo size={34} showText={true} />
              </Link>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                  Sign up free
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ════════ HERO SECTION ════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden rounded-b-[15px] sm:rounded-b-[20px] shadow-[0_20px_80px_rgba(79,70,229,0.15)] dark:shadow-[0_20px_80px_rgba(79,70,229,0.08)]">

        {/* ── Background Image Slider or Fallback ── */}
        <div className="absolute inset-0 overflow-hidden">
          {hasImages ? (
            heroicImages.map((img, index) => (
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ x: index === currentImageIndex ? 0 : '100%' }}
                animate={{
                  x: index === currentImageIndex ? 0 : '-100%',
                  opacity: index === currentImageIndex ? 1 : 0,
                }}
                transition={{
                  x: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.3 },
                }}
                style={{
                  display: index === currentImageIndex ? 'block' : 'block',
                }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${img})`,
                    filter: 'brightness(0.45) contrast(1.1) saturate(1.1)',
                    transform: 'scale(1.05)',
                  }}
                />
              </motion.div>
            ))
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animate-gradient-slow">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-float-slow" />
              <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1.5s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-pink-950/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* ── Floating Particles ── */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: [null, -60, null],
                opacity: [0, 1, 0],
                x: [null, (Math.random() - 0.5) * 40, null],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* ── Hero Content ── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >

            {/* ── Platform Stats (Clean text) ── */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/60 text-xs sm:text-sm font-light tracking-wide mb-6">
              {statsLoading ? (
                <div className="flex items-center gap-1">
                  <span className="animate-pulse">•</span>
                  <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>•</span>
                  <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>•</span>
                </div>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="text-emerald-400/70">●</span>
                    {totalSessions.toLocaleString()} conversations completed
                  </span>
                  {totalTalkTimeFormatted !== '0s' && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-indigo-400/70">●</span>
                      {totalTalkTimeFormatted} total talk time
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
                Voice AI that feels
              </span>
              <br />
              <span className="relative inline-block">
                truly human
                <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2">
              Have real conversations, not robotic replies. Experience natural, context-aware AI
              that understands emotion and responds in{' '}
              <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                &lt;{silencePeriod}ms
              </span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  document.getElementById('start-session')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                className="group relative px-8 sm:px-12 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white text-sm sm:text-base font-semibold shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {user ? 'Start Premium Session' : 'Start Free Trial'}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                className="px-8 sm:px-12 py-4 rounded-full border border-white/20 backdrop-blur-sm text-white/80 hover:text-white hover:border-white/40 transition-all duration-300 text-sm sm:text-base font-medium cursor-pointer"
              >
                Explore Features
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {STATS.map((s, i) => {
                let displayValue = s.n;
                let displayLabel = s.label;
                if (s.label === 'Latency') {
                  displayValue = `<${silencePeriod}ms`;
                  displayLabel = 'Latency';
                }
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="text-center p-3 sm:p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors cursor-default"
                  >
                    <div className="text-2xl sm:text-3xl mb-1">{s.icon}</div>
                    <div className="text-base sm:text-xl font-bold text-white tabular-nums">{displayValue}</div>
                    <div className="text-[0.6rem] text-white/60 uppercase tracking-wider">{displayLabel}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Image Slider Dots */}
            {hasImages && heroicImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {heroicImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${index === currentImageIndex
                      ? 'w-8 h-2 bg-white'
                      : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Wave Overlay on Hero Image (3x amplitude) ── */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <svg
            viewBox="0 0 1440 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            {/* Wave Layer 1 - Main wave with 3x amplitude */}
            <path
              d="M0 120 C200 0 400 180 600 80 C800 0 1000 170 1200 60 L1440 20 L1440 200 L0 200 Z"
              fill="rgba(255,255,255,0.08)"
              className="dark:fill-white/10"
            >
              <animate
                attributeName="d"
                dur="5s"
                repeatCount="indefinite"
                values="
                  M0 120 C200 0 400 180 600 80 C800 0 1000 170 1200 60 L1440 20 L1440 200 L0 200 Z;
                  M0 120 C200 180 400 0 600 100 C800 180 1000 0 1200 80 L1440 20 L1440 200 L0 200 Z;
                  M0 120 C200 0 400 180 600 80 C800 0 1000 170 1200 60 L1440 20 L1440 200 L0 200 Z
                "
              />
            </path>

            {/* Wave Layer 2 - Secondary wave with 3x amplitude */}
            <path
              d="M0 130 C300 10 500 190 700 90 C900 10 1100 180 1300 70 L1440 30 L1440 200 L0 200 Z"
              fill="rgba(255,255,255,0.06)"
              className="dark:fill-white/7"
            >
              <animate
                attributeName="d"
                dur="6s"
                repeatCount="indefinite"
                values="
                  M0 130 C300 10 500 190 700 90 C900 10 1100 180 1300 70 L1440 30 L1440 200 L0 200 Z;
                  M0 130 C300 190 500 10 700 100 C900 190 1100 10 1300 80 L1440 30 L1440 200 L0 200 Z;
                  M0 130 C300 10 500 190 700 90 C900 10 1100 180 1300 70 L1440 30 L1440 200 L0 200 Z
                "
              />
            </path>

            {/* Wave Layer 3 - Highlight wave with 3x amplitude */}
            <path
              d="M0 125 C250 5 450 185 650 85 C850 5 1050 175 1250 65 L1440 25 L1440 200 L0 200 Z"
              fill="url(#waveHighlight)"
              opacity="0.15"
              className="dark:opacity-10"
            >
              <animate
                attributeName="d"
                dur="4.5s"
                repeatCount="indefinite"
                values="
                  M0 125 C250 5 450 185 650 85 C850 5 1050 175 1250 65 L1440 25 L1440 200 L0 200 Z;
                  M0 125 C250 185 450 5 650 95 C850 185 1050 5 1250 75 L1440 25 L1440 200 L0 200 Z;
                  M0 125 C250 5 450 185 650 85 C850 5 1050 175 1250 65 L1440 25 L1440 200 L0 200 Z
                "
              />
            </path>

            <defs>
              <linearGradient id="waveHighlight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="white" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* ════════ FEATURES SECTION ════════ */}
      <section id="features" className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-[0.2em] uppercase mb-3">
              Why Sonexa AI
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">real conversations</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to have meaningful, natural, and intelligent voice conversations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300 } }}
                className="group relative bg-white dark:bg-gray-900/50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-white/5 transition-all duration-500 overflow-hidden cursor-default"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-700`} />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000" />

                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 text-3xl sm:text-4xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10">
                    {f.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${f.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SESSION FORM SECTION ════════ */}
      <section id="start-session" className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10"
          >
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-[0.2em] uppercase mb-3">
              Get Started Instantly
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              Begin Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Conversation</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Personalize your AI experience in seconds
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative bg-white dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              <div className="p-6 sm:p-8 md:p-10">
                <div className="relative space-y-5 sm:space-y-6">
                  {/* Name + Gender — guests only */}
                  {!user && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <Input
                        label="First Name"
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        placeholder="Enter first name"
                        fullWidth
                      />
                      <Input
                        label="Last Name"
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        placeholder="Enter last name"
                        fullWidth
                      />
                      <Dropdown
                        label="Gender"
                        options={GENDER_OPTS}
                        value={form.gender}
                        onChange={set('gender')}
                        placeholder="Select gender"
                        fullWidth
                      />
                    </div>
                  )}

                  {/* Language / Topic / Accent with inline errors */}
                  <div id="lang-field" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="field-group">
                      <label className="field-label">
                        Language <span className="text-red-500">*</span>
                      </label>
                      <SearchableDropdown
                        options={languages}
                        value={form.language}
                        onChange={set('language')}
                        placeholder="Select language"
                        fullWidth
                      />
                      {errors.language && (
                        <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.language}</p>
                      )}
                    </div>
                    <div id="topic-field" className="field-group">
                      <label className="field-label">
                        Topic <span className="text-red-500">*</span>
                      </label>
                      <SearchableDropdown
                        options={topics}
                        value={form.topic}
                        onChange={set('topic')}
                        placeholder="Select topic"
                        fullWidth
                      />
                      {errors.topic && (
                        <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.topic}</p>
                      )}
                    </div>
                    <div id="accent-field" className="field-group">
                      <label className="field-label">
                        Voice Accent <span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        options={voiceAccents}
                        value={form.voiceAccent}
                        onChange={set('voiceAccent')}
                        placeholder="Select accent"
                        fullWidth
                      />
                      {errors.voiceAccent && (
                        <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.voiceAccent}</p>
                      )}
                    </div>
                  </div>

                  {/* Conversation Depth - Responsive fix */}
                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      Conversation Depth
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {discussionDepth.map((d) => {
                        const active = form.discussionDepth === d.value;
                        return (
                          <motion.button
                            key={d.value}
                            type="button"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setForm((f) => ({ ...f, discussionDepth: d.value }))}
                            className={`relative p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${active
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md'
                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/30 bg-white/50 dark:bg-gray-800/50'
                              }`}
                          >
                            {active && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full">
                                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping" />
                              </div>
                            )}
                            <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-0.5 truncate">
                              {d.label}
                            </div>
                            <div className="text-[0.6rem] sm:text-xs text-gray-600 dark:text-gray-400 leading-tight">
                              {d.description}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sensitivity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Microphone Sensitivity
                      </label>
                      <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-mono font-semibold text-xs sm:text-sm shadow-lg">
                        {form.sensitivity.toFixed(2)}
                      </span>
                    </div>

                    <RangeSlider
                      value={form.sensitivity}
                      min={sensitivityRange.min}
                      max={sensitivityRange.max}
                      step={sensitivityRange.step}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sensitivity: parseFloat(e.target.value) }))
                      }
                      showValue={false}
                      fullWidth
                    />

                    <div className="flex items-center gap-1 h-1.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-full rounded-full transition-all duration-300 ${form.sensitivity >= i / 10
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-200/50 dark:border-blue-500/10">
                        <span className="text-xl sm:text-2xl">🏠</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                            Quiet Environment
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Home, library • 0.5–0.6
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-500/5 rounded-xl border border-orange-200/50 dark:border-orange-500/10">
                        <span className="text-xl sm:text-2xl">☕</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                            Noisy Environment
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Café, street • 0.6–0.8
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
                    <Button
                      fullWidth
                      size="lg"
                      onClick={handleStart}
                      className="relative py-4 text-base sm:text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl shadow-xl overflow-hidden group cursor-pointer"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <span className="text-xl">🚀</span>
                        {user ? 'Start Premium Session' : 'Start Free Trial'}
                      </span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
                    </Button>
                  </motion.div>

                  {/* Timer Info */}
                  <div className="text-center space-y-2 pt-1">
                    {!user ? (
                      <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                          {anonymousMinutes}-min free trial
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-gray-400 dark:text-gray-500">•</span>
                          Sign in for unlimited premium sessions
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium mr-2">
                          {authenticatedMinutes}-min / sessions
                        </span>
                        Premium access
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 flex flex-wrap items-center justify-center gap-3">
                      <span className="cursor-default">🔒 Enterprise security</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="cursor-default">100+ languages</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="cursor-default">1000+ topics</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-gray-100 dark:border-white/5 py-6 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/" className="cursor-pointer">
                <SonexaLogo size={28} showText={true} />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} Sonexa AI
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-400 dark:text-gray-500">crafted by</span>
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent font-semibold tracking-wide cursor-default">
                Obaidur Rahman
              </span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient-slow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 8s ease infinite;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;