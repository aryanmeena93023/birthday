import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Audio.css';
import { audioMemoryData } from '../../content/audioMemory';
import { AudioMemory } from '../../components/AudioMemory/AudioMemory';
import { playArtifactChime } from '../../utils/archiveAudio';
import { markDiscovered } from '../../utils/discoveryTracker';

const AudioPage: React.FC = () => {
  useEffect(() => {
    markDiscovered('audio');
  }, []);

  const handleReturnClick = () => {
    playArtifactChime(392);
  };

  return (
    <div className="audio-page-root">
      {/* 1. Fixed Top Archival Navigation Bar */}
      <header className="audio-top-bar">
        <div className="top-bar-inner">
          <div className="top-bar-left">
            <Link
              to="/case"
              onClick={handleReturnClick}
              className="top-bar-back-link"
              aria-label="Return to Case Archive"
              title="Return to Case Archive"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </Link>
            <span className="top-bar-divider" />
            <div className="top-bar-titles">
              <span className="top-badge">{audioMemoryData.headerBadge}</span>
              <span className="top-subbadge">{audioMemoryData.headerSubBadge}</span>
            </div>
          </div>
          <div className="top-bar-right">
            <span className="chamber-label">CHAMBER</span>
          </div>
        </div>
      </header>

      {/* 2. Main Archival Body Container */}
      <main className="audio-page-main">
        <div className="audio-page-content">
          {/* Top Archival Hero Header */}
          <header className="audio-hero-header">
            <div className="audio-hero-meta">
              <span className="page-label">{audioMemoryData.pageLabel}</span>
              <span className="meta-dot" />
              <span className="record-no">PRIVATE ARCHIVE • RECORD NO. 04</span>
            </div>
            <h1 className="audio-hero-title">{audioMemoryData.heading}</h1>
            <p className="audio-hero-tagline">{audioMemoryData.tagline}</p>

            <div className="hero-divider">
              <span className="divider-line" />
              <span className="divider-dot" />
              <span className="divider-line" />
            </div>
          </header>

          {/* Single Recording Badge */}
          <div className="single-recording-badge-row">
            <div className="single-recording-badge">
              <span className="badge-live-pulse" />
              <span className="recording-label-text">{audioMemoryData.recordingLabel}</span>
            </div>
          </div>

          {/* Core Audio Memory Experience Component */}
          <AudioMemory />

          {/* Bottom Navigation Dock */}
          <nav className="audio-return-dock" aria-label="Bottom Navigation">
            <Link
              to="/case"
              onClick={handleReturnClick}
              className="return-archive-btn"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              <span>RETURN TO ARCHIVE</span>
            </Link>

            <Link
              to="/drawer"
              onClick={handleReturnClick}
              className="next-file-btn"
            >
              <span>MOVE TO NEXT FILE // 05</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </Link>
          </nav>
        </div>
      </main>

      {/* 3. Archival Footer */}
      <footer className="audio-page-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-title">NATIONAL LAW UNIVERSITY AND JUDICIAL ACADEMY, ASSAM</span>
            <span className="footer-subtitle">CLASSIFIED AUDIO RECORD // CEREMONIAL DEPOSIT</span>
          </div>
          <div className="footer-right">
            <span>© MMXXIV NLUJA ARCHIVES. ALL TESTAMENTS RESERVED.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AudioPage;
