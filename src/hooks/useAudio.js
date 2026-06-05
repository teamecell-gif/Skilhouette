import { useRef, useCallback } from "react";

export function useAudio() {
  const audioCtxRef = useRef(null);

  // Initialize or resume the Audio Context
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  /**
   * Synthesizes a futuristic, positive rank-up sound
   */
  const playRankUp = useCallback((enabled = true) => {
    if (!enabled) return;
    try {
      const ctx = initAudio();
      const now = ctx.currentTime;

      // Note 1 (Lower)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.1); // G5

      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.16);

      // Note 2 (Higher, offset slightly)
      setTimeout(() => {
        try {
          const now2 = ctx.currentTime;
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(783.99, now2); // G5
          osc2.frequency.exponentialRampToValueAtTime(1046.50, now2 + 0.12); // C6

          gain2.gain.setValueAtTime(0.15, now2);
          gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.18);

          osc2.connect(gain2);
          gain2.connect(ctx.destination);

          osc2.start(now2);
          osc2.stop(now2 + 0.2);
        } catch (e) {
          // Audio failsafe
        }
      }, 70);

    } catch (error) {
      console.warn("Web Audio API not supported or blocked:", error);
    }
  }, []);

  /**
   * Synthesizes a celebratory fanfare for new Top 3 entry
   */
  const playTop3Entry = useCallback((enabled = true) => {
    if (!enabled) return;
    try {
      const ctx = initAudio();
      const now = ctx.currentTime;

      const playTone = (freq, startTime, duration, type = "triangle", vol = 0.12) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Add a slight vibrato for richness
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.frequency.value = 6; // 6Hz frequency modulation
        vibratoGain.gain.value = 4; // 4Hz depth
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        gainNode.gain.setValueAtTime(vol, startTime);
        gainNode.gain.linearRampToValueAtTime(vol, startTime + duration * 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        vibrato.start(startTime);
        osc.start(startTime);

        vibrato.stop(startTime + duration);
        osc.stop(startTime + duration);
      };

      // Play C major triad arpeggio rising with a solid synth base
      const delay = 0.08;
      playTone(261.63, now, 0.4, "triangle", 0.12);              // C4
      playTone(329.63, now + delay, 0.4, "triangle", 0.12);      // E4
      playTone(392.00, now + delay * 2, 0.4, "triangle", 0.12);  // G4
      playTone(523.25, now + delay * 3, 0.8, "sine", 0.15);      // C5 (Lead sine note)
      playTone(659.25, now + delay * 4, 0.8, "sine", 0.10);      // E5 (Harmony)

    } catch (error) {
      console.warn("Web Audio API not supported or blocked:", error);
    }
  }, []);

  /**
   * A gentle menu click sound
   */
  const playClick = useCallback((enabled = true) => {
    if (!enabled) return;
    try {
      const ctx = initAudio();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (error) {
      // Failsafe
    }
  }, []);

  return { playRankUp, playTop3Entry, playClick, initAudio };
}
