import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import SonexaLogo from '../../components/ui/Logo/SonexaLogo';
import { useLogin } from '../../hooks/useAuth';
import { useAuth } from '../../providers/AuthProvider';


/* Shared icon styles — keeps icons behind input text */
const iconStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  color: '#9ca3af',
  zIndex: 0,   /* behind the input text */
};

const validate = {
  email: (v) => !v ? 'Email is required' : !/\S+@\S+\.\S+/.test(v) ? 'Enter a valid email' : '',
  password: (v) => !v ? 'Password is required' : v.length < 6 ? 'At least 6 characters' : '',
};

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useLogin();
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);

  const touch = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(e => ({ ...e, [field]: validate[field]?.(form[field]) || '' }));
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) setErrors(e => ({ ...e, [name]: validate[name]?.(value) || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { email: true, password: true };
    const allErrors = { email: validate.email(form.email), password: validate.password(form.password) };
    setTouched(allTouched);
    setErrors(allErrors);
    if (Object.values(allErrors).some(Boolean)) return;

    const res = await login(form);
    if (res.success) {
      updateUser();
      toast.success('Welcome back!');
      navigate('/');
    } else {
      const msg = res.error || 'Login failed';
      if (msg.toLowerCase().includes('email')) setErrors(e => ({ ...e, email: msg }));
      else if (msg.toLowerCase().includes('pass')) setErrors(e => ({ ...e, password: msg }));
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
        className="w-full max-w-sm relative z-10"
      >
        {/* Heading */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <SonexaLogo size={40} showText={false} />
            </div>
          </Link>
          <h1 className="text-heading-2 mb-1">Welcome back</h1>
          <p className="text-body">Sign in to continue your conversations</p>
        </div>

        {/* Card */}
        <div className="card-md p-6 sm:p-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email — uses Input component (already fixed) */}
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              onBlur={() => touch('email')}
              error={touched.email ? errors.email : ''}
              placeholder="you@example.com"
              fullWidth
              required
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              }
            />

            {/* Password — FIXED VERSION */}
            <div className="field-group">
              <label className="field-label">
                Password <span className="text-red-500 normal-case tracking-normal font-normal">*</span>
              </label>
              <div className="relative">
                {/* Lock icon — z-index 0 so it sits BEHIND typed text */}
                <span style={{ ...iconStyle, left: '0.875rem' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>

                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={change}
                  onBlur={() => touch('password')}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`input w-full ${touched.password && errors.password ? 'input-error' : ''}`}
                  style={{
                    paddingLeft: '2.5rem',  /* space for lock icon */
                    paddingRight: '2.5rem',  /* space for eye icon */
                    position: 'relative',
                    zIndex: 1,               /* text sits above icon */
                    background: 'transparent',
                  }}
                />

                {/* Show/hide toggle - FIXED: increased zIndex and added pointerEvents auto */}
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '0.875rem',
                    transform: 'translateY(-50%)',
                    zIndex: 10,              /* Higher zIndex to ensure clickable */
                    cursor: 'pointer',
                    background: 'transparent',
                    border: 'none',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPwd ? (
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
              {touched.password && errors.password && (
                <p className="field-error">{errors.password}</p>
              )}
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                <input type="checkbox" className="w-3.5 h-3.5 rounded accent-indigo-600" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" loading={isLoading} className="mt-1">
              Sign in
            </Button>
          </form>

          <div className="my-5">
            <div className="divider" />
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            No account yet?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-[0.6rem] text-gray-400 dark:text-gray-500 mt-5 tracking-wider uppercase">
          🔒 Secure · Private · No ads
        </p>
      </motion.div>
    </div>
  );
};

export default Login;