import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentUser } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader/Loader';
import Button from '../../components/ui/Button/Button';

const UI = {
  back: 'Back',
  profile: 'Profile',
  memberSince: 'Member since',
  totalConversations: 'Total Conversations',
  lifetimeSessions: 'Lifetime sessions',
  totalTalkTime: 'Total Talk Time',
  acrossAllSessions: 'Across all sessions',
  personalInfo: 'Personal Information',
  name: 'Name',
  gender: 'Gender',
  age: 'Age',
  email: 'Email Address',
  backToHome: 'Back to Home',
  joined: 'Joined',
  accountCreated: 'Account created',
};

const Icon = ({ name, className = 'w-4 h-4' }) => {
  const paths = {
    arrowLeft: <path d="M19 12H5m7 7-7-7 7-7" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    email: <><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></>,
    message: <path d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    home: <><path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const formatDuration = (seconds) => {
  const safeSeconds = Number(seconds) || 0;

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours === 0 && minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (hours === 0) {
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    if (minutes === 0 && remainingSeconds === 0) {
      return `${hours}h`;
    } else if (minutes === 0) {
      return `${hours}h ${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
};

const StatCard = ({ icon, value, label, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="surface-2 rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-all duration-200 flex items-center gap-4 text-left"
  >
    <span className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
      <Icon name={icon} className="w-5 h-5" />
    </span>
    <div className="min-w-0">
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{label}</p>
      <p className="text-[0.55rem] sm:text-[0.6rem] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
    </div>
  </motion.div>
);

const Field = ({ label, value }) => (
  <div className="surface-2 rounded-xl px-4 py-3.5">
    <p className="text-[0.6rem] font-semibold tracking-[0.1em] uppercase text-indigo-600 dark:text-indigo-400 mb-1">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</p>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  // The provider keeps this query subscribed for the entire app lifetime.
  // Revalidating on this route ensures the activity cards reflect completed
  // sessions without requiring a browser refresh.
  const { user, isLoading } = useCurrentUser({ refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (!isLoading && !user) navigate('/login', { replace: true });
  }, [user, isLoading, navigate]);

  if (isLoading) return <Loader size="lg" fullScreen />;
  if (!user) return null;

  const u = user?.data || user;

  const joinDate = u.createdAt
    ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const initials = (u.name || '').trim().split(/\s+/)
    .filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');

  const totalTalkTimeFormatted = formatDuration(u.totalTalkTimeSeconds || 0);

  return (
    <div className="min-h-screen page-gradient relative overflow-x-hidden">
      <div className="orb orb-brand-1 animate-orb-pulse pointer-events-none" />
      <div className="orb orb-brand-2 animate-orb-alt pointer-events-none" style={{ bottom: '14%', right: '-8rem' }} />

      <main className="w-full max-w-6xl mx-auto py-6 sm:py-9 relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-gray-400 dark:hover:text-indigo-300"
          >
            <Icon name="arrowLeft" className="w-4 h-4" />
            {UI.back}
          </button>
        </motion.header>

        {/* Profile Hero Card */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="card-md overflow-hidden mb-5"
        >
          <div className="h-1 w-full" style={{ background: 'var(--grad-brand)' }} />
          <div className="p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #9333ea)' }}
                >
                  {initials || '?'}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {u.name || '—'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 justify-center sm:justify-start mt-1">
                  <Icon name="email" className="w-3.5 h-3.5" />
                  {u.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                    <Icon name="calendar" className="w-3 h-3" />
                    {UI.memberSince} {joinDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="card-md p-5 sm:p-7 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-[0.05] pointer-events-none" style={{ background: 'var(--grad-brand)' }} />
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center"><Icon name="user" /></span>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{UI.personalInfo}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={UI.name} value={u.name} />
              <Field label={UI.gender} value={u.gender ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1) : undefined} />
              <Field label={UI.age} value={u.age ? `${u.age} years` : undefined} />
              <div className="sm:col-span-2"><Field label={UI.email} value={u.email} /></div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <Icon name="check" className="w-3.5 h-3.5 text-emerald-500" />
              <span>{UI.accountCreated} {joinDate}</span>
            </div>
          </motion.section>

          <aside className="space-y-5" aria-label="Profile overview">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <StatCard icon="message" value={u.totalSessions ?? 0} label={UI.totalConversations} sub={UI.lifetimeSessions} delay={0.1} />
              <StatCard icon="clock" value={totalTalkTimeFormatted} label={UI.totalTalkTime} sub={UI.acrossAllSessions} delay={0.15} />
            </div>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="card-md p-4 sm:p-5"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Manage your account</p>
              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">Update your details and application preferences.</p>
              <div className="mt-4 grid gap-2.5">
                <Button variant="primary" size="md" onClick={() => navigate('/settings')} className="w-full flex items-center justify-center gap-2">
                  <Icon name="user" className="w-4 h-4" />
                  Manage profile
                </Button>
                <Button variant="outline" size="md" onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2">
                  <Icon name="home" className="w-4 h-4" />
                  {UI.backToHome}
                </Button>
              </div>
            </motion.section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Profile;
