import { Outlet, useLocation } from 'react-router-dom';
import { Suspense, useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar/Sidebar';
import { useAuth } from '../../providers/AuthProvider';
import Loader from '../ui/Loader/Loader';

const SIDEBAR_ROUTES = ['/', '/dashboard', '/profile', '/settings'];
const isSidebarRoute = (path) =>
  SIDEBAR_ROUTES.includes(path) || path.startsWith('/session');

const RootLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuRoute, setMobileMenuRoute] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const mobileMenuButtonRef = useRef(null);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const mobileMenuOpen = mobileMenuRoute === location.pathname;

  const closeMobileMenu = () => {
    setMobileMenuRoute(null);
    window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
  };

  if (isLoading) return <Loader size="lg" fullScreen />;

  const shouldShowSidebar = user && isSidebarRoute(location.pathname);
  const showMobileToggle = shouldShowSidebar && isMobile;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Fixed Header Container - Only shows when logged in on mobile */}
      {showMobileToggle && (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white dark:border-white/10 dark:bg-gray-950">
          <div className="flex items-center h-14 px-4">
            {/* Hamburger button */}
            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setMobileMenuRoute(location.pathname)}
              aria-label="Open sidebar"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-sidebar"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white shadow-card transition-shadow hover:shadow-card-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-white/10 dark:bg-gray-900"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          </div>
        </header>
      )}

      {/* Sidebar */}
      {shouldShowSidebar && (
        <Sidebar
          isMobile={isMobile}
          isOpen={sidebarOpen}
          mobileOpen={mobileMenuOpen}
          onToggleDesktop={() => setSidebarOpen(o => !o)}
          onMobileClose={closeMobileMenu}
        />
      )}

      {/* Main content */}
      <main
        className="transition-all duration-300 ease-smooth"
        style={{
          marginLeft: !isMobile && shouldShowSidebar
            ? sidebarOpen ? '16rem' : '4.5rem'
            : 0,
          marginTop: showMobileToggle ? '3.5rem' : 0,
        }}
      >
        <Suspense fallback={<Loader size="lg" fullScreen />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default RootLayout;
