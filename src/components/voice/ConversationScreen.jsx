import { useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SonexaLogo from "../ui/Logo/SonexaLogo";

/* ================================
   USER ICON
================================ */
const UserIcon = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shrink-0">
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </div>
);

/* ================================
   BOT ICON
================================ */
const BotIcon = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
    <SonexaLogo size={18} showText={false} />
  </div>
);

/* ================================
   MESSAGE BUBBLE
================================ */
const MessageBubble = memo(({ message }) => {
  const isUser = message.sender === "user";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 gap-2`}
    >
      {!isUser && <BotIcon />}

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
        {/* TEXT */}
        <p className="whitespace-pre-wrap break-words">
          {message.text || ""}
        </p>

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

      {isUser && <UserIcon />}
    </motion.div>
  );
});

/* ================================
   MAIN CONVERSATION SCREEN
================================ */
const ConversationScreen = memo(({ messages }) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  /* ================================
     SCROLL HANDLER
  ================================ */
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 100;

    setIsAtBottom(nearBottom);
  };

  /* ================================
     AUTO SCROLL - ONLY THIS AREA SCROLLS
  ================================ */
  useEffect(() => {
    if (!bottomRef.current) return;

    if (isAtBottom) {
      const hasStreaming = messages.some((m) => m.isStreaming);

      bottomRef.current.scrollIntoView({
        behavior: hasStreaming ? "auto" : "smooth",
      });
    }
  }, [messages, isAtBottom]);

  const hasMessages = messages.length > 0;

  return (
    // ✅ Key fix: ensure this component takes full height of parent
    <div className="h-full w-full relative flex flex-col min-h-0">
      
      {/* MESSAGE LIST - ONLY THIS AREA SCROLLS */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10"
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
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        )}

        {/* SCROLL ANCHOR */}
        <div ref={bottomRef} />
      </div>

      {/* SCROLL TO BOTTOM BUTTON */}
      {!isAtBottom && hasMessages && (
        <button
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
          }
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
