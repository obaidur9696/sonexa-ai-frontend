import { memo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button/Button';
import SonexaLogo from '../../../components/ui/Logo/SonexaLogo';
import ThemeToggle from '../../../components/ui/ThemeToggle/ThemeToggle';

const LandingHeader = memo(({ onLogin, onSignup }) => (
  <header className="sticky top-0 z-50 border-b border-gray-100/70 bg-white/80 backdrop-blur-xl dark:border-white/6 dark:bg-gray-950/80">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between gap-3">
        <Link to="/" aria-label="Sonexa AI home" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500">
          <SonexaLogo size={34} showText />
        </Link>
        <nav aria-label="Account actions" className="flex items-center gap-1.5 sm:gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={onLogin}>Log in</Button>
          <Button variant="primary" size="sm" onClick={onSignup} className="whitespace-nowrap">Sign up free</Button>
        </nav>
      </div>
    </div>
  </header>
));

LandingHeader.displayName = 'LandingHeader';
export default LandingHeader;
