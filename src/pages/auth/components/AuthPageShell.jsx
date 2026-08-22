import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SonexaLogo from '../../../components/ui/Logo/SonexaLogo';
import ThemeToggle from '../../../components/ui/ThemeToggle/ThemeToggle';

const AuthPageShell = ({ title, description, children, footer, maxWidth = 'max-w-md' }) => (
  <main className="min-h-screen page-gradient relative flex items-center justify-center overflow-hidden px-4 py-8 sm:py-10">
    <div className="orb orb-brand-1 animate-orb-pulse pointer-events-none" />
    <div className="orb orb-accent animate-float-slow pointer-events-none" style={{ bottom: '5%', right: '10%' }} />
    <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6"><ThemeToggle /></div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className={`relative z-10 w-full ${maxWidth}`}>
      <header className="mb-6 text-center sm:mb-7">
        <Link to="/" aria-label="Return to Sonexa AI home" className="mb-4 inline-flex rounded-xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500"><SonexaLogo size={40} showText={false} /></Link>
        <h1 id="auth-page-title" className="text-heading-2 mb-1">{title}</h1>
        <p className="text-body">{description}</p>
      </header>
      <section className="card-md p-5 sm:p-7" aria-labelledby="auth-page-title">{children}</section>
      {footer && <p className="mt-5 text-center text-[0.65rem] uppercase tracking-wider text-gray-400 dark:text-gray-500">{footer}</p>}
    </motion.div>
  </main>
);

export default AuthPageShell;
