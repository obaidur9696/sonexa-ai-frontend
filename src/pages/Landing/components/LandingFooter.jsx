import { memo } from 'react';
import { Link } from 'react-router-dom';
import SonexaLogo from '../../../components/ui/Logo/SonexaLogo';

const LandingFooter = memo(() => (
  <footer className="border-t border-gray-100 bg-white py-6 dark:border-white/6 dark:bg-gray-950">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
      <Link to="/" aria-label="Sonexa AI home" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500"><SonexaLogo size={28} showText /></Link>
      <p className="flex flex-wrap items-center justify-center gap-x-2 text-center text-[11px] text-gray-400 dark:text-gray-500">
        <span>© {new Date().getFullYear()} Sonexa AI</span><span aria-hidden="true">•</span><span>crafted by</span><span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text font-semibold tracking-wide text-transparent">Obaidur Rahman</span>
      </p>
    </div>
  </footer>
));

LandingFooter.displayName = 'LandingFooter';
export default LandingFooter;
