import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import { useLogin } from '../../hooks/useAuth';
import { useAuth } from '../../providers/AuthProvider';
import AuthPageShell from '../auth/components/AuthPageShell';
import PasswordField from '../auth/components/PasswordField';

const validate = {
  email: (value) => !value ? 'Email is required' : !/\S+@\S+\.\S+/.test(value) ? 'Enter a valid email' : '',
  password: (value) => !value ? 'Password is required' : value.length < 6 ? 'At least 6 characters' : '',
};

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useLogin();
  const { user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const change = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
    if (touched[name]) setErrors((current) => ({ ...current, [name]: validate[name](value) }));
  };
  const touch = (name) => {
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validate[name](form[name]) }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = { email: validate.email(form.email), password: validate.password(form.password) };
    setTouched({ email: true, password: true });
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    const result = await login(form);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
      return;
    }
    const message = result.error || 'Login failed';
    if (message.toLowerCase().includes('email')) setErrors((current) => ({ ...current, email: message }));
    else if (message.toLowerCase().includes('pass')) setErrors((current) => ({ ...current, password: message }));
    else toast.error(message);
  };

  return (
    <AuthPageShell title="Welcome back" description="Sign in to continue your conversations" footer="Secure · Private · No ads">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input label="Email" type="email" name="email" value={form.email} onChange={change} onBlur={() => touch('email')} error={touched.email ? errors.email : ''} placeholder="you@example.com" autoComplete="email" fullWidth required icon={<Mail aria-hidden="true" className="h-4 w-4" />} />
        <PasswordField label="Password" name="password" value={form.password} onChange={change} onBlur={() => touch('password')} error={touched.password ? errors.password : ''} placeholder="Enter your password" show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="current-password" />
        <div className="flex items-center justify-between gap-3 text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-gray-600 dark:text-gray-400"><input type="checkbox" className="h-3.5 w-3.5 rounded accent-indigo-600 focus-visible:outline-indigo-500" />Remember me</label>
          <Link to="/forgot-password" className="font-medium text-indigo-600 transition-colors hover:text-indigo-700 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">Forgot password?</Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={isLoading} className="mt-1">Sign in</Button>
      </form>
      <div className="my-5"><div className="divider" /></div>
      <p className="text-center text-xs text-gray-500 dark:text-gray-400">No account yet?{' '}<Link to="/signup" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">Create one free</Link></p>
    </AuthPageShell>
  );
};

export default Login;
