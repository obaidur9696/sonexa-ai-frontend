import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NewChatButton = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollTimerRef = useRef(null);

  useEffect(() => () => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
  }, []);

  const handleNewChat = () => {
    const scroll = () => {
      document.getElementById('start-session')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (location.pathname === '/') { scroll(); }
    else {
      navigate('/');
      scrollTimerRef.current = setTimeout(scroll, 320);
    }
  };

  if (!isOpen) {
    return (
      <div className="relative group">
        <button
          onClick={handleNewChat}
          aria-label="New conversation"
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-white cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #9333ea)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <span className="tooltip tooltip-right">New Conversation</span>
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleNewChat}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #9333ea)', boxShadow: '0 4px 14px rgba(99,102,241,0.30)' }}
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
      New Conversation
    </motion.button>
  );
};

export default NewChatButton;
