import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import Input from '../../components/ui/Input/Input';
import Dropdown from '../../components/ui/Dropdown/Dropdown';
import RangeSlider from '../../components/ui/RangeSlider/RangeSlider';
import Button from '../../components/ui/Button/Button';
import { useRegister } from '../../hooks/useAuth';
import { useAuth } from '../../providers/AuthProvider';
import AuthPageShell from '../auth/components/AuthPageShell';
import PasswordField from '../auth/components/PasswordField';

const GENDER_OPTIONS = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }, { value: 'prefer-not', label: 'Prefer not to say' }];
const STRENGTH_LEVELS = [{ label: 'Weak', color: 'bg-red-500' }, { label: 'Fair', color: 'bg-amber-500' }, { label: 'Good', color: 'bg-blue-500' }, { label: 'Strong', color: 'bg-emerald-500' }];
const getStrength = (password) => Math.min([password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length, 4);
const validate = {
  firstName: (value) => !value.trim() ? 'First name is required' : '', lastName: (value) => !value.trim() ? 'Last name is required' : '',
  email: (value) => !value ? 'Email is required' : !/\S+@\S+\.\S+/.test(value) ? 'Invalid email' : '',
  password: (value) => !value ? 'Password is required' : value.length < 8 ? 'Min 8 characters' : !/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/.test(value) ? 'Include uppercase, lowercase & number' : '',
  confirmPassword: (value, password) => !value ? 'Confirm your password' : value !== password ? "Passwords don't match" : '',
  gender: (value) => !value ? 'Please select gender' : '',
};

const Signup = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useRegister();
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', gender: '', age: 25 });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const passwordStrength = useMemo(() => getStrength(form.password), [form.password]);

  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = { firstName: validate.firstName(form.firstName), lastName: validate.lastName(form.lastName), email: validate.email(form.email), password: validate.password(form.password), confirmPassword: validate.confirmPassword(form.confirmPassword, form.password), gender: validate.gender(form.gender) };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    const { confirmPassword: _confirmPassword, ...payload } = form;
    const result = await register(payload);
    if (result.success) { toast.success('Account created! Please sign in.'); navigate('/login'); return; }
    const message = result.error || 'Registration failed';
    if (message.toLowerCase().includes('email')) setErrors((current) => ({ ...current, email: 'Email already in use' }));
    else toast.error(message);
  };

  return (
    <AuthPageShell title="Create your account" description="Join Sonexa AI and start natural conversations" maxWidth="max-w-2xl" footer="Your data is private and secure">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="First Name" value={form.firstName} onChange={change('firstName')} error={errors.firstName} placeholder="Jane" autoComplete="given-name" fullWidth required /><Input label="Last Name" value={form.lastName} onChange={change('lastName')} error={errors.lastName} placeholder="Smith" autoComplete="family-name" fullWidth required /></div>
        <Input label="Email Address" type="email" value={form.email} onChange={change('email')} error={errors.email} placeholder="you@example.com" autoComplete="email" fullWidth required icon={<Mail aria-hidden="true" className="h-4 w-4" />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><PasswordField label="Password" name="password" value={form.password} onChange={change('password')} error={errors.password} placeholder="Create password" show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="new-password" />
            {form.password && <div className="mt-2" aria-live="polite"><div className="mb-1 flex gap-1">{[1, 2, 3, 4].map((level) => <span key={level} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${level <= passwordStrength ? STRENGTH_LEVELS[passwordStrength - 1]?.color : 'bg-gray-200 dark:bg-white/10'}`} />)}</div><p className="text-[0.65rem] text-gray-400 dark:text-gray-500">Password strength: {STRENGTH_LEVELS[passwordStrength - 1]?.label ?? 'Weak'}</p></div>}
          </div>
          <PasswordField label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={change('confirmPassword')} error={errors.confirmPassword} placeholder="Confirm password" show={showConfirmation} onToggle={() => setShowConfirmation((visible) => !visible)} autoComplete="new-password" />
        </div>
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2"><Dropdown label="Gender" options={GENDER_OPTIONS} value={form.gender} onChange={(option) => setForm((current) => ({ ...current, gender: option.value }))} placeholder="Select gender" error={errors.gender} fullWidth /><div className="field-group"><label className="field-label">Age <span className="ml-2 text-xs font-bold normal-case tracking-normal text-indigo-600 dark:text-indigo-400">{form.age} yrs</span></label><div className="pt-3"><RangeSlider value={form.age} min={13} max={100} step={1} onChange={(event) => setForm((current) => ({ ...current, age: Number(event.target.value) }))} showValue={false} fullWidth /><div className="mt-1.5 flex justify-between text-[0.65rem] text-gray-400 dark:text-gray-500"><span>13</span><span>100</span></div></div></div></div>
        <Button type="submit" fullWidth size="lg" loading={isLoading}>Create account</Button>
      </form>
      <div className="mt-5"><div className="divider" /></div>
      <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">Already have an account?{' '}<Link to="/login" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">Sign in</Link></p>
    </AuthPageShell>
  );
};

export default Signup;
