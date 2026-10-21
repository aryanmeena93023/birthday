import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonalRecord.css';
import { playArtifactChime } from '../../utils/archiveAudio';

export const PersonalRecord: React.FC = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Initialize and manage audio playback
  useEffect(() => {
    window.scrollTo(0, 0);

    const audio = new Audio('/media/audio/memory-01.mp3');
    audio.preload = 'metadata';
    audio.muted = isMuted;
    audioRef.current = audio;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  // Sync mute state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle Play/Pause Record
  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // If audio is muted by default, unmute it when the user explicitly clicks Play
      if (isMuted) {
        setIsMuted(false);
        audio.muted = false;
      }
      audio.play().catch(() => {
        // Handle browser autoplay restrictions gracefully
        setIsPlaying(false);
      });
    }
  };

  // Toggle Mute button in the top bar
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = nextMuted;
      }
      return nextMuted;
    });
  };

  // Return to archive navigation
  const handleReturnToArchive = () => {
    playArtifactChime(440);
    navigate('/case');
  };

  // Re-lock record and return to Locked Chest
  const handleRelockRecord = () => {
    playArtifactChime(329.63);
    navigate('/forbidden');
  };

  return (
    <div className="personal-record-container">
      <div className="personal-record-vignette" aria-hidden="true" />

      {/* Top Navigation */}
      <header className="personal-record-header">
        <nav className="personal-record-nav" aria-label="Restricted Record Navigation">
          <button
            type="button"
            className="personal-record-return-link"
            onClick={handleReturnToArchive}
            aria-label="Return to Archive"
          >
            <span className="personal-record-return-arrow" aria-hidden="true">←</span>
            <span>RETURN TO ARCHIVE</span>
          </button>

          <span className="personal-record-case-tag">CASE FILE // NO. 04</span>

          <button
            type="button"
            className="personal-record-mute-btn"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            <span className="personal-record-mute-icon" aria-hidden="true">
              {isMuted ? (
                // Speaker with slash (MUTED)
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                // Speaker without slash (SOUND ON)
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </span>
            <span>{isMuted ? 'MUTED' : 'SOUND'}</span>
          </button>
        </nav>
        <div className="personal-record-nav-divider" />
      </header>

      {/* Introductory Quotation */}
      <p className="personal-record-intro-quote">
        &ldquo;A sealed record, waiting behind four numbers.&rdquo;
      </p>

      {/* Main Archival Double-Frame Panel */}
      <main className="personal-record-main-area">
        <section className="personal-record-outer-frame" aria-labelledby="pr-heading">
          {/* Outer Frame Corner Brackets */}
          <div className="pr-corner-bracket pr-corner-tl" aria-hidden="true" />
          <div className="pr-corner-bracket pr-corner-tr" aria-hidden="true" />
          <div className="pr-corner-bracket pr-corner-bl" aria-hidden="true" />
          <div className="pr-corner-bracket pr-corner-br" aria-hidden="true" />

          {/* Inner Inset Frame */}
          <div className="personal-record-inner-frame">
            {/* Inner Frame Corner Notches */}
            <div className="pr-inner-notch pr-notch-tl" aria-hidden="true" />
            <div className="pr-inner-notch pr-notch-tr" aria-hidden="true" />
            <div className="pr-inner-notch pr-notch-bl" aria-hidden="true" />
            <div className="pr-inner-notch pr-notch-br" aria-hidden="true" />

            {/* Main Headings */}
            <span className="personal-record-label">PERSONAL RECORD I</span>
            <h1 id="pr-heading" className="personal-record-title">A MOMENT KEPT FOR YOU</h1>
            <p className="personal-record-subtitle">
              &ldquo;Some memories deserve to be kept a little longer.&rdquo;
            </p>

            {/* Antique-Brass Record */}
            <div className="personal-record-disc-wrapper">
              <img
                src="/media/audio/antique-brass-record.png"
                alt="Antique Brass Record GAU-1984-A"
                className={`personal-record-disc ${isPlaying ? 'spinning' : ''}`}
                draggable={false}
              />
            </div>

            {/* Record Identifier */}
            <span className="personal-record-identifier">GAU-1984-A</span>

            {/* Playback Button */}
            <button
              type="button"
              className="personal-record-play-btn"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pause Record I' : 'Play Record I'}
            >
              <span className="personal-record-play-icon-circle" aria-hidden="true">
                {isPlaying ? (
                  // Pause bars
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  // Play triangle
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="currentColor">
                    <polygon points="7,4 20,12 7,20" />
                  </svg>
                )}
              </span>
              <span>{isPlaying ? 'PAUSE RECORD I' : 'PLAY RECORD I'}</span>
            </button>

            {/* Bottom Metadata Divider with Understated Detail */}
            <div className="personal-record-meta-divider-wrapper" aria-hidden="true">
              <div className="personal-record-meta-divider-line" />
              <span className="personal-record-meta-divider-glyph">◆</span>
            </div>

            {/* Bottom Metadata Elements */}
            <div className="personal-record-meta-row">
              <span className="personal-record-meta-left">
                RECORD I // PERSONAL ARCHIVE
              </span>

              <button
                type="button"
                className="personal-record-relock-btn"
                onClick={handleRelockRecord}
                aria-label="Re-lock Record and return to chest"
              >
                <svg
                  className="personal-record-relock-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                <span>Re-lock Record</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Page Footer */}
      <footer className="personal-record-footer">
        <p className="personal-record-footer-text">
          NLUJA ASSAM • RESTRICTED ARCHIVE
        </p>
      </footer>
    </div>
  );
};

export default PersonalRecord;
