import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input/Input';
import Dropdown from '../../components/ui/Dropdown/Dropdown';
import RangeSlider from '../../components/ui/RangeSlider/RangeSlider';
import Button from '../../components/ui/Button/Button';
import SonexaLogo from '../../components/ui/Logo/SonexaLogo';
import { useRegister } from '../../hooks/useAuth';
import { useAuth } from '../../providers/AuthProvider';

/* Shared absolute icon positioning — icon behind text */
const iconStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  color: '#9ca3af',
  zIndex: 0,
};

const GENDER_OPTS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

const STRENGTH_LEVELS = [
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Fair', color: 'bg-amber-500' },
  { label: 'Good', color: 'bg-blue-500' },
  { label: 'Strong', color: 'bg-emerald-500' },
];

const getStrength = (pwd) => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return Math.min(s, 4);
};

const validate = {
  firstName: (v) => !v.trim() ? 'First name is required' : '',
  lastName: (v) => !v.trim() ? 'Last name is required' : '',
  email: (v) => !v ? 'Email is required' : !/\S+@\S+\.\S+/.test(v) ? 'Invalid email' : '',
  password: (v) => !v ? 'Password is required' : v.length < 8 ? 'Min 8 characters' :
    !/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/.test(v) ? 'Include uppercase, lowercase & number' : '',
  confirmPassword: (v, pwd) => !v ? 'Confirm your password' : v !== pwd ? "Passwords don't match" : '',
  gender: (v) => !v ? 'Please select gender' : '',
};

/* Reusable password field with icon layering fix */
const PasswordField = ({ label, value, onChange, error, placeholder, show, onToggle, autoComplete }) => (
  <div className="field-group">
    <label className="field-label">
      {label} <span className="text-red-500 normal-case tracking-normal font-normal">*</span>
    </label>
    <div className="relative">
      {/* Lock icon — sits behind input text */}
      <span style={{ ...iconStyle, left: '0.875rem' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </span>

      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`input w-full ${error ? 'input-error' : ''}`}
        style={{
          paddingLeft: '2.5rem',
          paddingRight: '2.5rem',
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
        }}
      />

      {/* Eye toggle — sits above everything */}
      <button
        type="button"
        onClick={onToggle}
        style={{ ...iconStyle, right: '0.875rem', left: 'auto', zIndex: 2, pointerEvents: 'auto', cursor: 'pointer' }}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        {show ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>
    {error && <p className="field-error">{error}</p>}
  </div>
);

const Signup = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useRegister();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', gender: '', age: 25,
  });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showCpd, setShowCpd] = useState(false);

  const change = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const pwdStrength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      firstName: validate.firstName(form.firstName),
      lastName: validate.lastName(form.lastName),
      email: validate.email(form.email),
      password: validate.password(form.password),
      confirmPassword: validate.confirmPassword(form.confirmPassword, form.password),
      gender: validate.gender(form.gender),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    const { confirmPassword, ...payload } = form;
    const res = await register(payload);
    if (res.success) {
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } else {
      const msg = res.error || 'Registration failed';
      if (msg.toLowerCase().includes('email')) setErrors(e => ({ ...e, email: 'Email already in use' }));
      else toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen page-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="orb orb-brand-1 animate-orb-pulse" />
      <div className="orb orb-accent animate-float-slow" style={{ bottom: '5%', right: '10%' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Heading */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mt-10">
              <SonexaLogo size={40} showText={false} />
            </div>
          </Link>
          <h1 className="text-heading-2 mb-1">Create your account</h1>
          <p className="text-body">Join Sonexa AI and start natural conversations</p>
        </div>

        {/* Card */}
        <div className="card-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={form.firstName}
                  onChange={change('firstName')} error={errors.firstName}
                  placeholder="Jane" fullWidth required />
                <Input label="Last Name" value={form.lastName}
                  onChange={change('lastName')} error={errors.lastName}
                  placeholder="Smith" fullWidth required />
              </div>

              {/* Email */}
              <Input
                label="Email Address" type="email" value={form.email}
                onChange={change('email')} error={errors.email}
                placeholder="you@example.com" fullWidth required
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                }
              />

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <PasswordField
                    label="Password"
                    value={form.password}
                    onChange={change('password')}
                    error={errors.password}
                    placeholder="Create password"
                    show={showPwd}
                    onToggle={() => setShowPwd(s => !s)}
                    autoComplete="new-password"
                  />
                  {/* Strength bar */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= pwdStrength
                              ? STRENGTH_LEVELS[pwdStrength - 1]?.color
                              : 'bg-gray-200 dark:bg-white/10'
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-[0.6rem] text-gray-400">
                        {STRENGTH_LEVELS[pwdStrength - 1]?.label ?? 'Weak'}
                      </p>
                    </div>
                  )}
                </div>

                <PasswordField
                  label="Confirm Password"
                  value={form.confirmPassword}
                  onChange={change('confirmPassword')}
                  error={errors.confirmPassword}
                  placeholder="Confirm password"
                  show={showCpd}
                  onToggle={() => setShowCpd(s => !s)}
                  autoComplete="new-password"
                />
              </div>

              {/* Gender + Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <Dropdown
                  label="Gender"
                  options={GENDER_OPTS}
                  value={form.gender}
                  onChange={(opt) => setForm(f => ({ ...f, gender: opt.value }))}
                  placeholder="Select gender"
                  error={errors.gender}
                  fullWidth
                />
                <div className="field-group">
                  <label className="field-label">
                    Age
                    <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold normal-case tracking-normal text-xs">
                      {form.age} yrs
                    </span>
                  </label>
                  <div className="pt-3">
                    <RangeSlider
                      value={form.age}
                      min={13} max={100} step={1}
                      onChange={(e) => setForm(f => ({ ...f, age: parseInt(e.target.value) }))}
                      showValue={false}
                      fullWidth
                    />
                    <div className="flex justify-between text-[0.6rem] text-gray-400 mt-1.5">
                      <span>13</span><span>100</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" loading={isLoading}>
                Create account
              </Button>
            </div>
          </form>

          <div className="mt-5">
            <div className="divider" />
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[0.6rem] text-gray-400 dark:text-gray-500 mt-5 tracking-wider uppercase">
          🔒 Your data is private and secure
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;