import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SonexaLogo from '../../../components/ui/Logo/SonexaLogo';
import ThemeToggle from '../../../components/ui/ThemeToggle/ThemeToggle';

const AuthPageShell = ({ title, description, children, footer, maxWidth = 'max-w-md', compact = false }) => (
  <main className={`auth-page-shell ${compact ? 'auth-page-shell--scrollable overflow-x-hidden' : 'overflow-hidden'} bg-[#f8f7ff] text-gray-900 dark:bg-[#09090b] dark:text-gray-100`}>
    <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,2fr)_minmax(28rem,3fr)]">
      <aside className="relative hidden h-full overflow-hidden bg-[#17122b] lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(139,92,246,0.58),transparent_34%),radial-gradient(circle_at_86%_80%,rgba(59,130,246,0.35),transparent_38%)]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:3rem_3rem]" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute bottom-[-11rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full border border-white/10" />

        <Link to="/" aria-label="Return to Sonexa AI home" className="relative z-10 flex w-fit items-center gap-3 rounded-xl px-8 pt-8 transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white xl:px-12 xl:pt-10">
          <SonexaLogo size={42} showText={false} />
          <span className="text-sm font-semibold tracking-wide text-white">Sonexa AI</span>
        </Link>

        <div className="relative z-10 flex flex-1 items-center justify-center px-12">
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="relative aspect-square w-full max-w-[30rem]">
            <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_26s_linear_infinite] motion-reduce:animate-none" />
            <div className="absolute inset-7 rounded-full border border-dashed border-violet-200/25 animate-[spin_19s_linear_infinite_reverse] motion-reduce:animate-none" />
            <div className="absolute inset-[22%] rounded-full bg-white/[0.07] shadow-[0_0_80px_rgba(139,92,246,0.35)] animate-pulse motion-reduce:animate-none" />
            <div className="absolute left-[10%] top-[26%] h-3 w-3 rounded-full bg-violet-200 shadow-[0_0_24px_rgba(221,214,254,0.95)] animate-ping motion-reduce:animate-none" />
            <div className="absolute right-[12%] top-[18%] h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_20px_rgba(165,243,252,0.9)] animate-pulse motion-reduce:animate-none" />
            <div className="absolute bottom-[20%] left-[15%] h-2.5 w-2.5 rounded-full bg-fuchsia-200 shadow-[0_0_20px_rgba(245,208,254,0.9)] animate-pulse motion-reduce:animate-none" />
            <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/20 bg-white/[0.1] shadow-2xl backdrop-blur-sm animate-float motion-reduce:animate-none">
              <div className="absolute left-7 right-7 top-8 h-1.5 rounded-full bg-violet-100/90" />
              <div className="absolute left-7 right-14 top-14 h-1.5 rounded-full bg-white/55" />
              <div className="absolute bottom-8 left-7 right-7 flex gap-2"><span className="h-7 flex-1 rounded-lg bg-violet-300/30" /><span className="h-7 w-7 rounded-lg bg-cyan-200/30" /></div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-8 right-8 z-10 xl:bottom-16 xl:left-12 xl:right-12">
          <p className="max-w-sm text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">Your next great conversation starts here.</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-violet-100/75">A focused space to practise naturally, reflect clearly, and grow with every session.</p>
        </div>
      </aside>

      <section className={`relative flex h-full min-h-0 items-center justify-center px-4 py-4 sm:px-6 sm:py-8 lg:px-10 xl:px-14 ${compact ? 'py-3 sm:py-6' : ''}`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(139,92,246,0.14),transparent_28%),radial-gradient(circle_at_10%_90%,rgba(99,102,241,0.1),transparent_32%)] dark:bg-[radial-gradient(circle_at_90%_10%,rgba(139,92,246,0.18),transparent_28%),radial-gradient(circle_at_10%_90%,rgba(99,102,241,0.12),transparent_32%)]" />
        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6"><ThemeToggle /></div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className={`relative z-10 max-h-full w-full ${maxWidth}`}>
          <header className={`${compact ? 'mb-2 sm:mb-4' : 'mb-4 sm:mb-5'}`}>
            <Link to="/" aria-label="Return to Sonexa AI home" className="mb-2 inline-flex rounded-xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 lg:hidden"><SonexaLogo size={40} showText={false} /></Link>
            <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Sonexa AI</p>
            <h1 id="auth-page-title" className={`${compact ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-4xl'} font-bold tracking-tight text-gray-950 dark:text-white`}>{title}</h1>
            <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
          </header>
          <section className={`rounded-3xl border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(79,70,229,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/80 dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] ${compact ? 'p-4 sm:p-7' : 'p-5 sm:p-7'}`} aria-labelledby="auth-page-title">{children}</section>
          {footer && <p className={`${compact ? 'mt-3 sm:mt-5' : 'mt-5'} text-center text-[0.65rem] uppercase tracking-wider text-gray-400 dark:text-gray-500`}>{footer}</p>}
        </motion.div>
      </section>
    </div>
  </main>
);

export default AuthPageShell;
