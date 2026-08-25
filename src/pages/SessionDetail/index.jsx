import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { useSession } from '../../hooks/useSessions';
import Loader from '../../components/ui/Loader/Loader';
import Button from '../../components/ui/Button/Button';

// UI field names are intentionally fixed in English. Only AI-generated insight
// values (title, summary, feedback, levels, strengths, improvements) are localized.
const UI = {
  back: 'Back to sessions',
  notFound: 'Session not found',
  notFoundBody: 'This session may have been deleted or you may not have access to it.',
  returnHome: 'Return home',
  loading: 'Loading your session report…',
  completed: 'Completed',
  active: 'In progress',
  duration: 'Duration',
  words: 'Total words',
  messages: 'Total messages',
  language: 'Primary language',
  topic: 'Topic',
  summary: 'Session summary',
  overall: 'Overall performance',
  score: 'Score',
  skills: 'Skills at a glance',
  communication: 'Communication',
  engagement: 'Engagement',
  grammar: 'Grammar',
  strengths: 'Strengths',
  improvements: 'Areas to improve',
  noInsights: 'Insights are not available yet',
  noInsightsBody: 'This session is saved. A personalised communication report will appear here once enough user conversation data is available.',
  conversation: 'Conversation messages',
  showConversation: 'Show messages',
  hideConversation: 'Hide messages',
  user: 'User',
  assistant: 'Assistant',
  conversationEnd: 'End of conversation',
  sessionDetails: 'Session details',
  sessionId: 'Session ID',
  copy: 'Copy session ID',
  noData: 'Not enough data',
  userShare: 'User messages',
  assistantShare: 'Assistant messages',
  messageBalance: 'Message balance',
  languagesUsed: 'Languages used',
  ended: 'Ended',
  minute: 'min',
  second: 'sec',
  general: 'General conversation'
};

const Icon = ({ name, className = 'w-4 h-4' }) => {
  const paths = {
    arrowLeft: <path d="M19 12H5m7 7-7-7 7-7" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    message: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.9L3 21l1.6-4.4A8.1 8.1 0 0 1 3 12a8.4 8.4 0 0 1 9-8.5 8.4 8.4 0 0 1 9 8Z" />,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
    language: <><path d="M5 8l6 6M4 14l6-6 2-2M2 5h12M7 2h1M13 20l4-9 4 9m-7-3h6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    sparkles: <><path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3ZM5 16l-.7 2.3L2 19l2.3.7L5 22l.7-2.3L8 19l-2.3-.7L5 16Zm14-1-.9 2.1L16 18l2.1.9L19 21l.9-2.1L22 18l-2.1-.9L19 15Z" /></>,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    bot: <><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8" /></>,
    trendingUp: <><path d="M3 17l5-5 4 4 8-8" /><path d="M19 8h-4m4 0v4" /></>,
    barChart: <><path d="M4 20h16M6 16v4M12 12v8M18 8v12" /></>
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const getMessageWordCount = (messages = []) => messages.reduce(
  (total, message) => total + (message.text?.trim().split(/\s+/).filter(Boolean).length || 0),
  0
);

const formatDate = (date, locale) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const formatTime = (date, locale) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const formatDuration = (seconds, locale, t) => {
  const safeSeconds = Number(seconds) || 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  const number = new Intl.NumberFormat(locale);

  if (minutes === 0) {
    return `${number.format(remainingSeconds)} ${t.second}`;
  } else if (remainingSeconds === 0) {
    return `${number.format(minutes)} ${t.minute}`;
  } else {
    return `${number.format(minutes)} ${t.minute} ${number.format(remainingSeconds)} ${t.second}`;
  }
};

// Detects prefers-reduced-motion once; used to switch off the pointer-tilt effect.
const prefersReducedMotion = typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Wraps a dashboard card with a subtle pointer-driven 3D tilt.
 * Kept to the three chart cards only, everything else on the page stays flat and calm.
 */
const TiltCard = ({ children, className = '' }) => {
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 20, mass: 0.6 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 20, mass: 0.6 });

  const handleMouseMove = (event) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 9);
    rotateX.set(-py * 9);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div style={{ perspective: 1100 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
        className={className}
      >
        <div style={{ transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="surface-2 rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
  >
    <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 mb-2">
      <Icon name={icon} className="w-4 h-4 sm:w-5 sm:h-5" />
    </span>
    <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">
      {value}
    </p>
    <p className="text-[0.55rem] sm:text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 mt-0.5">
      {label}
    </p>
  </motion.div>
);

const ScoreRing = ({ score, label, level, scoreLabel }) => {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center h-full justify-center">
      <div className="relative w-32 h-32 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`${label}: ${safeScore}`}>
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-white/10" />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{safeScore}</span>
          <span className="text-[0.58rem] uppercase tracking-wider text-gray-400">{scoreLabel}</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
      <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-300 font-medium" dir="auto">{level}</p>
    </div>
  );
};

/**
 * Beautiful line chart for skill visualization
 */
const SkillChart = ({ axes }) => {
  const usable = axes.filter((axis) => Number.isFinite(Number(axis.score)));
  if (usable.length < 3) {
    return null;
  }

  const chartWidth = 500;
  const chartHeight = 250;
  const padding = { top: 40, bottom: 65, left: 40, right: 25 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Calculate points
  const points = usable.map((axis, index) => {
    const x = padding.left + (index / (usable.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (Math.min(100, Math.max(0, Number(axis.score))) / 100) * graphHeight;
    return { x, y, score: Number(axis.score), label: axis.label };
  });

  // Create path string for the line
  const linePath = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  // Create area path (filled area under the line)
  const areaPath = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ` L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`;

  // Function to split label into two lines with proper hyphenation
  const formatLabel = (label) => {
    // Special case for "Grammar"
    if (label.toLowerCase() === 'grammar') {
      return {
        line1: 'Gram-',
        line2: 'mar'
      };
    }

    // Split by space first
    const words = label.split(' ');

    if (words.length > 1) {
      // For multi-word labels
      if (words.length === 2) {
        const firstWord = words[0];
        const secondWord = words[1];

        // Check if first word is long
        if (firstWord.length > 7) {
          const mid = Math.ceil(firstWord.length / 2);
          return {
            line1: firstWord.slice(0, mid) + '-',
            line2: firstWord.slice(mid) + ' ' + secondWord
          };
        } else {
          return {
            line1: firstWord,
            line2: secondWord
          };
        }
      } else {
        // More than 2 words
        const half = Math.ceil(words.length / 2);
        return {
          line1: words.slice(0, half).join(' '),
          line2: words.slice(half).join(' ')
        };
      }
    } else {
      // Single word
      const word = words[0];
      if (word.length > 7) {
        // Find a good break point
        const breakPoint = Math.ceil(word.length / 2);
        return {
          line1: word.slice(0, breakPoint) + '-',
          line2: word.slice(breakPoint)
        };
      } else {
        return {
          line1: word,
          line2: null
        };
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full max-w-[520px] h-auto"
        role="img"
        aria-label="Skills performance chart"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Grid lines with values */}
        {[0, 20, 40, 60, 80, 100].map((value) => {
          const y = padding.top + graphHeight - (value / 100) * graphHeight;
          return (
            <g key={value}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + graphWidth}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                className="text-gray-400 dark:text-gray-500"
                strokeDasharray="6 6"
              />
              <text
                x={padding.left - 12}
                y={y + 5}
                textAnchor="end"
                className="fill-gray-400 dark:fill-gray-500 text-[11px] font-semibold"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Y-axis label */}
        <text
          x={padding.left - 30}
          y={padding.top + graphHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90, ${padding.left - 30}, ${padding.top + graphHeight / 2})`}
          className="fill-gray-400 dark:fill-gray-500 text-[10px] font-medium tracking-wider"
        >
          SCORE
        </text>

        {/* Filled area under curve with animation */}
        <motion.path
          d={areaPath}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        />

        {/* Main line with glow */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />

        {/* Data points with values */}
        {points.map((p, index) => (
          <motion.g
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.12, duration: 0.5, type: 'spring', stiffness: 200 }}
          >
            {/* Outer glow ring */}
            <circle
              cx={p.x}
              cy={p.y}
              r="18"
              fill="#6366f1"
              opacity="0.08"
            />
            {/* Middle glow ring */}
            <circle
              cx={p.x}
              cy={p.y}
              r="10"
              fill="#6366f1"
              opacity="0.15"
            />
            {/* Main point */}
            <circle
              cx={p.x}
              cy={p.y}
              r="6"
              fill="#6366f1"
              stroke="#fff"
              strokeWidth="3"
              className="dark:stroke-gray-900"
              filter="url(#shadow)"
            />
            {/* Value label above point - LARGER FONT */}
            <text
              x={p.x}
              y={p.y - 22}
              textAnchor="middle"
              className="fill-gray-800 dark:fill-gray-200 text-[15px] font-extrabold"
              filter="url(#shadow)"
            >
              {Math.round(p.score)}
            </text>
            {/* Small decorative dot */}
            <circle
              cx={p.x}
              cy={p.y + 2}
              r="2"
              fill="#818cf8"
              opacity="0.4"
            />
          </motion.g>
        ))}

        {/* Labels on X axis with proper hyphenation */}
        {usable.map((axis, index) => {
          const x = padding.left + (index / (usable.length - 1)) * graphWidth;
          const formatted = formatLabel(axis.label);

          return (
            <g key={axis.label}>
              <text
                x={x}
                y={padding.top + graphHeight + 25}
                textAnchor="middle"
                className="fill-gray-700 dark:fill-gray-300 text-[12px] font-bold"
              >
                <tspan x={x} dy="0">{formatted.line1}</tspan>
                {formatted.line2 && (
                  <tspan x={x} dy="1.4em">{formatted.line2}</tspan>
                )}
              </text>
              {/* Decorative line below label */}
              <line
                x1={x - 15}
                y1={padding.top + graphHeight + 42 + (formatted.line2 ? 0 : 0)}
                x2={x + 15}
                y2={padding.top + graphHeight + 42 + (formatted.line2 ? 0 : 0)}
                stroke="#6366f1"
                strokeWidth="2"
                opacity="0.15"
                strokeLinecap="round"
              />
              {/* Small dot below label */}
              <circle
                cx={x}
                cy={padding.top + graphHeight + 42 + (formatted.line2 ? 0 : 0)}
                r="3"
                fill="#6366f1"
                opacity="0.3"
              />
            </g>
          );
        })}
      </svg>

      {/* Detailed feedback below - stays exactly as is */}
      <div className="w-full mt-6 divide-y divide-gray-100 dark:divide-white/10">
        {usable.map((axis) => (
          <div key={axis.label} className="py-3 first:pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {axis.label}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                {Math.round(axis.score)}
              </span>
            </div>
            {axis.level && (
              <p className="mt-0.5 text-xs text-indigo-600 dark:text-indigo-300 font-medium" dir="auto">
                {axis.level}
              </p>
            )}
            {axis.feedback && (
              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400" dir="auto">
                {axis.feedback}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const MessageBalance = ({ userMessages, assistantMessages, t }) => {
  const total = userMessages + assistantMessages;
  const userPercent = total ? Math.round((userMessages / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center text-center h-full justify-center">
      <div
        className="w-32 h-32 rounded-full relative shrink-0"
        style={{ background: `conic-gradient(#6366f1 0 ${userPercent}%, #a855f7 ${userPercent}% 100%)` }}
        role="img"
        aria-label={`${t.userShare}: ${userPercent}%`}
      >
        <div className="absolute inset-3 rounded-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{userPercent}%</span>
          <span className="text-[0.58rem] uppercase tracking-wider text-gray-400">{t.userShare}</span>
        </div>
      </div>
      <div className="mt-5 space-y-2.5 text-sm w-full max-w-[180px]">
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />{t.user}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{userMessages}</span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" />{t.assistant}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{assistantMessages}</span>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ icon, title, tone = 'indigo', children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <TiltCard className={`card-md p-5 sm:p-6 h-full ${className}`}>
      <div className="flex items-center gap-2.5 mb-5">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone === 'purple' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'}`}>
          <Icon name={icon} />
        </span>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </TiltCard>
  </motion.div>
);

const FeedbackList = ({ title, icon, items, emptyText, tone = 'indigo' }) => (
  <div className="card-md p-5 sm:p-6 h-full">
    <div className="flex items-center gap-2.5 mb-5">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'}`}>
        <Icon name={icon} />
      </span>
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
    {items.length ? (
      <ul className="space-y-3">
        {items.map((item, index) => (
          <motion.li
            key={`${item}-${index}`}
            className="flex gap-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
            dir="auto"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${tone === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    ) : (
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{emptyText}</p>
    )}
  </div>
);

const MessageBubble = ({ message, index, t, locale }) => {
  const isUser = String(message.sender).toLowerCase() === 'user';
  const senderLabel = isUser ? t.user : t.assistant;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.4), duration: 0.28 }}
      className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <span className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${isUser ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-gray-800 dark:bg-gray-700 text-white'}`}>
        <Icon name={isUser ? 'user' : 'bot'} className="w-4 h-4" />
      </span>
      <div className={`group max-w-[82%] sm:max-w-[72%] ${isUser ? 'text-right' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm' : 'surface-2 text-gray-800 dark:text-gray-100 rounded-bl-sm'}`}>
          <p className="whitespace-pre-wrap text-left" dir="auto">{message.text}</p>
          <div className={`mt-2 flex items-center gap-2 text-[0.62rem] ${isUser ? 'text-white/65 justify-end' : 'text-gray-400 dark:text-gray-500'}`}>
            <span>{senderLabel}</span>
            <span>•</span>
            <time>{formatTime(message.timestamp, locale)}</time>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(message.text)}
          className="mt-1.5 inline-flex items-center gap-1 text-[0.65rem] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          aria-label={t.copy}
        >
          <Icon name="copy" className="w-3 h-3" />
        </button>
      </div>
    </motion.article>
  );
};

// ── Copy Button with Check Animation ──
const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(resetTimerRef.current), []);

  const handleCopy = () => {
    if (textToCopy) {
      navigator.clipboard?.writeText(textToCopy);
      setCopied(true);
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 shrink-0 transition-colors duration-200 cursor-pointer"
      aria-label={UI.copy}
    >
      <Icon name={copied ? 'check' : 'copy'} className="w-3.5 h-3.5" />
    </button>
  );
};

const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, isLoading, error } = useSession(sessionId);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const conversationRef = useRef(null);
  const report = session?.insights;
  const insightReady = report?.analysisStatus?.completed === true;
  const languageCode = String(report?.languages?.primary || session?.preferences?.language || 'en').toLowerCase();
  const t = UI;
  const locale = languageCode;

  useEffect(() => {
    if (!conversationOpen || !session?.messages?.length) return undefined;
    const timer = window.setTimeout(() => conversationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => window.clearTimeout(timer);
  }, [conversationOpen, session?.messages?.length]);

  const conversationMetrics = useMemo(() => {
    const messages = session?.messages || [];
    const totalMessages = session?.totalMessages ?? messages.length;
    const totalWords = session?.totalWords ?? getMessageWordCount(messages);
    const userMessages = messages.filter((message) => String(message.sender).toLowerCase() === 'user').length;

    return {
      totalMessages,
      totalWords,
      userMessages,
      assistantMessages: Math.max(0, messages.length - userMessages),
      duration: session?.totalTalkTimeSeconds ?? session?.duration ?? 0
    };
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center px-4">
        <div className="text-center">
          <Loader size="lg" />
          <p className="text-body mt-4">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <span className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
            <Icon name="message" className="w-7 h-7" />
          </span>
          <h1 className="text-heading-2 mb-2">{t.notFound}</h1>
          <p className="text-body mb-6">{t.notFoundBody}</p>
          <Button onClick={() => navigate('/')}>{t.returnHome}</Button>
        </motion.div>
      </div>
    );
  }

  // ✅ Use session.title directly from API
  const displayTitle = session.title || session.preferences?.topic || t.general;

  const detectedLanguages = [
    ...(report?.languages?.primary ? [report.languages.primary] : [session.preferences?.language || 'en']),
    ...(report?.languages?.detected || [])
  ].filter((language, index, array) => language && array.indexOf(language) === index);

  const skillAxes = [
    { label: t.communication, ...report?.communicationSkill },
    { label: t.engagement, ...report?.engagement },
    { label: t.grammar, ...report?.grammar }
  ].filter((item) => item.status && Number.isFinite(Number(item.score)));

  const strengths = report?.strengths?.status ? (report.strengths.items || []) : [];
  const improvements = report?.improvements?.status ? (report.improvements.items || []) : [];
  const overall = report?.overallConversation;
  const sessionStatus = session.status === 'ended' ? t.completed : t.active;

  return (
    <div className="min-h-screen page-gradient relative overflow-x-hidden" dir="auto">
      <div className="orb orb-brand-1 animate-orb-pulse pointer-events-none" />
      <div className="orb orb-brand-2 animate-orb-alt pointer-events-none" style={{ bottom: '14%', right: '-8rem' }} />

      <main className="w-full py-6 sm:py-9 relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <motion.header initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-gray-400 dark:hover:text-indigo-300"
          >
            <Icon name="arrowLeft" className="w-4 h-4" />
            {t.back}
          </button>
        </motion.header>

        {/* Hero: everything a person needs at first glance, shown exactly once. */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }} className="card-md overflow-hidden mb-5">
          <div className="h-1 w-full" style={{ background: 'var(--grad-brand)' }} />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${session.status === 'ended' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${session.status === 'ended' ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`} />
                {sessionStatus}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Icon name="calendar" className="w-3.5 h-3.5" />
                {formatDate(session.createdAt, locale)}
              </span>
            </div>
            {/* ✅ Only ONE title - no duplicate */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white break-words" dir="auto">{displayTitle}</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-5 sm:mt-7">
              <MetricCard icon="clock" label={t.duration} value={formatDuration(conversationMetrics.duration, locale, t)} delay={0.1} />
              <MetricCard icon="document" label={t.words} value={new Intl.NumberFormat(locale).format(conversationMetrics.totalWords)} delay={0.15} />
              <MetricCard icon="message" label={t.messages} value={new Intl.NumberFormat(locale).format(conversationMetrics.totalMessages)} delay={0.2} />
              <MetricCard icon="language" label={t.language} value={languageCode.toUpperCase()} delay={0.25} />
            </div>
          </div>
        </motion.section>

        {insightReady ? (
          <>
            {/* Executive summary — the one place the narrative text lives. */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="card-md p-5 sm:p-7 mb-5 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-[0.07] pointer-events-none" style={{ background: 'var(--grad-brand)' }} />
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                  <Icon name="sparkles" />
                </span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{t.summary}</h2>
              </div>
              <p className="text-sm sm:text-[0.94rem] leading-7 text-gray-700 dark:text-gray-300 relative" dir="auto">
                {report?.summary?.status ? report.summary.value : t.noData}
              </p>
            </motion.section>

            {/* The dashboard: three distinct visualizations, none repeating the same data. */}
            <section className="grid xl:grid-cols-[1.2fr_1fr] gap-5 mb-5">
              <DashboardCard icon="activity" title={t.skills} delay={0.15}>
                {skillAxes.length ? <SkillChart axes={skillAxes} /> : <p className="text-sm text-gray-500 dark:text-gray-400 py-10 text-center">{t.noData}</p>}
              </DashboardCard>

              <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-5">
                <DashboardCard icon="sparkles" title={t.overall} tone="purple" delay={0.2}>
                  {overall?.status && Number.isFinite(Number(overall.score)) ? (
                    <ScoreRing score={overall.score} label={t.overall} level={overall.level} scoreLabel={t.score} />
                  ) : (
                    <div className="h-full flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-8">
                      {t.noData}
                    </div>
                  )}
                </DashboardCard>

                <DashboardCard icon="message" title={t.messageBalance} delay={0.25}>
                  <MessageBalance userMessages={conversationMetrics.userMessages} assistantMessages={conversationMetrics.assistantMessages} t={t} />
                </DashboardCard>
              </div>
            </section>

            <section className="grid xl:grid-cols-2 gap-5 mb-5">
              <FeedbackList title={t.strengths} icon="check" items={strengths} emptyText={t.noData} tone="emerald" />
              <FeedbackList title={t.improvements} icon="sparkles" items={improvements} emptyText={t.noData} />
            </section>
          </>
        ) : (
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card-md p-6 sm:p-8 mb-5">
            <div className="max-w-2xl mx-auto text-center">
              <span className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                <Icon name="sparkles" className="w-6 h-6" />
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.noInsights}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{t.noInsightsBody}</p>
            </div>
          </motion.section>
        )}

        <section ref={conversationRef} className="card-md overflow-hidden mb-5">
          <button
            type="button"
            onClick={() => setConversationOpen((open) => !open)}
            aria-expanded={conversationOpen}
            aria-controls="session-conversation"
            className="w-full p-5 sm:px-6 sm:py-5 flex items-center justify-between gap-4 text-left transition-colors hover:bg-gray-50/70 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-indigo-500 dark:hover:bg-white/[0.02]"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <Icon name="message" />
              </span>
              <span>
                <span className="block text-base font-bold text-gray-900 dark:text-white">{t.conversation}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{conversationMetrics.totalMessages} {t.messages}</span>
              </span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 shrink-0 cursor-pointer">
              <span className="hidden sm:inline">{conversationOpen ? t.hideConversation : t.showConversation}</span>
              <Icon name="chevronDown" className={`w-4 h-4 transition-transform ${conversationOpen ? 'rotate-180' : ''}`} />
            </span>
          </button>

          <AnimatePresence initial={false}>
            {conversationOpen && (
              <motion.div id="session-conversation" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden">
                <div className="border-t border-gray-100 dark:border-white/10 px-5 py-6 sm:px-7 space-y-5">
                  {session.messages?.map((message, index) => (
                    <MessageBubble key={`${message.timestamp}-${index}`} message={message} index={index} t={t} locale={locale} />
                  ))}
                  <div className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-400 dark:text-gray-500">
                    <Icon name="check" className="w-3.5 h-3.5 text-emerald-500" />
                    {t.conversationEnd}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Everything below is metadata not already shown above: end time, full language list, session id. */}
        <section className="mb-3">
          <button type="button" onClick={() => setDetailsOpen((open) => !open)} aria-expanded={detailsOpen} aria-controls="session-metadata" className="w-full flex items-center justify-between gap-4 rounded-lg py-3 text-sm text-gray-500 transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-gray-400 dark:hover:text-indigo-300">
            <span className="font-medium">{t.sessionDetails}</span>
            <Icon name="chevronDown" className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {detailsOpen && (
              <motion.div id="session-metadata" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }} className="overflow-hidden">
                <div className="surface-2 rounded-2xl p-4 sm:p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.ended}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100 break-words">{formatDate(session.endedAt, locale)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{t.languagesUsed}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {detectedLanguages.map((language) => (
                        <span key={language} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-white/5 text-xs font-medium text-gray-700 dark:text-gray-200">
                          <Icon name="language" className="w-3 h-3 text-indigo-500" />
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.sessionId}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-gray-700 dark:text-gray-300 break-all">{session.id || session.sessionId}</code>
                      {/* ✅ Copy Button with check animation */}
                      <CopyButton textToCopy={session.id || session.sessionId || ''} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

export default SessionDetail;
