/* ============================================================
   VoiceScreens.jsx - Premium Animation Version
   
   Middle content area — changes based on connectionState.
   
   States rendered:
     idle / connecting → ConnectingScreen (animated loader)
     connected         → MessageList (live conversation)

   States NOT rendered here (handled by overlays):
     failed  → FailedOverlay.jsx
     ended   → SessionEndedOverlay.jsx
   ============================================================ */

import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../ui/Loader/Loader';

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ══════════════════════════════════════════════════════════════ */

// User avatar rotates through one of these themes each speaking turn
const USER_TURN_THEMES = [
  {
    gradient : 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    glow     : 'rgba(249,115,22,0.45)',
    ring     : 'rgba(249,115,22,0.3)',
  },
  {
    gradient : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    glow     : 'rgba(139,92,246,0.45)',
    ring     : 'rgba(139,92,246,0.3)',
  },
  {
    gradient : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    glow     : 'rgba(6,182,212,0.45)',
    ring     : 'rgba(6,182,212,0.3)',
  },
  {
    gradient : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    glow     : 'rgba(16,185,129,0.45)',
    ring     : 'rgba(16,185,129,0.3)',
  },
  {
    gradient : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    glow     : 'rgba(245,158,11,0.45)',
    ring     : 'rgba(245,158,11,0.3)',
  },
  {
    gradient : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    glow     : 'rgba(236,72,153,0.45)',
    ring     : 'rgba(236,72,153,0.3)',
  },
];

/* ══════════════════════════════════════════════════════════════
   GLOBAL STYLES (injected once)
   ══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @keyframes vc-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.15; }
  }

  @keyframes vc-char-in {
    0% { 
      opacity: 0; 
      transform: translateY(8px) scale(0.92);
      filter: blur(3px);
    }
    50% {
      transform: translateY(-2px) scale(1.04);
    }
    70% {
      transform: translateY(0px) scale(0.98);
    }
    100% { 
      opacity: 1; 
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes vc-bubble-in {
    from { 
      opacity: 0; 
      transform: scale(0.95) translateY(16px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }

  @keyframes vc-avatar-pop {
    0%   { transform: scale(0.5); opacity: 0; }
    70%  { transform: scale(1.15); }
    100% { transform: scale(1);   opacity: 1; }
  }

  /* Scrollbar */
  .vc-scroll::-webkit-scrollbar         { width: 4px; }
  .vc-scroll::-webkit-scrollbar-track   { background: transparent; }
  .vc-scroll::-webkit-scrollbar-thumb   {
    background    : rgba(99,102,241,0.35);
    border-radius : 2px;
  }
  .vc-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(99,102,241,0.65);
  }
  .vc-scroll { scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.35) transparent; }

  /* Character-level animation */
  .vc-char {
    display: inline;
    will-change: transform, opacity, filter;
  }

  /* Cursor */
  .vc-cursor {
    display: inline-block;
    width: 2px;
    height: 1.1em;
    margin-left: 2px;
    border-radius: 1px;
    background: linear-gradient(180deg, #818cf8, #a5b4fc);
    vertical-align: text-bottom;
    animation: vc-blink 0.9s step-end infinite;
  }
`;

let stylesInjected = false;
const injectStyles = () => {
  if (stylesInjected || typeof document === 'undefined') return;
  const tag = document.createElement('style');
  tag.textContent = GLOBAL_CSS;
  document.head.appendChild(tag);
  stylesInjected = true;
};

/* ══════════════════════════════════════════════════════════════
   AVATARS
   ══════════════════════════════════════════════════════════════ */

const UserAvatar = memo(({ turnIndex }) => {
  const theme = USER_TURN_THEMES[turnIndex % USER_TURN_THEMES.length];
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{
        flexShrink   : 0,
        width        : '38px',
        height       : '38px',
        borderRadius : '50%',
        background   : theme.gradient,
        boxShadow    : `0 0 0 2px ${theme.ring}, 0 4px 14px ${theme.glow}`,
        display      : 'flex',
        alignItems   : 'center',
        justifyContent: 'center',
      }}
    >
      {turnIndex % 3 === 0 && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      )}
      {turnIndex % 3 === 1 && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8"  y1="23" x2="16" y2="23"/>
        </svg>
      )}
      {turnIndex % 3 === 2 && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )}
    </motion.div>
  );
});

const BotAvatar = memo(() => (
  <motion.div
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    style={{
      flexShrink    : 0,
      width         : '38px',
      height        : '38px',
      borderRadius  : '50%',
      background    : 'linear-gradient(135deg, #1a1040 0%, #312e81 60%, #4c1d95 100%)',
      boxShadow     : '0 0 0 2px rgba(99,102,241,0.25), 0 4px 16px rgba(79,70,229,0.4)',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
    </svg>
  </motion.div>
));

/* ══════════════════════════════════════════════════════════════
   BOT TEXT RENDERER - Premium Character-Level Animation
   ══════════════════════════════════════════════════════════════ */
const BotText = memo(({ text, isStreaming, knownWordCount }) => {
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const prevCharCount = useRef(0);
  
  // Track total characters shown so far
  useEffect(() => {
    if (text) {
      prevCharCount.current = text.length;
    }
  }, [text]);
  
  const getCharCountBeforeWord = (wordIndex) => {
    let count = 0;
    for (let i = 0; i < wordIndex; i++) {
      count += words[i].length + 1;
    }
    return count;
  };

  return (
    <p style={{ 
      margin: 0, 
      lineHeight: '1.75', 
      fontSize: '15px', 
      fontWeight: 450, 
      color: '#e2e8f0',
      letterSpacing: '0.2px',
      wordBreak: 'break-word',
    }}>
      {words.map((w, i) => {
        const charStart = getCharCountBeforeWord(i);
        const isNewWord = i >= knownWordCount;
        
        return (
          <span key={i} style={{ display: 'inline', whiteSpace: 'pre-wrap' }}>
            {w.split('').map((char, j) => {
              const globalCharIndex = charStart + j;
              const shouldAnimate = isNewWord && globalCharIndex >= (prevCharCount.current || 0);
              const delay = shouldAnimate ? (globalCharIndex - (prevCharCount.current || 0)) * 12 : 0;
              
              return (
                <span
                  key={j}
                  className="vc-char"
                  style={{
                    animation: shouldAnimate ? 'vc-char-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none',
                    animationDelay: `${delay}ms`,
                    display: 'inline',
                    opacity: shouldAnimate ? 0 : 1,
                  }}
                >
                  {char}
                </span>
              );
            })}
            <span style={{ display: 'inline' }}> </span>
          </span>
        );
      })}
      {isStreaming && <span className="vc-cursor" />}
    </p>
  );
});

/* ══════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
   ══════════════════════════════════════════════════════════════ */
const MessageBubble = memo(({ message, userTurnIndex }) => {
  const isUser = message.sender === 'user';
  const prevWordCount = useRef(0);
  const currentWordCount = message.text ? message.text.split(/\s+/).filter(Boolean).length : 0;
  const knownWordCount = prevWordCount.current;

  useEffect(() => { 
    prevWordCount.current = currentWordCount; 
  }, [currentWordCount]);

  /* ── User bubble (right) ── */
  if (isUser) {
    return (
      <motion.div
        layout
        transition={{ 
          layout: { 
            type: 'spring', 
            stiffness: 300, 
            damping: 30 
          } 
        }}
        style={{
          display       : 'flex',
          flexDirection : 'row-reverse',
          alignItems    : 'flex-end',
          gap           : '10px',
          width         : '100%',
        }}
      >
        <UserAvatar turnIndex={userTurnIndex} />

        <motion.div
          layout
          transition={{
            layout: {
              type: 'spring',
              stiffness: 400,
              damping: 35,
            }
          }}
          style={{
            maxWidth     : 'min(72%, 560px)',
            padding      : '12px 16px',
            borderRadius : '20px 20px 4px 20px',
            background   : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)',
            boxShadow    : '0 4px 24px rgba(99,102,241,0.4), 0 1px 4px rgba(0,0,0,0.25)',
            position     : 'relative',
            overflow     : 'hidden',
          }}
        >
          <div style={{
            position  : 'absolute', 
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          <p style={{
            margin     : 0,
            lineHeight : '1.65',
            fontSize   : '14px',
            fontWeight : 500,
            color      : '#fff',
            position   : 'relative',
          }}>
            {message.text}
          </p>

          {message.timestamp && (
            <span style={{
              display    : 'block',
              marginTop  : '5px',
              fontSize   : '10px',
              color      : 'rgba(255,255,255,0.55)',
              textAlign  : 'right',
              position   : 'relative',
            }}>
              {message.timestamp}
            </span>
          )}
        </motion.div>
      </motion.div>
    );
  }

  /* ── Bot bubble (left) ── */
  return (
    <motion.div
      layout
      transition={{ 
        layout: { 
          type: 'spring', 
          stiffness: 300, 
          damping: 30 
        } 
      }}
      style={{
        display    : 'flex',
        alignItems : 'flex-end',
        gap        : '10px',
        width      : '100%',
      }}
    >
      <BotAvatar />

      <motion.div
        layout
        transition={{
          layout: {
            type: 'spring',
            stiffness: 400,
            damping: 35,
          }
        }}
        style={{
          maxWidth    : 'min(72%, 560px)',
          padding     : '12px 16px',
          borderRadius: '20px 20px 20px 4px',
          background  : 'linear-gradient(145deg, #13103a 0%, #1a1654 40%, #1e1b4b 100%)',
          border      : '1px solid rgba(99,102,241,0.22)',
          boxShadow   : [
            '0 4px 24px rgba(0,0,0,0.35)',
            '0 0 0 1px rgba(99,102,241,0.1)',
            'inset 0 1px 0 rgba(255,255,255,0.05)',
            '0 0 32px rgba(79,70,229,0.12)',
          ].join(', '),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position      : 'absolute',
          top           : '-20px',
          left          : '-20px',
          width         : '80px',
          height        : '80px',
          borderRadius  : '50%',
          background    : 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents : 'none',
        }} />

        <BotText
          text={message.text}
          isStreaming={message.isStreaming}
          knownWordCount={knownWordCount}
        />

        {!message.isStreaming && message.timestamp && (
          <span style={{
            display   : 'block',
            marginTop : '5px',
            fontSize  : '10px',
            color     : 'rgba(148,163,184,0.6)',
            position  : 'relative',
          }}>
            {message.timestamp}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
});

/* ══════════════════════════════════════════════════════════════
   EMPTY STATE (connected but no messages yet)
   ══════════════════════════════════════════════════════════════ */
const EmptyConversation = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    style={{
      display        : 'flex',
      flexDirection  : 'column',
      alignItems     : 'center',
      justifyContent : 'center',
      height         : '100%',
      gap            : '12px',
      padding        : '24px',
      textAlign      : 'center',
    }}
  >
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 350, damping: 25 }}
      style={{
        width        : '56px',
        height       : '56px',
        borderRadius : '50%',
        background   : 'linear-gradient(135deg, #312e81, #4c1d95)',
        display      : 'flex',
        alignItems   : 'center',
        justifyContent: 'center',
        boxShadow    : '0 0 0 8px rgba(79,70,229,0.08)',
        marginBottom : '4px',
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
      </svg>
    </motion.div>

    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(148,163,184,0.7)', maxWidth: '200px', lineHeight: '1.6' }}>
      Session is live — speak naturally and the conversation will appear here.
    </p>

    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.6, 1.4, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          style={{
            display      : 'block',
            width        : '3px',
            height       : '16px',
            borderRadius : '2px',
            background   : 'rgba(99,102,241,0.5)',
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   MESSAGE LIST
   ══════════════════════════════════════════════════════════════ */
const MessageList = ({ messages = [] }) => {
  injectStyles();

  const scrollRef = useRef(null);
  const [showBtn, setShowBtn] = useState(false);
  const isUserScrolling = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (nearBottom && !isUserScrolling.current) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowBtn(!atBottom);
    
    // Detect user scrolling
    isUserScrolling.current = true;
    clearTimeout(window._scrollTimeout);
    window._scrollTimeout = setTimeout(() => {
      isUserScrolling.current = false;
    }, 3000);
  }, []);

  const scrollToBottom = useCallback(() => {
    isUserScrolling.current = false;
    scrollRef.current?.scrollTo({ 
      top: scrollRef.current.scrollHeight, 
      behavior: 'smooth' 
    });
  }, []);

  let userTurnCounter = -1;
  const enriched = messages.map(msg => {
    if (msg.sender === 'user') userTurnCounter++;
    return { ...msg, _userTurn: userTurnCounter };
  });

  return (
    <div style={{ 
      position: 'relative', 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      height: '100%', 
      minHeight: 0 
    }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="vc-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {enriched.length === 0 ? (
          <EmptyConversation />
        ) : (
          <AnimatePresence initial={false}>
            {enriched.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MessageBubble
                  message={msg}
                  userTurnIndex={msg._userTurn}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div style={{ height: '8px', flexShrink: 0 }} />
      </div>

      <AnimatePresence>
        {showBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.75, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            onClick={scrollToBottom}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid rgba(99,102,241,0.3)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
            }}
            aria-label="Scroll to bottom"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e0e7ff"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   CONNECTING SCREEN
   ══════════════════════════════════════════════════════════════ */
const ConnectingScreen = () => (
  <motion.div
    key="connecting"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="flex flex-col items-center justify-center w-full h-full min-h-[300px] gap-6 px-4"
  >
    <Loader size="lg" text="Establishing secure connection..." />

    <div className="flex flex-col items-center gap-2 mt-2">
      {[
        'Opening secure channel',
        'Initializing voice engine',
        'Waiting for bot to join',
      ].map((step, i) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + i * 0.3, duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
            className="w-1 h-1 rounded-full bg-indigo-400 dark:bg-indigo-500 shrink-0"
          />
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
            {step}
          </span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   CONNECTED SCREEN (shown briefly before first message)
   ══════════════════════════════════════════════════════════════ */
const ConnectedScreen = () => (
  <motion.div
    key="connected"
    initial={{ opacity: 0, scale: 0.94, y: 12 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.94, y: 12 }}
    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    className="flex flex-col items-center justify-center w-full h-full min-h-[300px] text-center px-4"
  >
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 350, damping: 22 }}
      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-xl shadow-indigo-500/20"
      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)' }}
    >
      <svg className="w-9 h-9 sm:w-11 sm:h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    </motion.div>

    <motion.h3
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2"
    >
      Conversation Started
    </motion.h3>

    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="text-sm text-gray-500 dark:text-gray-400 max-w-[260px] leading-relaxed"
    >
      Your session is live. Speak naturally — the AI is listening and will respond in real‑time.
    </motion.p>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
      className="flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
        Live
      </span>
    </motion.div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   VOICE SCREENS — router component
   ══════════════════════════════════════════════════════════════ */
const VoiceScreens = ({ connectionState, messages = [] }) => {
  if (connectionState === 'connecting' || connectionState === 'idle') {
    return <ConnectingScreen />;
  }

  if (connectionState === 'connected') {
    return <MessageList messages={messages} />;
  }

  return null;
};

export { ConnectingScreen, ConnectedScreen, MessageList, VoiceScreens };
export default VoiceScreens;