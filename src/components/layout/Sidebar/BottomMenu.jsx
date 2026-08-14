import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentUser, useLogout } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const BottomMenu = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refetch } = useCurrentUser();
  const { logout } = useLogout();

  const handleLogout = async () => {

    navigate('/', { replace: true });
    const res = await logout();
    if (res.success) {
      // if (typeof refetch === 'function') {
      //   await refetch();
      // }
      toast.success('Signed out');

    }
  };

  return (
    <div className="space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path;
        return (
          <div key={item.id} className="relative group">
            <motion.button
              onClick={() => navigate(item.path)}
              whileHover={{ x: isOpen ? 2 : 0 }}
              whileTap={{ scale: 0.97 }}
              className={[
                'w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150',
                isOpen ? '' : 'justify-center',
                active
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/7 hover:text-gray-900 dark:hover:text-gray-100',
              ].join(' ')}
            >
              <span className={active ? 'text-indigo-600 dark:text-indigo-400' : ''}>{item.icon}</span>
              {isOpen && item.label}
            </motion.button>
            {!isOpen && <span className="tooltip tooltip-right">{item.label}</span>}
          </div>
        );
      })}

      {/* Logout */}
      <div className="relative group">
        <motion.button
          onClick={handleLogout}
          whileTap={{ scale: 0.97 }}
          className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-500/8 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150 ${isOpen ? '' : 'justify-center'
            }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          {isOpen && 'Sign Out'}
        </motion.button>
        {!isOpen && <span className="tooltip tooltip-right">Sign Out</span>}
      </div>
    </div>
  );
};

export default BottomMenu;
