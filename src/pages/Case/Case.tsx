import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Case.css';
import ArchiveObjects from '../../components/ArchiveObjects/ArchiveObjects';
import { toggleAmbienceDrone, playArtifactChime } from '../../utils/archiveAudio';
import { getDiscoveredCount, getDiscoveredSet } from '../../utils/discoveryTracker';

const Case: React.FC = () => {
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState(false);
  const discoveredCount = getDiscoveredCount();
  const discoveredSet = getDiscoveredSet();

  const handleToggleAmbience = () => {
    const active = toggleAmbienceDrone((playing) => {
      setIsAmbiencePlaying(playing);
    });
    setIsAmbiencePlaying(active);
  };

  const handleNavClick = (pitch = 440) => {
    playArtifactChime(pitch);
  };

  return (
    <div className="case-page" id="archive-stage">
      {/* 1. Chamber Photorealistic Scene Background: Single visual source, crisp & sharp, NO BLUR */}
      <img
        src="/media/archive/archive-master.webp"
        alt="The Archive Chamber"
        className="archive-bg-img"
        draggable={false}
      />

      {/* 2. Candle light glow synchronized with the desk candle */}
      <div className="candle-light-flicker" />

      {/* 3. Gentle ambient vignette (lightened so room details remain visible and crisp) */}
      <div className="ambient-vignette" />

      {/* 4. Header Overlay (Clean, Sharp, High Contrast Antique Design) */}
      <header className="archive-header-overlay">
        <div className="archive-header-card">
          <div className="archive-dept-badge">
            <span className="dept-beacon-dot" />
            <span className="dept-text">DEPARTMENT OF UNUSUAL OCCURRENCES</span>
          </div>
          <h1 className="archive-title">THE ARCHIVE</h1>
          <p className="archive-case-subtitle">
            Case File: <span className="case-name">Khushi</span>
          </p>
          <p className="archive-caption">
            Explore the recovered artifacts.
          </p>
        </div>
      </header>

      {/* 5. Top Right Controls (User-Initiated Ambience Audio) */}
      <div className="archive-top-controls">
        <button
          type="button"
          onClick={handleToggleAmbience}
          className={`archive-sound-btn ${isAmbiencePlaying ? 'active' : ''}`}
          title="Toggle atmospheric library audio"
          aria-label="Toggle atmospheric library audio"
        >
          <svg className="sound-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          <span className={`sound-indicator ${isAmbiencePlaying ? 'on' : ''}`} />
          <span className="sound-label">{isAmbiencePlaying ? 'AMBIENCE: ON' : 'AMBIENCE: OFF'}</span>
        </button>
      </div>

      {/* 6. Interactive Hotspots Layer */}
      <ArchiveObjects />

      {/* 7. Footer HUD & Artifact Quick Switcher */}
      <footer className="archive-footer-hud">
        {/* Dynamic Status tracker badge */}
        <div className="archive-tracker-badge">
          <span className="tracker-ping-wrapper">
            <span className="tracker-ping" />
            <span className="tracker-dot" />
          </span>
          <p className="tracker-text">
            <span className="tracker-count">{discoveredCount}</span>/6 DISCOVERIES MADE
          </p>
        </div>

        {/* Quick Direct Access Navigation with Discovered Indicators */}
        <nav className="archive-direct-nav" aria-label="Direct Access Artifacts">
          <span className="direct-nav-label">Direct Access:</span>
          <Link
            to="/letter"
            onClick={() => handleNavClick(523.25)}
            className={`direct-nav-link ${discoveredSet.has('letter') ? 'discovered' : ''}`}
          >
            {discoveredSet.has('letter') && <span className="check-dot">✓</span>} Letter
          </Link>
          <span className="direct-nav-sep">|</span>
          <Link
            to="/memories"
            onClick={() => handleNavClick(440.0)}
            className={`direct-nav-link ${discoveredSet.has('memories') ? 'discovered' : ''}`}
          >
            {discoveredSet.has('memories') && <span className="check-dot">✓</span>} Memories
          </Link>
          <span className="direct-nav-sep">|</span>
          <Link
            to="/raven"
            onClick={() => handleNavClick(329.63)}
            className={`direct-nav-link ${discoveredSet.has('raven') ? 'discovered' : ''}`}
          >
            {discoveredSet.has('raven') && <span className="check-dot">✓</span>} Raven
          </Link>
          <span className="direct-nav-sep">|</span>
          <Link
            to="/forbidden"
            onClick={() => handleNavClick(293.66)}
            className={`direct-nav-link ${discoveredSet.has('forbidden') ? 'discovered' : ''}`}
          >
            {discoveredSet.has('forbidden') && <span className="check-dot">✓</span>} Cipher Box
          </Link>
          <span className="direct-nav-sep">|</span>
          <Link
            to="/audio"
            onClick={() => handleNavClick(587.33)}
            className={`direct-nav-link ${discoveredSet.has('audio') ? 'discovered' : ''}`}
          >
            {discoveredSet.has('audio') && <span className="check-dot">✓</span>} Radio
          </Link>
          <span className="direct-nav-sep">|</span>
          <Link
            to="/drawer"
            onClick={() => handleNavClick(369.99)}
            className={`direct-nav-link ${discoveredSet.has('drawer') ? 'discovered' : ''}`}
          >
            {discoveredSet.has('drawer') && <span className="check-dot">✓</span>} Drawer
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Case;
