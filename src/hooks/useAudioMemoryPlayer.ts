import { useState, useEffect, useRef, useCallback } from 'react';

export type PlayerState = 'idle' | 'playing' | 'paused' | 'completed';

export interface UseAudioMemoryPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  playerState: PlayerState;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isAudioError: boolean;
  togglePlayPause: () => void;
  seek: (targetTime: number) => void;
  replay: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
}

export function useAudioMemoryPlayer(
  _audioSrc: string,
  captionVideoSrc?: string
): UseAudioMemoryPlayerReturn {

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAudioError, setIsAudioError] = useState<boolean>(false);

  const lastSyncTimeRef = useRef<number>(0);

  // Sync video to audio position if drift exceeds 0.25s
  const syncVideoToAudio = useCallback((audioTime: number) => {
    const video = videoRef.current;
    if (!video || !captionVideoSrc) return;

    const now = performance.now();
    if (now - lastSyncTimeRef.current < 200) return; // Throttle to 200ms
    lastSyncTimeRef.current = now;

    if (Math.abs(video.currentTime - audioTime) > 0.25) {
      try {
        video.currentTime = audioTime;
      } catch {
        // Ignore seek errors on unready video
      }
    }
  }, [captionVideoSrc]);

  // Handle HTML media events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsAudioError(false);
    };

    const handleTimeUpdate = () => {
      const time = audio.currentTime || 0;
      setCurrentTime(time);
      syncVideoToAudio(time);
    };

    const handlePlay = () => {
      setPlayerState('playing');
      const video = videoRef.current;
      if (video && captionVideoSrc) {
        video.play().catch(() => {
          // Silent video play error
        });
      }
    };

    const handlePause = () => {
      const video = videoRef.current;
      if (video) {
        video.pause();
      }

      if (audio.ended) {
        setPlayerState('completed');
      } else if (audio.currentTime > 0) {
        setPlayerState('paused');
      } else {
        setPlayerState('idle');
      }
    };

    const handleEnded = () => {
      setPlayerState('completed');
      setCurrentTime(audio.duration || 0);
      const video = videoRef.current;
      if (video) {
        video.pause();
      }
    };

    const handleError = () => {
      setIsAudioError(true);
      setPlayerState('idle');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Initial check if metadata already loaded
    if (audio.readyState >= 1) {
      setDuration(audio.duration || 0);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [captionVideoSrc, syncVideoToAudio]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isAudioError) return;

    if (audio.paused || audio.ended) {
      if (audio.ended) {
        audio.currentTime = 0;
      }
      audio.play().catch((err) => {
        console.warn('Audio playback error / blocked by browser:', err);
        setIsAudioError(true);
      });
    } else {
      audio.pause();
    }
  }, [isAudioError]);

  const seek = useCallback((targetTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedTime = Math.max(0, Math.min(targetTime, audio.duration || 0));
    audio.currentTime = clampedTime;
    setCurrentTime(clampedTime);

    const video = videoRef.current;
    if (video) {
      try {
        video.currentTime = clampedTime;
      } catch {
        // Ignore seek error
      }
    }
  }, []);

  const replay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);

    const video = videoRef.current;
    if (video) {
      try {
        video.currentTime = 0;
      } catch {
        // Ignore
      }
    }

    audio.play().catch((err) => {
      console.warn('Replay audio play error:', err);
    });
  }, []);

  const setVolume = useCallback((val: number) => {
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audio) {
      audio.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      if (audio) audio.muted = false;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audio.muted = nextMute;
  }, [isMuted]);

  return {
    audioRef,
    videoRef,
    playerState,
    currentTime,
    duration,
    volume,
    isMuted,
    isAudioError,
    togglePlayPause,
    seek,
    replay,
    setVolume,
    toggleMute,
  };
}
