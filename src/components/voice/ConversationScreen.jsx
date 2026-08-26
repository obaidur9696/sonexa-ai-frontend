import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SonexaLogo from "../ui/Logo/SonexaLogo";

/* ================================
   USER ICON
================================ */
const SpeakingAvatar = ({ children, isSpeaking, waveClass }) => (
  <div className="relative h-8 w-8 shrink-0">
    {isSpeaking && (
      <>
        <div aria-hidden="true" className="absolute -bottom-1 left-1/2 z-20 flex h-2 -translate-x-1/2 items-end gap-px rounded-full bg-white/90 px-1 py-0.5 shadow-sm dark:bg-gray-900/90">
          {[0, 0.16, 0.32].map((delay) => (
            <motion.span
              key={delay}
              className={`w-px rounded-full ${waveClass}`}
              animate={{ height: ['3px', '7px', '3px'] }}
              transition={{ duration: 0.72, repeat: Infinity, delay, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </>
    )}
    <div className="relative z-10 h-8 w-8">
      {children}
    </div>
  </div>
);

const UserIcon = ({ isSpeaking }) => (
  <SpeakingAvatar isSpeaking={isSpeaking} waveClass="bg-indigo-500">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-pink-500 shadow-lg">
      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  </SpeakingAvatar>
);

/* ================================
   BOT ICON
================================ */
const BotIcon = ({ isSpeaking }) => (
  <SpeakingAvatar isSpeaking={isSpeaking} waveClass="bg-violet-500">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
      <SonexaLogo size={18} showText={false} />
    </div>
  </SpeakingAvatar>
);

/* ================================
   MESSAGE BUBBLE
================================ */
const StreamingMessageText = memo(({ text, isStreaming }) => {
  if (!isStreaming) return <p className="whitespace-pre-wrap break-words">{text}</p>;

  const lastSpaceIndex = text.lastIndexOf(' ');
  const completedText = lastSpaceIndex >= 0 ? text.slice(0, lastSpaceIndex + 1) : '';
  const incomingText = lastSpaceIndex >= 0 ? text.slice(lastSpaceIndex + 1) : text;

  return (
    <p className="whitespace-pre-wrap break-words">
      {completedText}
      {incomingText && (
        <motion.span
          key={incomingText}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          {incomingText}
        </motion.span>
      )}
    </p>
  );
});

const MessageBubble = memo(({ message, isSpeaking }) => {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 gap-2`}
    >
      {!isUser && <BotIcon isSpeaking={isSpeaking} />}

      <div
        className={`
          max-w-[85%] px-4 py-3 rounded-2xl
          text-sm sm:text-[15px] leading-relaxed
          shadow-sm relative
          ${
            isUser
              ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-700"
          }
        `}
      >
        <StreamingMessageText text={message.text || ''} isStreaming={message.isStreaming} />

        {/* STREAMING INDICATOR - Only show when actively streaming */}
        {message.isStreaming && message.text && (
          <div className="flex gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-current opacity-60 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-current opacity-60 rounded-full animate-bounce delay-100"></span>
            <span className="w-1.5 h-1.5 bg-current opacity-60 rounded-full animate-bounce delay-200"></span>
          </div>
        )}

        {/* TIMESTAMP */}
        <div
          className={`text-[9px] mt-1.5 ${
            isUser
              ? "text-white/50 text-right"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {message.timestamp}
        </div>
      </div>

      {isUser && <UserIcon isSpeaking={isSpeaking} />}
    </motion.div>
  );
});

/* ================================
   MAIN CONVERSATION SCREEN
================================ */
const ConversationScreen = memo(({ messages, isBotSpeaking }) => {
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [visibleSpeaker, setVisibleSpeaker] = useState(null);
  const followLatestRef = useRef(true);
  const scrollFrameRef = useRef(null);
  const speakerReleaseTimerRef = useRef(null);

  /* ================================
     SCROLL HANDLER
  ================================ */
  const updateScrollPosition = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 64;

    // Ignore scroll events caused by the follow animation itself. User input
    // cancels that animation before it can reach this handler.
    if (scrollFrameRef.current) return;

    followLatestRef.current = nearBottom;
    if (!nearBottom && scrollFrameRef.current) {
      window.cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
    setIsAtBottom((current) => current === nearBottom ? current : nearBottom);
  }, []);

  const pauseFollowing = useCallback(() => {
    followLatestRef.current = false;
    if (scrollFrameRef.current) {
      window.cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    window.cancelAnimationFrame(scrollFrameRef.current);
    window.clearTimeout(speakerReleaseTimerRef.current);
  }, []);

  const smoothlyFollowLatest = useCallback(() => {
    if (scrollFrameRef.current) return;

    const step = () => {
      const el = containerRef.current;
      if (!el || !followLatestRef.current) {
        scrollFrameRef.current = null;
        return;
      }

      const target = Math.max(0, el.scrollHeight - el.clientHeight);
      const distance = target - el.scrollTop;

      if (distance <= 1) {
        el.scrollTop = target;
        scrollFrameRef.current = null;
        setIsAtBottom(true);
        return;
      }

      // Move toward a changing streaming-text height over several frames
      // instead of jumping to the latest word on every incoming update.
      el.scrollTop += Math.max(1, distance * 0.35);
      scrollFrameRef.current = window.requestAnimationFrame(step);
    };

    scrollFrameRef.current = window.requestAnimationFrame(step);
  }, []);

  /* ================================
     AUTO SCROLL - ONLY THIS AREA SCROLLS
  ================================ */
  useEffect(() => {
    if (followLatestRef.current) smoothlyFollowLatest();
    else updateScrollPosition();
  }, [messages, smoothlyFollowLatest, updateScrollPosition]);

  const scrollToLatest = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    followLatestRef.current = true;
    setIsAtBottom(true);
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  const hasMessages = messages.length > 0;
  const activeBotMessageId = useMemo(() => {
    if (!isBotSpeaking) return null;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].sender === 'bot') return messages[index].id;
    }
    return null;
  }, [isBotSpeaking, messages]);
  const activeUserMessageId = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.sender === 'user' && message.isStreaming) return message.id;
    }
    return null;
  }, [messages]);
  const activeSpeaker = activeUserMessageId ? 'user' : activeBotMessageId ? 'bot' : null;
  const lastUserMessageId = useMemo(
    () => [...messages].reverse().find((message) => message.sender === 'user')?.id ?? null,
    [messages]
  );
  const lastBotMessageId = useMemo(
    () => [...messages].reverse().find((message) => message.sender === 'bot')?.id ?? null,
    [messages]
  );

  // Real voice and transcript events can contain natural sub-second gaps. Keep
  // the visual wave alive briefly so it feels continuous, while a new speaker
  // still takes priority immediately.
  useEffect(() => {
    window.clearTimeout(speakerReleaseTimerRef.current);

    if (activeSpeaker) {
      setVisibleSpeaker(activeSpeaker);
      return undefined;
    }

    speakerReleaseTimerRef.current = window.setTimeout(() => {
      setVisibleSpeaker(null);
    }, 700);

    return () => window.clearTimeout(speakerReleaseTimerRef.current);
  }, [activeSpeaker]);

  const visibleSpeakerMessageId = visibleSpeaker === 'user'
    ? activeUserMessageId ?? lastUserMessageId
    : visibleSpeaker === 'bot'
      ? activeBotMessageId ?? lastBotMessageId
      : null;

  return (
    // ✅ Key fix: ensure this component takes full height of parent
    <div className="h-full w-full relative flex flex-col min-h-0">
      
      {/* MESSAGE LIST - ONLY THIS AREA SCROLLS */}
      <div
        ref={containerRef}
        onScroll={updateScrollPosition}
        onPointerDown={pauseFollowing}
        onWheel={(event) => { if (event.deltaY < 0) pauseFollowing(); }}
        onTouchStart={pauseFollowing}
        onTouchMove={pauseFollowing}
        className="flex-1 min-h-0 touch-pan-y overflow-y-auto overscroll-contain px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 sm:px-4 dark:scrollbar-thumb-white/10"
      >
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
              <SonexaLogo size={28} showText={false} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Conversation will appear here
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Start speaking to begin
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isSpeaking={msg.id === visibleSpeakerMessageId}
              />
            ))}
          </AnimatePresence>
        )}

      </div>

      {/* SCROLL TO BOTTOM BUTTON */}
      {!isAtBottom && hasMessages && (
        <button
          onClick={scrollToLatest}
          className="absolute bottom-6 right-4 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 hover:scale-105 transition-all shadow-lg cursor-pointer z-20"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
});

export default ConversationScreen;
