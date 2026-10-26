import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonalRecord.css';
import { unmarkDiscovered } from '../../utils/discoveryTracker';

export const PersonalRecord: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(204); // Default 03:24 until metadata loads
  const [progressRatio, setProgressRatio] = useState<number>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(cur);
      if (!isNaN(dur) && dur > 0) {
        setDuration(dur);
        setProgressRatio(cur / dur);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (!isNaN(dur) && dur > 0) {
        setDuration(dur);
      }
    }
  };

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
    } else {
      if (isMuted) {
        setIsMuted(false);
        video.muted = false;
      }
      video.play().catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) {
        videoRef.current.muted = next;
      }
      return next;
    });
  };

  const handleProgressSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setProgressRatio(ratio);
    if (videoRef.current && duration > 0) {
      const targetTime = ratio * duration;
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleToggleFullscreen = () => {
    const frame = document.getElementById('mk-video-frame-container');
    const video = videoRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      if (frame && frame.requestFullscreen) {
        frame.requestFullscreen().catch(() => {});
      } else if (video && video.requestFullscreen) {
        video.requestFullscreen().catch(() => {});
      }
    }
  };

  const handleReturnToArchive = () => {
    navigate('/case');
  };

  const handleRelockRecord = () => {
    try {
      localStorage.removeItem('birthdayWebsite_chestUnlocked');
      localStorage.removeItem('birthdayWebsite_keyAcquired');
    } catch (err) {}
    unmarkDiscovered('forbidden');
    navigate('/forbidden');
  };

  const handleSkipRecord = () => {
    navigate('/key-acquisition');
  };

  return (
    <div className="mk-container">
      {/* Background Ambience Layers */}
      <div className="mk-bg-ambience" aria-hidden="true">
        <div className="mk-bg-plate" />
        <div className="mk-smoke-billow-left" />
        <div className="mk-smoke-billow-right" />
        <div className="mk-smoke-haze-ambient" />
        <div className="mk-dust-texture" />
        <div className="mk-vignette" />
      </div>

      {/* TOP BAR */}
      <header className="mk-topbar">
        <button
          type="button"
          className="mk-return-btn"
          onClick={handleReturnToArchive}
          aria-label="Return to Archive"
        >
          <span className="mk-return-arrow" aria-hidden="true">←</span>
          <span>RETURN TO ARCHIVE</span>
        </button>

        <button
          type="button"
          className="mk-mute-btn"
          onClick={handleToggleMute}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          <span className="mk-mute-icon" aria-hidden="true">
            {isMuted ? (
              // Crossed-out speaker icon
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              // Speaker sound on
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </span>
          <span>{isMuted ? 'MUTED' : 'SOUND'}</span>
        </button>
      </header>

      {/* HEADER */}
      <section className="mk-header">
        <span className="mk-case-label">CASE FILE // NO. 05</span>
        <h1 className="mk-title">A CLASSIFIED BIRTHDAY SURPRISE</h1>
        <p className="mk-subtitle">
          Please enjoy responsibly. Side effects may include smiling.
        </p>
      </section>

      {/* MAIN: Player Card Frame and Brass Nameplate */}
      <main className="mk-main-placeholder" id="mk-player-slot">
        <div className="mk-outer-card">
          {/* INNER ORNATE FRAME */}
          <div className="mk-inner-frame">
            {/* Top Center Brass Nameplate */}
            <div className="mk-nameplate-wrapper">
              <div className="mk-nameplate">
                <div className="mk-plaque-rivets-left">
                  <span className="mk-rivet" aria-hidden="true" />
                  <span className="mk-rivet" aria-hidden="true" />
                  <span className="mk-rivet" aria-hidden="true" />
                </div>
                <span className="mk-nameplate-text">PERSONAL RECORD I</span>
                <div className="mk-plaque-rivets-right">
                  <span className="mk-rivet" aria-hidden="true" />
                  <span className="mk-rivet" aria-hidden="true" />
                  <span className="mk-rivet" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Corner Flourish Motifs (Antique floral rosettes & scrolls matching IMAGE 3) */}
            <svg
              className="mk-flourish mk-flourish-tl"
              viewBox="0 0 44 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
              <circle cx="16" cy="10.5" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="16" cy="21.5" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="10.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="21.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="12.2" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="19.8" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="12.2" cy="19.8" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="19.8" cy="19.8" r="1.2" fill="currentColor" stroke="none" />
              <path d="M 16 6 C 16 3, 22 4, 30 4 C 36 4, 40 5, 43 5" />
              <path d="M 21.5 10.5 C 27 9, 34 9, 41 9.5" strokeWidth="0.8" />
              <circle cx="43" cy="5" r="1.3" fill="currentColor" stroke="none" />
              <path d="M 6 16 C 3 16, 4 22, 4 30 C 4 36, 5 40, 5 43" />
              <path d="M 10.5 21.5 C 9 27, 9 34, 9.5 41" strokeWidth="0.8" />
              <circle cx="5" cy="43" r="1.3" fill="currentColor" stroke="none" />
              <path d="M 22 22 C 26 26, 25 31, 22 33 C 19 35, 16 33, 17 30 C 18 27, 21 28, 21 30" strokeWidth="0.9" />
            </svg>

            <svg
              className="mk-flourish mk-flourish-tr"
              viewBox="0 0 44 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
              <circle cx="16" cy="10.5" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="16" cy="21.5" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="10.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="21.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="12.2" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="19.8" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="12.2" cy="19.8" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="19.8" cy="19.8" r="1.2" fill="currentColor" stroke="none" />
              <path d="M 16 6 C 16 3, 22 4, 30 4 C 36 4, 40 5, 43 5" />
              <path d="M 21.5 10.5 C 27 9, 34 9, 41 9.5" strokeWidth="0.8" />
              <circle cx="43" cy="5" r="1.3" fill="currentColor" stroke="none" />
              <path d="M 6 16 C 3 16, 4 22, 4 30 C 4 36, 5 40, 5 43" />
              <path d="M 10.5 21.5 C 9 27, 9 34, 9.5 41" strokeWidth="0.8" />
              <circle cx="5" cy="43" r="1.3" fill="currentColor" stroke="none" />
              <path d="M 22 22 C 26 26, 25 31, 22 33 C 19 35, 16 33, 17 30 C 18 27, 21 28, 21 30" strokeWidth="0.9" />
            </svg>

            <svg
              className="mk-flourish mk-flourish-bl"
              viewBox="0 0 44 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
              <circle cx="16" cy="10.5" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="16" cy="21.5" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="10.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="21.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="12.2" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="19.8" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="12.2" cy="19.8" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="19.8" cy="19.8" r="1.2" fill="currentColor" stroke="none" />
              <path d="M 16 6 C 16 3, 22 4, 30 4 C 36 4, 40 5, 43 5" />
              <path d="M 21.5 10.5 C 27 9, 34 9, 41 9.5" strokeWidth="0.8" />
              <circle cx="43" cy="5" r="1.3" fill="currentColor" stroke="none" />
              <path d="M 6 16 C 3 16, 4 22, 4 30 C 4 36, 5 40, 5 43" />
              <path d="M 10.5 21.5 C 9 27, 9 34, 9.5 41" strokeWidth="0.8" />
              <circle cx="5" cy="43" r="1.3" fill="currentColor" stroke="none" />
              <path d="M 22 22 C 26 26, 25 31, 22 33 C 19 35, 16 33, 17 30 C 18 27, 21 28, 21 30" strokeWidth="0.9" />
            </svg>

            <svg
              className="mk-flourish mk-flourish-br"
              viewBox="0 0 44 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
              <circle cx="16" cy="10.5" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="16" cy="21.5" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="10.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="21.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="12.2" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="19.8" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="12.2" cy="19.8" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="19.8" cy="19.8" r="1.2" fill="currentColor" stroke="none" />
              <path d="M 16 6 C 16 3, 22 4, 30 4 C 36 4, 40 5, 43 5" />
              <path d="M 21.5 10.5 C 27 9, 34 9, 41 9.5" strokeWidth="0.8" />
              <circle cx="43" cy="5" r="1.3" fill="currentColor" stroke="none" />
              <path d="M 6 16 C 3 16, 4 22, 4 30 C 4 36, 5 40, 5 43" />
              <path d="M 10.5 21.5 C 9 27, 9 34, 9.5 41" strokeWidth="0.8" />
              <circle cx="5" cy="43" r="1.3" fill="currentColor" stroke="none" />
              <path d="M 22 22 C 26 26, 25 31, 22 33 C 19 35, 16 33, 17 30 C 18 27, 21 28, 21 30" strokeWidth="0.9" />
            </svg>

            {/* Container below nameplate for Phase 3 Video Area */}
            <div className="mk-video-area-slot" id="mk-video-slot">
              {/* VIDEO FRAME: Thin gold frame, pure black */}
              <div
                id="mk-video-frame-container"
                className="mk-video-frame"
                onClick={handleTogglePlay}
              >
                {/* 4 Corner Ornaments */}
                <div className="mk-video-corner mk-vid-tl" aria-hidden="true" />
                <div className="mk-video-corner mk-vid-tr" aria-hidden="true" />
                <div className="mk-video-corner mk-vid-bl" aria-hidden="true" />
                <div className="mk-video-corner mk-vid-br" aria-hidden="true" />

                {/* Pure black interior video element */}
                <video
                  ref={videoRef}
                  src="/videos/locked-chest.mp4"
                  className="mk-video-element"
                  playsInline
                  preload="metadata"
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* CENTER BUTTON: Visible only when paused, displays right-pointing play triangle */}
                {!isPlaying && (
                  <button
                    type="button"
                    className="mk-center-pause-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay();
                    }}
                    aria-label="Play Video"
                  >
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* CONTROL BAR: Thin bordered strip below video frame */}
              <div className="mk-control-bar">
                {/* 1. Small round gold play/pause button */}
                <button
                  type="button"
                  className="mk-ctrl-pause-btn"
                  onClick={handleTogglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <rect x="6.5" y="5" width="3.2" height="14" rx="1.2" />
                      <rect x="14.3" y="5" width="3.2" height="14" rx="1.2" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* 2. Thin gold progress line & draggable/clickable knob */}
                <div
                  className="mk-progress-container"
                  onClick={handleProgressSeek}
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={duration}
                  aria-valuenow={currentTime}
                  tabIndex={0}
                >
                  <div className="mk-progress-track">
                    <div
                      className="mk-progress-fill"
                      style={{ width: `${progressRatio * 100}%` }}
                    />
                    <div
                      className="mk-progress-knob"
                      style={{ left: `${progressRatio * 100}%` }}
                    />
                  </div>
                </div>

                {/* 3. Timer: "00:00 / 03:24" */}
                <span className="mk-timer">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* 4. Volume icon */}
                <button
                  type="button"
                  className="mk-icon-btn"
                  onClick={handleToggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>

                {/* 5. Fullscreen icon */}
                <button
                  type="button"
                  className="mk-icon-btn"
                  onClick={handleToggleFullscreen}
                  aria-label="Toggle Fullscreen"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                </button>
              </div>

              {/* Main Button & Secondary Buttons */}
              <div className="mk-actions-slot" id="mk-actions-slot">
                {/* PLAY PLAQUE BUTTON */}
                <button
                  type="button"
                  className="mk-plaque-btn"
                  onClick={handleTogglePlay}
                  aria-label="Play the Record"
                >
                  <span className="mk-plaque-text">PLAY THE RECORD</span>
                </button>

                {/* SMALL ACTION BUTTONS */}
                <div className="mk-secondary-row">
                  <button
                    type="button"
                    className="mk-secondary-btn mk-btn-relock"
                    onClick={handleRelockRecord}
                  >
                    RE-LOCK RECORD
                  </button>

                  <button
                    type="button"
                    className="mk-secondary-btn mk-btn-skip"
                    onClick={handleSkipRecord}
                    aria-label="Next Page"
                  >
                    NEXT PAGE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mk-footer">
        <p className="mk-footer-text">
          NLUJA ASSAM • RESTRICTED ARCHIVE
        </p>
      </footer>
    </div>
  );
};

export default PersonalRecord;
