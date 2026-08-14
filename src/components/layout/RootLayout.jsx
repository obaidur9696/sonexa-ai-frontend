import { Outlet, useLocation } from 'react-router-dom';
import { Suspense, useState, useEffect } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  if (isLoading) return <Loader size="lg" fullScreen />;

  const shouldShowSidebar = user && isSidebarRoute(location.pathname);
  const showMobileToggle = shouldShowSidebar && isMobile;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Fixed Header Container - Only shows when logged in on mobile */}
      {showMobileToggle && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
          <div className="flex items-center h-14 px-4">
            {/* Hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-card border border-gray-200 hover:shadow-card-md transition-shadow"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          onMobileClose={() => setMobileMenuOpen(false)}
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