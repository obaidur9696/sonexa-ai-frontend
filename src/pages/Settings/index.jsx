import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLogout, useCurrentUser, useUpdateAccount } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader/Loader';
import Input from '../../components/ui/Input/Input';
import RangeSlider from '../../components/ui/RangeSlider/RangeSlider';
import Button from '../../components/ui/Button/Button';

const UI = {
  back: 'Back',
  settings: 'Settings',
  profileInformation: 'Profile Information',
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email Address',
  age: 'Age',
  gender: 'Gender',
  years: 'years',
  cancel: 'Cancel',
  saveChanges: 'Save Changes',
  editProfile: 'Edit Profile',
  account: 'Account',
  signOut: 'Sign Out',
  signingOut: 'Signing out…',
  securelyEnd: 'Securely end your session',
  profileUpdated: 'Profile updated',
  updateFailed: 'Update failed',
  signedOut: 'Signed out',
  signOutFailed: 'Sign out failed',
};

const Icon = ({ name, className = 'w-4 h-4' }) => {
  const paths = {
    arrowLeft: <path d="M19 12H5m7 7-7-7 7-7" />,
    settings: <><path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    email: <><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></>,
    logout: <><path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const SectionCard = ({ icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="card-md overflow-hidden mb-5"
  >
    <div className="h-1 w-full" style={{ background: 'var(--grad-brand)' }} />
    <div className="p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
          <Icon name={icon} className="w-4 h-4" />
        </span>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  </motion.div>
);

const ViewField = ({ label, value }) => (
  <div>
    <p className="text-[0.6rem] font-semibold tracking-[0.1em] uppercase text-indigo-600 dark:text-indigo-400 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</p>
    <div className="h-px mt-2 bg-gradient-to-r from-indigo-100 dark:from-indigo-500/20 to-transparent" />
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const { user, isLoading, refetch } = useCurrentUser();
  const { logout } = useLogout();
  const { updateAccount, isLoading: saving } = useUpdateAccount();

  const [isEditing, setIsEditing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', age: 25 });

  // ✅ Refetch on mount to get latest data
  useEffect(() => {
    if (typeof refetch === 'function') {
      refetch();
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) navigate('/login', { replace: true });
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      const u = user?.data || user;
      setForm({
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        age: u.age || 25
      });
    }
  }, [user]);

  if (isLoading) return <Loader size="lg" fullScreen />;

  const u = user?.data || user;
  if (!u) return null;

  const handleSave = async () => {
    const res = await updateAccount({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      age: form.age
    });
    if (res.success) {
      toast.success(UI.profileUpdated);
      setIsEditing(false);
      if (typeof refetch === 'function') {
        refetch();
      }
    } else {
      toast.error(res.error || UI.updateFailed);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const res = await logout();
    if (res.success) {
      toast.success(UI.signedOut);
      navigate('/');
    } else {
      toast.error(UI.signOutFailed);
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen page-gradient relative overflow-x-hidden">
      <div className="orb orb-brand-1 animate-orb-pulse pointer-events-none" />
      <div className="orb orb-brand-2 animate-orb-alt pointer-events-none" style={{ bottom: '14%', right: '-8rem' }} />

      <main className="container-lg py-6 sm:py-9 relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300 transition-colors"
          >
            <Icon name="arrowLeft" className="w-4 h-4" />
            {UI.back}
          </button>
        </motion.header>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="flex items-center gap-3.5 mb-6"
        >
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--grad-brand)', boxShadow: 'var(--shadow-brand)' }}>
            <Icon name="settings" className="w-5 h-5 text-white" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{UI.settings}</h1>
        </motion.div>

        {/* Profile Card */}
        <SectionCard icon="user" title={UI.profileInformation}>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Input
                    label={UI.firstName}
                    value={form.firstName}
                    onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                    fullWidth
                  />
                  <Input
                    label={UI.lastName}
                    value={form.lastName}
                    onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                    fullWidth
                  />
                </div>
                <div className="mb-4">
                  <Input
                    label={UI.email}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    fullWidth
                  />
                </div>
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{UI.age}</p>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{form.age} {UI.years}</span>
                  </div>
                  <RangeSlider
                    value={form.age}
                    min={13}
                    max={100}
                    step={1}
                    onChange={(e) => setForm(f => ({ ...f, age: parseInt(e.target.value) }))}
                    showValue={false}
                    fullWidth
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>{UI.cancel}</Button>
                  <Button size="sm" loading={saving} onClick={handleSave}>{UI.saveChanges}</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <ViewField label={UI.firstName} value={u.firstName} />
                  <ViewField label={UI.lastName} value={u.lastName} />
                  <ViewField label={UI.email} value={u.email} />
                  <ViewField label={UI.age} value={u.age ? `${u.age} ${UI.years}` : undefined} />
                  <ViewField label={UI.gender} value={u.gender ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1) : undefined} />
                </div>
                <div className="flex justify-end mt-5">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>{UI.editProfile}</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>

        {/* Account Section */}
        <SectionCard icon="lock" title={UI.account}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/8 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loggingOut ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon name="logout" className="w-4 h-4 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
            )}
            {loggingOut ? UI.signingOut : UI.signOut}
          </button>
          <p className="text-center text-[0.6rem] text-gray-400 dark:text-gray-500 mt-3 tracking-wide">
            {UI.securelyEnd}
          </p>
        </SectionCard>

        {/* Account Created Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <div className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <Icon name="check" className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {UI.accountCreated || 'Account created'} {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;