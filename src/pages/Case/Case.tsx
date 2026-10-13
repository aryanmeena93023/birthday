import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Case.css';
import ArchiveFieldGuide from '../../components/ArchiveFieldGuide/ArchiveFieldGuide';
import ArchiveObjects from '../../components/ArchiveObjects/ArchiveObjects';
import {
  playArtifactChime,
  stopAmbienceDrone,
  getArchiveSoundtrack,
  pauseAndResetArchiveSoundtrack,
  playArchiveSoundtrack,
  setArchiveManuallyMuted,
  isArchiveManuallyMutedState
} from '../../utils/archiveAudio';
import { getDiscoveredCount, getDiscoveredSet, markDiscovered } from '../../utils/discoveryTracker';

const Case: React.FC = () => {
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState(false);
  const discoveredCount = getDiscoveredCount();
  const discoveredSet = getDiscoveredSet();

  useEffect(() => {
    // Stop any legacy drone synthesizer sound so there are never conflicting tracks
    stopAmbienceDrone();

    const audio = getArchiveSoundtrack();

    // Reset track position to 00:00 every time Page 2 becomes active
    audio.currentTime = 0;

    const syncState = () => {
      setIsAmbiencePlaying(!audio.paused && !audio.muted);
    };

    audio.addEventListener('play', syncState);
    audio.addEventListener('pause', syncState);
    audio.addEventListener('ended', syncState);

    // Attempt automatic playback from 00:00 if visitor has not manually muted ambience
    if (!isArchiveManuallyMutedState()) {
      const playPromise = playArchiveSoundtrack();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsAmbiencePlaying(true);
          })
          .catch(() => {
            // Browser autoplay restricted; button remains in OFF state until clicked
            setIsAmbiencePlaying(false);
          });
      }
    } else {
      setIsAmbiencePlaying(false);
    }

    // Cleanup on leaving Page 2:
    // Immediately stop playback and reset track position to 00:00
    return () => {
      audio.removeEventListener('play', syncState);
      audio.removeEventListener('pause', syncState);
      audio.removeEventListener('ended', syncState);
      pauseAndResetArchiveSoundtrack();
    };
  }, []);

  const handleToggleAmbience = () => {
    const audio = getArchiveSoundtrack();

    if (audio.paused) {
      // User turned sound ON: clear manual mute and start playback
      const playPromise = playArchiveSoundtrack();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsAmbiencePlaying(true);
          })
          .catch(() => {
            setIsAmbiencePlaying(false);
          });
      }
    } else {
      // User turned sound OFF: pause immediately, reset, and remember manual mute choice
      setArchiveManuallyMuted(true);
      pauseAndResetArchiveSoundtrack();
      setIsAmbiencePlaying(false);
    }
  };

  const handleNavClick = (pitch = 440) => {
    // When opening an artifact, immediately stop soundtrack and rewind to 00:00
    pauseAndResetArchiveSoundtrack();
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

      {/* 4b. Archive Field Guide Instruction Box */}
      <ArchiveFieldGuide />

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
            onClick={() => handleNavClick(440.00)}
            className={`direct-nav-link ${discoveredSet.has('memories') ? 'discovered' : ''}`}
          >
            {discoveredSet.has('memories') && <span className="check-dot">✓</span>} Memory Box
          </Link>
          <span className="direct-nav-sep">|</span>
          <Link
            to="/raven"
            onClick={() => handleNavClick(329.63)}
            className={`direct-nav-link ${discoveredSet.has('raven') ? 'discovered' : ''}`}
          >
            {discoveredSet.has('raven') && <span className="check-dot">✓</span>} Owl
          </Link>

          <span className="direct-nav-sep">|</span>
          <Link
            to="/forbidden"
            onClick={() => {
              handleNavClick(293.66);
              markDiscovered('forbidden');
            }}
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
