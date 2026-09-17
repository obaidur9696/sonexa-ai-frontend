import { memo, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button/Button';
import Dropdown from '../../../components/ui/Dropdown/Dropdown';
import Input from '../../../components/ui/Input/Input';
import RangeSlider from '../../../components/ui/RangeSlider/RangeSlider';
import SearchableDropdown from '../../../components/ui/SearchableDropdown/SearchableDropdown';
import { GENDER_OPTIONS } from './landingConstants';
import MicrophoneAccess from './MicrophoneAccess';

const initialForm = {
  name: '', gender: '', language: '', topic: '', voiceAccent: '', discussionDepth: 'concise', sensitivity: 0.7,
};

const RequiredField = ({ id, label, error, children }) => (
  <div id={id} className="field-group">
    <label className="field-label">{label} <span aria-hidden="true" className="text-red-500">*</span></label>
    {children}
    {error && <p className="field-error">{error}</p>}
  </div>
);

const SessionSetup = memo(({
  user,
  languages,
  topics,
  voiceAccents,
  discussionDepth,
  sensitivityRange,
  anonymousMinutes,
  authenticatedMinutes,
  onStart,
}) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({ language: '', topic: '', voiceAccent: '' });
  const [microphoneStatus, setMicrophoneStatus] = useState('checking');
  const setField = useCallback((field, value) => setForm((current) => ({ ...current, [field]: typeof value === 'object' ? value.value : value })), []);

  useEffect(() => {
    let isActive = true;
    let permissionStatus;

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicrophoneStatus('unavailable');
      return undefined;
    }

    const updatePermissionState = () => {
      if (!isActive || !permissionStatus) return;
      setMicrophoneStatus(permissionStatus.state === 'granted' ? 'granted' : permissionStatus.state === 'denied' ? 'denied' : 'prompt');
    };

    const checkPermission = async () => {
      if (!navigator.permissions?.query) {
        if (isActive) setMicrophoneStatus('prompt');
        return;
      }

      try {
        permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        if (!isActive) return;
        updatePermissionState();
        permissionStatus.onchange = updatePermissionState;
      } catch {
        if (isActive) setMicrophoneStatus('prompt');
      }
    };

    checkPermission();
    return () => {
      isActive = false;
      if (permissionStatus) permissionStatus.onchange = null;
    };
  }, []);

  const requestMicrophoneAccess = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicrophoneStatus('unavailable');
      return;
    }

    setMicrophoneStatus('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      stream.getTracks().forEach((track) => track.stop());
      setMicrophoneStatus('granted');
    } catch (error) {
      setMicrophoneStatus(error?.name === 'NotAllowedError' || error?.name === 'SecurityError' ? 'denied' : 'error');
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {
      language: form.language ? '' : 'Please select a language',
      topic: form.topic ? '' : 'Please select a topic',
      voiceAccent: form.voiceAccent ? '' : 'Please select a voice accent',
    };
    const firstError = !form.language ? 'lang-field' : !form.topic ? 'topic-field' : !form.voiceAccent ? 'accent-field' : null;

    setErrors(nextErrors);
    if (firstError) {
      document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (microphoneStatus !== 'granted') return;
    onStart(form);
  };

  const rangeMin = sensitivityRange?.min ?? 0;
  const rangeMax = sensitivityRange?.max ?? 1;
  const sensitivityProgress = rangeMax === rangeMin ? 0 : (form.sensitivity - rangeMin) / (rangeMax - rangeMin);

  return (
    <section id="start-session" className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pb-16 pt-10 dark:from-gray-900 dark:to-gray-950 sm:pb-24 sm:pt-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"><div className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/10" /></div>
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="mb-8 text-center sm:mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Get started instantly</p>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">Begin Your <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Conversation</span></h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">Personalize your AI experience in seconds</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ delay: 0.08 }} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-white/6 dark:bg-gray-900/80">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8 md:p-10">
            {!user && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Name" value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Enter your name" autoComplete="name" fullWidth />
              <Dropdown label="Gender" options={GENDER_OPTIONS} value={form.gender} onChange={(option) => setField('gender', option)} placeholder="Select gender" fullWidth />
            </div>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <RequiredField id="lang-field" label="Language" error={errors.language}><SearchableDropdown options={languages} value={form.language} onChange={(option) => setField('language', option)} placeholder="Select language" fullWidth /></RequiredField>
              <RequiredField id="topic-field" label="Topic" error={errors.topic}><SearchableDropdown options={topics} value={form.topic} onChange={(option) => setField('topic', option)} placeholder="Select topic" fullWidth /></RequiredField>
              <RequiredField id="accent-field" label="Voice Accent" error={errors.voiceAccent}><Dropdown options={voiceAccents} value={form.voiceAccent} onChange={(option) => setField('voiceAccent', option)} placeholder="Select accent" fullWidth /></RequiredField>
            </div>

            <fieldset className="space-y-3"><legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversation Depth</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{discussionDepth.map((depth) => {
                const active = form.discussionDepth === depth.value;
                return <motion.button key={depth.value} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }} onClick={() => setField('discussionDepth', depth.value)} aria-pressed={active} className={`relative rounded-xl border-2 p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${active ? 'border-indigo-500 bg-indigo-50 shadow-sm dark:bg-indigo-500/10' : 'border-gray-200 bg-white/50 hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-indigo-500/30'}`}>
                  {active && <span aria-hidden="true" className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-500" />}<span className="mb-0.5 block truncate text-sm font-bold text-gray-900 dark:text-white">{depth.label}</span><span className="block text-xs leading-tight text-gray-600 dark:text-gray-400">{depth.description}</span>
                </motion.button>;
              })}</div>
            </fieldset>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Microphone Sensitivity</label><span className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 font-mono text-xs font-semibold text-white shadow-sm sm:text-sm">{form.sensitivity.toFixed(2)}</span></div>
              <RangeSlider value={form.sensitivity} min={rangeMin} max={rangeMax} step={sensitivityRange?.step ?? 0.1} onChange={(event) => setField('sensitivity', parseFloat(event.target.value))} aria-label="Microphone Sensitivity" showValue={false} fullWidth />
              <div aria-hidden="true" className="flex h-1.5 gap-1">{Array.from({ length: 10 }).map((_, index) => <span key={index} className={`flex-1 rounded-full transition-colors duration-300 ${sensitivityProgress >= index / 10 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`} />)}</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-blue-200/50 bg-blue-50 p-3 dark:border-blue-500/10 dark:bg-blue-500/5"><span className="text-xl" aria-hidden="true">🏠</span><p><span className="block text-sm font-medium text-gray-900 dark:text-white">Quiet Environment</span><span className="text-xs text-gray-600 dark:text-gray-400">Home, library • 0.5–0.6</span></p></div>
                <div className="flex items-center gap-3 rounded-xl border border-orange-200/50 bg-orange-50 p-3 dark:border-orange-500/10 dark:bg-orange-500/5"><span className="text-xl" aria-hidden="true">☕</span><p><span className="block text-sm font-medium text-gray-900 dark:text-white">Noisy Environment</span><span className="text-xs text-gray-600 dark:text-gray-400">Café, street • 0.6–0.8</span></p></div>
              </div>
            </div>

            <MicrophoneAccess status={microphoneStatus} onRequest={requestMicrophoneAccess} />

            <div className="pt-1"><Button type="submit" fullWidth size="lg" disabled={microphoneStatus !== 'granted'} className="group relative overflow-hidden py-4 text-base sm:text-lg"><span className="relative z-10 flex items-center justify-center gap-2"><span aria-hidden="true">🚀</span>{user ? 'Start Premium Session' : 'Start Free Trial'}</span><span aria-hidden="true" className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" /></Button></div>
            <div className="space-y-2 pt-1 text-center">
              {!user ? <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm"><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-300">{anonymousMinutes}-min free trial</span><span>Sign in for unlimited premium sessions</span></div> : <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm"><span className="mr-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{authenticatedMinutes}-min / sessions</span>Premium access</p>}
              <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-500"><span>🔒 Enterprise security</span><span className="hidden sm:inline" aria-hidden="true">•</span><span>100+ languages</span><span className="hidden sm:inline" aria-hidden="true">•</span><span>1000+ topics</span></p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
});

SessionSetup.displayName = 'SessionSetup';
export default SessionSetup;
