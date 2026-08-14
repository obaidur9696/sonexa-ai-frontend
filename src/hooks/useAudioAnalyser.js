/* ============================================================
   useAudioAnalyser.js
   
   RESPONSIBILITY:
   - Detects if a MediaStream has active audio (speaking)
   - Returns boolean `isSpeaking`
   - Uses FFT analysis to measure audio volume
   - Includes debounce to prevent rapid toggling
   - Automatically resumes AudioContext (browser policy fix)
   
   USAGE:
     const isUserSpeaking = useAudioAnalyser(localStream, 22);
     const isBotSpeaking = useAudioAnalyser(remoteStream, 18);
   
   RETURNS:
     boolean - true when audio level > threshold
   ============================================================ */

import { useEffect, useState, useRef } from "react";

export const useAudioAnalyser = (stream, threshold = 20) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs for cleanup
  const rafRef = useRef(null);
  const audioContextRef = useRef(null);
  const silenceTimerRef = useRef(null);
  
  // Refs for current state (to avoid stale closures)
  const isSpeakingRef = useRef(false);
  const lastAvgRef = useRef(0);
  const streamRef = useRef(stream);

  // Update stream ref when it changes
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    // If no stream, speaking is false
    if (!stream) {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      return;
    }

    let isMounted = true;
    let analyser = null;
    let source = null;

    const initAnalyser = async () => {
      try {
        // Create AudioContext
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(stream);
        
        // Configure analyser
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        // Connect nodes
        source.connect(analyser);
        
        // ✅ CRITICAL FIX: Resume AudioContext (browsers suspend by default)
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        audioContextRef.current = audioContext;
        
        // Detection loop
        const detect = () => {
          if (!isMounted) return;
          
          // Check if stream still exists and is active
          const currentStream = streamRef.current;
          if (!currentStream || currentStream.getTracks().length === 0) {
            if (isSpeakingRef.current) {
              setIsSpeaking(false);
              isSpeakingRef.current = false;
            }
            rafRef.current = requestAnimationFrame(detect);
            return;
          }
          
          // Get frequency data
          analyser.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          lastAvgRef.current = avg;
          
          const newIsSpeaking = avg > threshold;
          
          // Handle state changes with debounce
          if (newIsSpeaking && !isSpeakingRef.current) {
            // Speaking started - update immediately
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
            isSpeakingRef.current = true;
            setIsSpeaking(true);
          } 
          else if (!newIsSpeaking && isSpeakingRef.current) {
            // Speaking possibly ended - wait to confirm (debounce)
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            silenceTimerRef.current = setTimeout(() => {
              // Double-check with latest audio level
              if (isMounted && lastAvgRef.current <= threshold) {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
              }
              silenceTimerRef.current = null;
            }, 250); // 250ms debounce
          }
          
          // Continue loop
          rafRef.current = requestAnimationFrame(detect);
        };
        
        // Start detection
        detect();
        
      } catch (error) {
        console.error('[useAudioAnalyser] Failed to initialize:', error);
        if (isMounted) {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
        }
      }
    };
    
    initAnalyser();
    
    // Cleanup function
    return () => {
      isMounted = false;
      
      // Cancel animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      // Clear timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Close AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      
      // Disconnect source
      if (source) {
        try {
          source.disconnect();
        } catch {}
      }
      
      // Reset state
      isSpeakingRef.current = false;
      lastAvgRef.current = 0;
    };
  }, [stream, threshold]); // Re-run when stream or threshold changes
  
  return isSpeaking;
};

export default useAudioAnalyser;