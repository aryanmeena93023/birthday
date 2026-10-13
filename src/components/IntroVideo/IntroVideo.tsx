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

  const triggerComplete = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    // Immediately pause video playback so it never plays beneath the Entry Gate
    if (videoRef.current) {
      try {
        videoRef.current.pause();
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
    };

    const enableAudioOnUserGesture = () => {
      if (!userMutedExplicitlyRef.current && videoRef.current) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
      cleanupGestureListeners();
    };

    if (video) {
      video.muted = false;
      video.play().catch(() => {
        // If the browser restricts unmuted autoplay before user interaction,
        // start playback muted temporarily and unmute automatically upon the first user interaction
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {
          // If playback is still prevented, allow user to continue
        });

        window.addEventListener('click', enableAudioOnUserGesture, { once: true });
        window.addEventListener('touchstart', enableAudioOnUserGesture, { once: true });
        window.addEventListener('keydown', enableAudioOnUserGesture, { once: true });
      });
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
    };
  }, [triggerComplete]);

  const handleVideoEnded = () => {
    triggerComplete();
  };

  const handleVideoError = () => {
    setHasError(true);
  };

  const handleToggleAudio = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      userMutedExplicitlyRef.current = false;
    } else {
      video.muted = true;
      setIsMuted(true);
      userMutedExplicitlyRef.current = true;
    }
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
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                  <span>SOUND : OFF</span>
                </>
              ) : (
                <>
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c59b27"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 5" />
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
