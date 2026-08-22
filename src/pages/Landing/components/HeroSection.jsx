import { memo } from 'react';
import { motion } from 'framer-motion';
import { HERO_PARTICLES, HERO_STATS } from './landingConstants';

const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const HeroSection = memo(({
  user,
  images,
  imagesReady,
  currentImageIndex,
  onSlideChange,
  totalSessions,
  totalTalkTime,
  statsLoading,
  silencePeriod,
}) => {
  const hasImages = imagesReady && images.length > 0;
  const activeImageIndex = Math.min(currentImageIndex, Math.max(images.length - 1, 0));

  return (
    <section className="relative flex min-h-[42rem] items-center overflow-hidden rounded-b-[1.25rem] shadow-[0_20px_80px_rgba(79,70,229,0.15)] dark:shadow-[0_20px_80px_rgba(79,70,229,0.08)] sm:min-h-[46rem] sm:rounded-b-[1.75rem] lg:min-h-[90vh]">
      <div className="absolute inset-0 overflow-hidden">
        {hasImages ? images.map((image, index) => (
          <motion.div key={`${image}-${index}`} className="absolute inset-0" initial={false} animate={{ x: index === activeImageIndex ? 0 : '-100%', opacity: index === activeImageIndex ? 1 : 0 }} transition={{ x: { duration: 0.75, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.25 } }}>
            <div className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${image})`, filter: 'brightness(0.45) contrast(1.1) saturate(1.1)' }} />
          </motion.div>
        )) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute left-6 top-16 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl animate-float-slow sm:left-12 sm:h-72 sm:w-72" />
            <div className="absolute bottom-12 right-4 h-64 w-64 rounded-full bg-purple-500/25 blur-3xl animate-float-alt sm:bottom-20 sm:right-10 sm:h-80 sm:w-80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/85 via-purple-950/75 to-pink-950/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        {HERO_PARTICLES.map((particle) => (
          <motion.span key={particle.id} className="absolute rounded-full bg-white/70" style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }} animate={{ y: [0, -48, 0], x: [0, particle.drift, 0], opacity: [0, 0.9, 0] }} transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex min-h-5 flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium tracking-wide text-white/70 sm:text-sm">
            {statsLoading ? <span className="animate-pulse">Loading conversation statistics…</span> : <>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{totalSessions.toLocaleString()} conversations completed</span>
              {totalTalkTime !== '0s' && <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />{totalTalkTime} total talk time</span>}
            </>}
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 bg-clip-text text-transparent">Voice AI that feels</span><br />
            <span className="relative inline-block">truly human<span className="absolute -bottom-2 inset-x-0 h-1 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" /></span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-white/80 sm:mb-10 sm:text-base md:text-lg">
            Have real conversations, not robotic replies. Experience natural, context-aware AI that understands emotion and responds in <span className="font-semibold text-indigo-200">&lt;{silencePeriod}ms</span>.
          </p>

          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => scrollToSection('start-session')} className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition-shadow hover:shadow-indigo-500/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto sm:px-10 sm:text-base">
              <span className="relative z-10 flex items-center justify-center gap-2.5">{user ? 'Start Premium Session' : 'Start Free Trial'}<svg aria-hidden="true" className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></span>
            </motion.button>
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => scrollToSection('features')} className="w-full rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-white/85 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto sm:px-10 sm:text-base">Explore Features</motion.button>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {HERO_STATS.map((stat, index) => {
              const value = stat.label === 'Latency' ? `<${silencePeriod}ms` : stat.value;
              return <motion.div key={stat.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.06 }} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm transition-colors hover:bg-white/10 sm:p-4">
                <div className="mb-1 text-xl sm:text-2xl">{stat.icon}</div><div className="text-base font-bold tabular-nums text-white sm:text-xl">{value}</div><div className="text-[0.6rem] uppercase tracking-wider text-white/60">{stat.label}</div>
              </motion.div>;
            })}
          </div>

          {hasImages && images.length > 1 && <div className="mt-7 flex items-center justify-center gap-2" aria-label="Hero slides">
            {images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => onSlideChange(index)} aria-label={`Go to slide ${index + 1}`} aria-current={index === activeImageIndex ? 'true' : undefined} className={`rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${index === activeImageIndex ? 'h-2 w-8 bg-white' : 'h-2 w-2 bg-white/35 hover:bg-white/60'}`} />)}
          </div>}
        </motion.div>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-auto w-full"><path d="M0 72 C200 0 400 108 600 48 C800 0 1000 102 1200 36 L1440 12 L1440 120 L0 120 Z" fill="rgba(255,255,255,0.08)" className="dark:fill-white/10" /><path d="M0 82 C300 8 500 114 700 54 C900 8 1100 108 1300 42 L1440 18 L1440 120 L0 120 Z" fill="rgba(255,255,255,0.06)" className="dark:fill-white/10" /></svg>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;
