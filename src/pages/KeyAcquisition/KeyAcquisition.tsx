import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KeyAcquisition.css';
import { playArtifactChime } from '../../utils/archiveAudio';

export const KeyAcquisition: React.FC = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Key acquisition lifecycle: 'notAcquired' | 'animating' | 'acquired'
  const [acquisitionState, setAcquisitionState] = useState<'notAcquired' | 'animating' | 'acquired'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      // Support reset query param ?reset=1 for instant testing
      if (params.get('reset') === '1' || params.get('acquire') === '0') {
        localStorage.removeItem('birthdayWebsite_keyAcquired');
        return 'notAcquired';
      }
      const persisted = localStorage.getItem('birthdayWebsite_keyAcquired');
      return persisted === 'true' ? 'acquired' : 'notAcquired';
    } catch {
      return 'notAcquired';
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAcquireKey = () => {
    if (acquisitionState !== 'notAcquired') return;

    // STATE 2: User clicks Acquire -> transition to animating
    setAcquisitionState('animating');
    if (!isMuted) {
      playArtifactChime(659.25);
    }

    // STATE 3: When animation completes genuinely (1800ms matching CSS sequence)
    window.setTimeout(() => {
      setAcquisitionState('acquired');
      try {
        localStorage.setItem('birthdayWebsite_keyAcquired', 'true');
      } catch (e) {
        console.warn('Could not persist key acquisition state:', e);
      }
      if (!isMuted) {
        playArtifactChime(880);
      }
    }, 1800);
  };

  const handleReturnToArchive = () => {
    playArtifactChime(440);
    navigate('/case');
  };

  const handleMoveToFile06 = () => {
    playArtifactChime(523.25);
    // File No. 06 is the Locked Desk Drawer archive chapter
    navigate('/drawer');
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    playArtifactChime(isMuted ? 659.25 : 329.63);
  };

  return (
    <div className="ka-container">
      {/* Background Ambience Layers */}
      <div className="ka-bg-ambience" aria-hidden="true">
        <div className="ka-bg-plate" />
        <div className="ka-smoke-billow-left" />
        <div className="ka-smoke-billow-right" />
        <div className="ka-smoke-haze-ambient" />
        <div className="ka-dust-texture" />
        <div className="ka-vignette" />
      </div>

      {/* Top Bar: RETURN TO ARCHIVE & MUTED */}
      <header className="ka-topbar">
        <button
          type="button"
          className="ka-return-btn"
          onClick={handleReturnToArchive}
          aria-label="Return to Archive"
        >
          <span className="ka-return-arrow" aria-hidden="true">←</span>
          <span>RETURN TO ARCHIVE</span>
        </button>

        <button
          type="button"
          className="ka-mute-btn"
          onClick={handleToggleMute}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          <span aria-hidden="true">
            {isMuted ? (
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </span>
          <span>{isMuted ? 'MUTED' : 'SOUND'}</span>
        </button>
      </header>

      {/* Header Titles */}
      <section className="ka-header">
        <div className="ka-case-label-wrap">
          <span className="ka-case-label-line" aria-hidden="true" />
          <span className="ka-case-label">CASE FILE // NO. 05</span>
          <span className="ka-case-label-line" aria-hidden="true" />
        </div>
        <h1 className="ka-title">
          {acquisitionState === 'acquired'
            ? 'THE KEY HAS BEEN CLAIMED'
            : 'ACQUIRE THE MASTER KEY'}
        </h1>
        <p className="ka-subtitle">
          {acquisitionState === 'acquired'
            ? '“The seal is broken. Your next chapter awaits.”'
            : '“Claim the relic before venturing into the forbidden archive.”'}
        </p>
      </section>

      {/* Main Content Archival Frame */}
      <main className="ka-main">
        <div className="ka-panel">
          {/* Four Corner Ornamental Flourishes */}
          <svg className="ka-flourish ka-flourish-tl" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
            <circle cx="16" cy="10.5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="16" cy="21.5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="10.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="21.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <path d="M 16 6 C 16 3, 22 4, 30 4 C 36 4, 40 5, 43 5" />
            <path d="M 21.5 10.5 C 27 9, 34 9, 41 9.5" strokeWidth="0.8" />
            <circle cx="43" cy="5" r="1.3" fill="currentColor" stroke="none" />
            <path d="M 6 16 C 3 16, 4 22, 4 30 C 4 36, 5 40, 5 43" />
            <path d="M 10.5 21.5 C 9 27, 9 34, 9.5 41" strokeWidth="0.8" />
            <circle cx="5" cy="43" r="1.3" fill="currentColor" stroke="none" />
            <path d="M 22 22 C 26 26, 25 31, 22 33 C 19 35, 16 33, 17 30 C 18 27, 21 28, 21 30" strokeWidth="0.9" />
          </svg>

          <svg className="ka-flourish ka-flourish-tr" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
            <circle cx="16" cy="10.5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="16" cy="21.5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="10.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="21.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <path d="M 16 6 C 16 3, 22 4, 30 4 C 36 4, 40 5, 43 5" />
            <path d="M 21.5 10.5 C 27 9, 34 9, 41 9.5" strokeWidth="0.8" />
            <circle cx="43" cy="5" r="1.3" fill="currentColor" stroke="none" />
            <path d="M 6 16 C 3 16, 4 22, 4 30 C 4 36, 5 40, 5 43" />
            <path d="M 10.5 21.5 C 9 27, 9 34, 9.5 41" strokeWidth="0.8" />
            <circle cx="5" cy="43" r="1.3" fill="currentColor" stroke="none" />
            <path d="M 22 22 C 26 26, 25 31, 22 33 C 19 35, 16 33, 17 30 C 18 27, 21 28, 21 30" strokeWidth="0.9" />
          </svg>

          <svg className="ka-flourish ka-flourish-bl" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
            <circle cx="16" cy="10.5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="16" cy="21.5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="10.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="21.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <path d="M 16 6 C 16 3, 22 4, 30 4 C 36 4, 40 5, 43 5" />
            <path d="M 21.5 10.5 C 27 9, 34 9, 41 9.5" strokeWidth="0.8" />
            <circle cx="43" cy="5" r="1.3" fill="currentColor" stroke="none" />
            <path d="M 6 16 C 3 16, 4 22, 4 30 C 4 36, 5 40, 5 43" />
            <path d="M 10.5 21.5 C 9 27, 9 34, 9.5 41" strokeWidth="0.8" />
            <circle cx="5" cy="43" r="1.3" fill="currentColor" stroke="none" />
            <path d="M 22 22 C 26 26, 25 31, 22 33 C 19 35, 16 33, 17 30 C 18 27, 21 28, 21 30" strokeWidth="0.9" />
          </svg>

          <svg className="ka-flourish ka-flourish-br" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
            <circle cx="16" cy="10.5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="16" cy="21.5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="10.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="21.5" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <path d="M 16 6 C 16 3, 22 4, 30 4 C 36 4, 40 5, 43 5" />
            <path d="M 21.5 10.5 C 27 9, 34 9, 41 9.5" strokeWidth="0.8" />
            <circle cx="43" cy="5" r="1.3" fill="currentColor" stroke="none" />
            <path d="M 6 16 C 3 16, 4 22, 4 30 C 4 36, 5 40, 5 43" />
            <path d="M 10.5 21.5 C 9 27, 9 34, 9.5 41" strokeWidth="0.8" />
            <circle cx="5" cy="43" r="1.3" fill="currentColor" stroke="none" />
            <path d="M 22 22 C 26 26, 25 31, 22 33 C 19 35, 16 33, 17 30 C 18 27, 21 28, 21 30" strokeWidth="0.9" />
          </svg>

          {/* Central Key Stage */}
          <div className="ka-key-stage">
            <div className="ka-key-halo" aria-hidden="true" />
            <div className="ka-key-ring" aria-hidden="true" />
            <span className="ka-particle ka-particle-1" aria-hidden="true" />
            <span className="ka-particle ka-particle-2" aria-hidden="true" />
            <span className="ka-particle ka-particle-3" aria-hidden="true" />
            <span className="ka-particle ka-particle-4" aria-hidden="true" />
            <span className="ka-particle ka-particle-5" aria-hidden="true" />

            <div
              className={`ka-key-wrap ${
                acquisitionState === 'notAcquired'
                  ? 'ka-key-resting'
                  : acquisitionState === 'animating'
                  ? 'ka-key-animating'
                  : 'ka-key-acquired'
              }`}
              aria-label={
                acquisitionState === 'acquired'
                  ? 'Acquired Antique Golden Key'
                  : 'Antique Golden Key'
              }
            >
              {/* Antique Trefoil Skeleton Key Illustration matching Reference Image */}
              <svg
                className="ka-key-svg"
                viewBox="0 0 64 120"
                width="46"
                height="86"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="kaKeyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fdf3d6" />
                    <stop offset="25%" stopColor="#e8c985" />
                    <stop offset="60%" stopColor="#c59b4c" />
                    <stop offset="100%" stopColor="#7a5522" />
                  </linearGradient>
                </defs>

                {/* Ornate Trefoil Bow (3 interconnected lobes) */}
                <circle cx="32" cy="18" r="9" stroke="url(#kaKeyGold)" strokeWidth="3.2" fill="none" />
                <circle cx="23" cy="29" r="8" stroke="url(#kaKeyGold)" strokeWidth="3" fill="none" />
                <circle cx="41" cy="29" r="8" stroke="url(#kaKeyGold)" strokeWidth="3" fill="none" />
                <circle cx="32" cy="27" r="3.2" fill="url(#kaKeyGold)" />

                {/* Upper Collar Ring */}
                <rect x="27.5" y="40" width="9" height="3" rx="1.5" fill="url(#kaKeyGold)" />
                <rect x="29" y="44" width="6" height="2" rx="1" fill="url(#kaKeyGold)" />

                {/* Central Stem */}
                <rect x="30" y="46" width="4" height="62" rx="1.5" fill="url(#kaKeyGold)" />

                {/* Lower Accent Collar */}
                <rect x="28.5" y="86" width="7" height="2.5" rx="1" fill="url(#kaKeyGold)" />

                {/* Key Bit / Teeth */}
                <path
                  d="M 33 89 H 46 V 97 H 41 V 101 H 46 V 108 H 33 Z"
                  fill="url(#kaKeyGold)"
                />
                {/* Tooth Cutout Notch */}
                <rect x="37" y="93" width="3" height="4" fill="#090708" />
                <rect x="37" y="103" width="4" height="2" fill="#090708" />

                {/* Finial Tip */}
                <circle cx="32" cy="110" r="2.5" fill="url(#kaKeyGold)" />
              </svg>
            </div>
          </div>

          {/* Status Button & Supporting Subtitle */}
          <div className="ka-status-group">
            <button
              type="button"
              className={`ka-status-pill ${
                acquisitionState === 'notAcquired'
                  ? 'ka-status-clickable'
                  : acquisitionState === 'animating'
                  ? 'ka-status-animating'
                  : 'ka-status-confirmed'
              }`}
              onClick={handleAcquireKey}
              disabled={acquisitionState !== 'notAcquired'}
              aria-label={
                acquisitionState === 'acquired'
                  ? 'Key Acquired'
                  : 'Acquire the Key'
              }
            >
              <span className="ka-status-cross" aria-hidden="true">✦</span>
              <span className="ka-status-text">
                {acquisitionState === 'acquired' ? 'KEY ACQUIRED' : 'ACQUIRE THE KEY'}
              </span>
              <span className="ka-status-cross" aria-hidden="true">✦</span>
            </button>
            <p className="ka-status-sub">
              THE SEAL IS BROKEN. YOUR NEXT CHAPTER AWAITS.
            </p>
          </div>

          {/* Bottom Navigation Buttons: Revealed only after acquisition */}
          <div
            className={`ka-buttons-row ${
              acquisitionState === 'acquired'
                ? 'ka-buttons-revealed'
                : 'ka-buttons-hidden'
            }`}
            aria-hidden={acquisitionState !== 'acquired'}
          >
            <button
              type="button"
              className="ka-btn-archive"
              onClick={handleReturnToArchive}
              tabIndex={acquisitionState === 'acquired' ? 0 : -1}
              aria-label="Return to Archive"
            >
              <span className="ka-status-cross" aria-hidden="true">✦</span>
              <span>RETURN TO ARCHIVE</span>
              <span className="ka-status-cross" aria-hidden="true">✦</span>
            </button>

            <button
              type="button"
              className="ka-btn-primary"
              onClick={handleMoveToFile06}
              tabIndex={acquisitionState === 'acquired' ? 0 : -1}
              aria-label="Move to File No. 06"
            >
              <span className="ka-btn-cross-dark" aria-hidden="true">✦</span>
              <span className="ka-btn-primary-text">MOVE TO FILE NO. 06</span>
              <span className="ka-btn-cross-dark" aria-hidden="true">✦</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KeyAcquisition;
