import { useEffect, useRef, useState } from 'react';

export interface AudioAnalyserData {
  amplitude: number; // 0 to 1 smooth value
  frequencyBars: number[]; // 15 frequency bar values (0 to 1)
  isAvailable: boolean;
}

export function useAudioAnalyser(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  isPlaying: boolean
): AudioAnalyserData {
  const [analyserData, setAnalyserData] = useState<AudioAnalyserData>({
    amplitude: 0,
    frequencyBars: Array(15).fill(0.2),
    isAvailable: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedAmpRef = useRef<number>(0);
  const smoothedBarsRef = useRef<number[]>(Array(15).fill(0.2));

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    // Initialize AudioContext & Source ONCE per audio element on user gesture
    const initAudioContext = () => {
      if (sourceNodeRef.current) return; // Already initialized

      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        const source = ctx.createMediaElementSource(audioEl);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        sourceNodeRef.current = source;

        setAnalyserData((prev) => ({ ...prev, isAvailable: true }));
      } catch (err) {
        console.warn('Web Audio Analyser not available or CORS restricted:', err);
        setAnalyserData((prev) => ({ ...prev, isAvailable: false }));
      }
    };

    if (isPlaying) {
      if (!audioContextRef.current) {
        initAudioContext();
      } else if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  }, [audioRef, isPlaying]);

  useEffect(() => {
    const analyser = analyserRef.current;
    let isActive = isPlaying;

    if (!isPlaying) {
      // Ease to rest over ~1s when paused
      let startRestTime: number | null = null;
      const initialAmp = smoothedAmpRef.current;

      const easeToRest = (timestamp: number) => {
        if (!startRestTime) startRestTime = timestamp;
        const elapsed = (timestamp - startRestTime) / 1000;
        const factor = Math.max(0, 1 - elapsed);

        smoothedAmpRef.current = initialAmp * factor;
        const restedBars = smoothedBarsRef.current.map((b) => Math.max(0.15, b * factor));
        smoothedBarsRef.current = restedBars;

        setAnalyserData((prev) => ({
          ...prev,
          amplitude: smoothedAmpRef.current,
          frequencyBars: restedBars,
        }));

        if (elapsed < 1.0 && !isActive) {
          animationFrameRef.current = requestAnimationFrame(easeToRest);
        } else if (!isActive) {
          setAnalyserData((prev) => ({
            ...prev,
            amplitude: 0,
            frequencyBars: Array(15).fill(0.2),
          }));
        }
      };

      animationFrameRef.current = requestAnimationFrame(easeToRest);
      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }

    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateFrame = () => {
      if (!analyser) return;

      analyser.getByteFrequencyData(dataArray);

      // Compute total energy / amplitude (0 to 1)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const rawAmp = sum / (dataArray.length * 255);
      // Exponential smoothing (alpha = 0.25)
      smoothedAmpRef.current = smoothedAmpRef.current * 0.75 + rawAmp * 0.25;

      // Extract 15 frequency bars spread across the active lower spectrum
      const barCount = 15;
      const newBars: number[] = [];

      for (let i = 0; i < barCount; i++) {
        // Use bins 1 through 15, which contain the dense bass and mid-range frequencies.
        // This avoids the empty high-frequency bins that cause the right side to stay flat.
        const binIndex = i + 1;
        const val = (dataArray[binIndex] || 0) / 255;
        
        // Add slight pseudo-random variation so adjacent bars don't look identical
        const variedVal = val * (0.85 + (i % 4) * 0.1);

        const smoothedVal = (smoothedBarsRef.current[i] || 0.2) * 0.7 + variedVal * 0.3;
        newBars.push(Math.max(0.15, Math.min(1.0, smoothedVal)));
      }

      smoothedBarsRef.current = newBars;

      setAnalyserData({
        amplitude: smoothedAmpRef.current,
        frequencyBars: newBars,
        isAvailable: true,
      });

      animationFrameRef.current = requestAnimationFrame(updateFrame);
    };

    animationFrameRef.current = requestAnimationFrame(updateFrame);

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return analyserData;
}
