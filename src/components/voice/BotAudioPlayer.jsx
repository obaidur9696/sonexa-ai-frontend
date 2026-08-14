/* ============================================================
   BotAudioPlayer.jsx
   Invisible audio element that plays the bot's voice stream.

   WHY A SEPARATE COMPONENT:
   Defining this inside VoiceSession/index.jsx caused it to
   be recreated on every parent render, which drops the stream.
   As its own component, it only re-renders when remoteStream
   actually changes.

   Props:
     remoteStream  MediaStream | null  — from useVoiceConnection
   ============================================================ */

import { useEffect, useRef } from 'react';

const BotAudioPlayer = ({ remoteStream }) => {
  const audioRef = useRef(null);

  /* ── Attach stream to <audio> element when it arrives ──── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (remoteStream) {
      // Attach the bot's MediaStream
      audio.srcObject = remoteStream;
      audio.play().catch((err) => {
        // Autoplay blocked by browser (needs user gesture)
        // This shouldn't happen since user interacted to start
        console.warn('[BotAudio] Autoplay blocked:', err);
      });
    } else {
      // Stream removed (session ended) — clear the element
      audio.srcObject = null;
    }
  }, [remoteStream]);

  /* ── Cleanup on unmount ──────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
  }, []);

  // Render nothing visible — audio is purely functional
  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline        // needed for iOS
      style={{ display: 'none' }}
    />
  );
};

export default BotAudioPlayer;