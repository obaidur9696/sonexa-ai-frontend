import { memo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button/Button';
import SonexaLogo from '../../../components/ui/Logo/SonexaLogo';
import ThemeToggle from '../../../components/ui/ThemeToggle/ThemeToggle';

const LandingHeader = memo(({ onLogin, onSignup }) => (
  <header className="sticky top-0 z-50 border-b border-gray-100/70 bg-white/80 backdrop-blur-xl dark:border-white/6 dark:bg-gray-950/80">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-15 items-center justify-between gap-2 sm:h-16 sm:gap-3">
        <Link to="/" aria-label="Sonexa AI home" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500">
          <SonexaLogo size={30} showText className="sm:hidden" />
          <SonexaLogo size={34} showText className="hidden sm:flex" />
        </Link>
        <nav aria-label="Account actions" className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <ThemeToggle compact />
          <Button variant="ghost" size="sm" onClick={onLogin} className="!px-2 sm:!px-3">Log in</Button>
          <Button variant="ghost" size="sm" onClick={onSignup} className="whitespace-nowrap !px-2 !text-indigo-600 hover:!bg-indigo-50 hover:!text-indigo-700 dark:!text-indigo-300 dark:hover:!bg-indigo-500/10 dark:hover:!text-indigo-200 sm:!px-3">Sign up</Button>
        </nav>
      </div>
    </div>
  </header>
));

LandingHeader.displayName = 'LandingHeader';
export default LandingHeader;
