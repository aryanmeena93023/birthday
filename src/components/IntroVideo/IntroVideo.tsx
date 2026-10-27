import React, { useState, useRef, useEffect, useCallback } from 'react';
import './IntroVideo.css';

interface IntroVideoProps {
  onComplete: () => void;
  onStartReveal?: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete, onStartReveal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isFinishedRef = useRef(false);
  const userMutedExplicitlyRef = useRef(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const cleanupGestureListenersRef = useRef<(() => void) | null>(null);

  const triggerComplete = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    // Remove any pending gesture listeners immediately so user clicks do not unmute or play video
    if (cleanupGestureListenersRef.current) {
      cleanupGestureListenersRef.current();
      cleanupGestureListenersRef.current = null;
    }

    // Immediately stop video audio and pause playback
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.muted = true;
        videoRef.current.volume = 0;
        videoRef.current.currentTime = videoRef.current.duration || 0;
      } catch {
        // Safe fallback
      }
    }

    // Begin background and foreground sequential reveal right as video starts fading out
    if (onStartReveal) {
      onStartReveal();
    }

    setIsFadingOut(true);

    // Smooth transition window into the Entry Gate (approx 750ms fadeout)
    setTimeout(() => {
      onComplete();
    }, 750);
  }, [onComplete, onStartReveal]);

  // Autoplay attempt on mount with sound initially on
  useEffect(() => {
    const video = videoRef.current;

    const cleanupGestureListeners = () => {
      window.removeEventListener('click', enableAudioOnUserGesture);
      window.removeEventListener('touchstart', enableAudioOnUserGesture);
      window.removeEventListener('keydown', enableAudioOnUserGesture);
      window.removeEventListener('pointerdown', enableAudioOnUserGesture);
    };
    cleanupGestureListenersRef.current = cleanupGestureListeners;

    const enableAudioOnUserGesture = () => {
      if (isFinishedRef.current) return;
      if (!userMutedExplicitlyRef.current && videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
        setIsMuted(false);
        setIsAutoplayBlocked(false);
      }
      cleanupGestureListeners();
    };

    if (video) {
      video.muted = false;
      video.volume = 1;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Autoplay with sound succeeded
            setIsMuted(false);
            setIsAutoplayBlocked(false);
          })
          .catch(() => {
            // Browser restricted unmuted autoplay before user interaction:
            // Start video playing muted and set state so icon and fallback prompt are accurate
            video.muted = true;
            setIsMuted(true);
            setIsAutoplayBlocked(true);
            video.play().catch(() => {});

            window.addEventListener('click', enableAudioOnUserGesture, { once: true });
            window.addEventListener('touchstart', enableAudioOnUserGesture, { once: true });
            window.addEventListener('keydown', enableAudioOnUserGesture, { once: true });
            window.addEventListener('pointerdown', enableAudioOnUserGesture, { once: true });
          });
      }
    }

    // Keyboard support: Escape key skips intro
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cleanupGestureListeners();
      if (video) {
        try {
          video.pause();
          video.muted = true;
        } catch { }
      }
    };
  }, [triggerComplete]);

  const handleVideoEnded = () => {
    triggerComplete();
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = videoRef.current || (e.currentTarget as HTMLVideoElement);
    const mediaErr = video?.error;
    console.error('[IntroVideo] Video element error encountered:', {
      error: mediaErr ? {
        code: mediaErr.code,
        message: mediaErr.message,
        MEDIA_ERR_ABORTED: mediaErr.code === 1,
        MEDIA_ERR_NETWORK: mediaErr.code === 2,
        MEDIA_ERR_DECODE: mediaErr.code === 3,
        MEDIA_ERR_SRC_NOT_SUPPORTED: mediaErr.code === 4,
      } : null,
      currentSrc: video?.currentSrc,
      networkState: video?.networkState,
      readyState: video?.readyState,
    });
    setHasError(true);
  };

  const handleToggleAudio = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      video.volume = 1;
      setIsMuted(false);
      setIsAutoplayBlocked(false);
      userMutedExplicitlyRef.current = false;
    } else {
      video.muted = true;
      setIsMuted(true);
      userMutedExplicitlyRef.current = true;
    }
  };

  const handleEnableSoundBanner = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    setIsMuted(false);
    setIsAutoplayBlocked(false);
    userMutedExplicitlyRef.current = false;
  };

  return (
    <div
      className={`intro-video-root ${isFadingOut ? 'fade-out' : ''}`}
      data-purpose="nluja-intro-video-stage"
      role="region"
      aria-label="NLUJA Assam Visual Intro"
    >
      {/* Video Viewport Stage */}
      <div className="intro-video-stage">
        {!hasError ? (
          <>
            <video
              ref={videoRef}
              src="/media/intro/entry-intro.mp4"
              autoPlay
              muted={isMuted}
              playsInline
              preload="auto"
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              className="intro-video-element"
              aria-label="NLUJA Assam Introductory Chronicle Video"
            />
            {/* Cinematic subtle vignette overlay */}
            <div aria-hidden="true" className="intro-video-vignette" />

            {/* Clear 1-click fallback prompt if browser policy blocked unprompted unmuted autoplay */}
            {isAutoplayBlocked && isMuted && (
              <button
                type="button"
                onClick={handleEnableSoundBanner}
                className="intro-unmute-prompt"
                aria-label="Enable sound"
              >
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c59b27"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                <span>ENABLE SOUND</span>
              </button>
            )}
          </>
        ) : (
          /* Graceful Fallback Card if Video Fails */
          <div className="intro-fallback-card" role="alert">
            <h2 className="intro-fallback-title">JUDICIAL ARCHIVES REQUISITION</h2>
            <p className="intro-fallback-desc">
              Visual transmission feed could not be initiated in this browser environment.
              Direct gate clearance is available.
            </p>
            <button
              type="button"
              onClick={triggerComplete}
              className="intro-skip-btn"
            >
              <span>PROCEED TO GATES</span>
              <span className="intro-skip-arrow">→</span>
            </button>
          </div>
        )}
      </div>

      {/* Top Bar: Archival Status Beacon & Audio Control */}
      <header className="intro-top-bar" aria-label="Intro metadata header">
        <div className="intro-status-beacon">
          <span className="intro-pulse-dot" aria-hidden="true" />
          <span className="intro-status-text">DEPOSIT MK-84 // INTRO CHRONICLE</span>
          <span className="intro-status-sub">• GUWAHATI CITADEL ARCHIVES</span>
        </div>

        <div className="intro-controls-group">
          {/* Mute/Unmute Toggle */}
          {!hasError && (
            <button
              type="button"
              onClick={handleToggleAudio}
              className="intro-control-btn"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            >
              {isMuted ? (
                <>
                  <svg
                    aria-hidden="true"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a9a296"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, overflow: 'visible' }}
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="22" y1="9" x2="16" y2="15" />
                    <line x1="16" y1="9" x2="22" y2="15" />
                  </svg>
                  <span>SOUND : OFF</span>
                </>
              ) : (
                <>
                  <svg
                    aria-hidden="true"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c59b27"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, overflow: 'visible' }}
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span style={{ color: '#c59b27' }}>SOUND : ON</span>
                </>
              )}
            </button>
          )}

          {/* Skip Intro Control */}
          <button
            type="button"
            onClick={triggerComplete}
            className="intro-skip-btn"
            title="Skip Intro to Academy Gates (Esc)"
            aria-label="Skip introductory video and proceed to gates"
          >
            <span>SKIP INTRO</span>
            <span className="intro-skip-arrow">→</span>
          </button>
        </div>
      </header>

      {/* Bottom Bar: Key Hint */}
      <footer className="intro-bottom-bar" aria-label="Intro footer">
        <div>NLUJA ASSAM • PROLOGUE TRANSMISSION</div>
        <div>PRESS ESC TO SKIP</div>
      </footer>
    </div>
  );
};

export default IntroVideo;
