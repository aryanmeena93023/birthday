import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EntryGate.css';
import { toggleAmbienceDrone, isAmbienceActive, playUnlockChime } from '../../utils/archiveAudio';

export const EntryGate: React.FC = () => {
  const navigate = useNavigate();
  const [isAudioActive, setIsAudioActive] = useState(isAmbienceActive());
  const [isEntering, setIsEntering] = useState(false);

  const handleToggleAudio = () => {
    if (isEntering) return;
    const nextState = toggleAmbienceDrone((playing) => {
      setIsAudioActive(playing);
    });
    setIsAudioActive(nextState);
  };

  const handleEnterAcademy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isEntering) return;
    setIsEntering(true);

    // Resonant unlock chime gives immediate atmospheric confirmation
    playUnlockChime();

    // Smooth cinematic transition delay before navigating to Page 2 (/case)
    setTimeout(() => {
      navigate('/case');
    }, 1300);
  };

  return (
    <div
      className={`entry-gate-root ${isEntering ? 'is-entering' : ''}`}
      data-purpose="nluja-entry-gate"
    >
      {/* Background Container: Full-bleed gothic gate background with authentic overlays */}
      <div className="entry-gate-bg-wrapper" data-purpose="hero-background-wrapper">
        <img
          src="/media/entrance/gate-background.png"
          alt="NLUJA Assam Gothic Iron Gate at Twilight"
          className="entry-gate-bg-image"
          draggable={false}
        />
        {/* Deep atmospheric shadow & vignette overlay */}
        <div aria-hidden="true" className="entry-gate-vignette" />
        <div aria-hidden="true" className="entry-gate-gradient-overlay" />
      </div>

      {/* Restrained Antique-Gold Edge-Light Aura during Transition */}
      <div
        aria-hidden="true"
        className={`entry-edge-light-aura ${isEntering ? 'active' : ''}`}
      />

      {/* Threshold Golden Bloom Layer during Transition */}
      <div
        aria-hidden="true"
        className={`entry-threshold-bloom ${isEntering ? 'active' : ''}`}
      />

      {/* Velvet Transition Veil Layer */}
      <div
        aria-hidden="true"
        className={`entry-transition-veil ${isEntering ? 'active' : ''}`}
      />

      {/* Main Content Layer */}
      <div className="entry-gate-content px-7 sm:px-10 lg:px-14 py-6 sm:py-8">
        {/* Top Bar: Archival Metadata & Atmosphere Control */}
        <header
          className="w-full flex items-start justify-between text-[11px] tracking-[0.24em] uppercase text-[#a9a296]"
          data-purpose="meta-header"
        >
          {/* Top Left: Deposit ID & Archive Requisition */}
          <div className="flex flex-col space-y-1" data-purpose="archive-status-indicator">
            <div className="flex items-center space-x-2.5">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-[#c59b27] pulse-amber shrink-0"
              />
              <span className="text-[#f7f4ee] font-medium">RECOVERY DEPOSIT // MK-84</span>
            </div>
            <div className="text-[#7d776c] tracking-[0.26em] text-[10px] pl-4">
              JUDICIAL ARCHIVES REQUISITION
            </div>
          </div>

          {/* Top Right: Covenant Date & Atmosphere Audio Toggle */}
          <div className="flex flex-col items-end space-y-2.5" data-purpose="archive-controls">
            <div className="text-[#8c8477] tracking-[0.22em] text-[10.5px]">
              OCTOBER 1984 COVENANT
            </div>
            <button
              type="button"
              onClick={handleToggleAudio}
              aria-pressed={isAudioActive}
              disabled={isEntering}
              className="group flex items-center space-x-2 px-3 py-1.5 rounded-md border border-[#4a4235] bg-[#12100e]/80 hover:bg-[#1a1714] hover:border-[#8c734b] transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50"
              data-purpose="audio-atmosphere-toggle"
              id="audioToggleBtn"
              title="Toggle atmosphere audio"
            >
              {/* Speaker Icon: Muted vs Active */}
              {isAudioActive ? (
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-[#c59b27] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-[#a69d8f] group-hover:text-[#c59b27] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 5" />
                  <line x1="23" x2="17" y1="9" y2="15" />
                  <line x1="17" x2="23" y1="9" y2="15" />
                </svg>
              )}
              <span className="text-[10px] tracking-[0.24em] text-[#a69d8f] group-hover:text-[#f7f4ee] transition-colors">
                ATMOSPHERE :{' '}
                <span className={isAudioActive ? 'text-[#c59b27] font-semibold' : ''}>
                  {isAudioActive ? 'ACTIVE' : 'MUTED'}
                </span>
              </span>
            </button>
          </div>
        </header>

        {/* Center Sanctum Hero */}
        <main
          className="center-sanctum-hero px-4"
          data-purpose="academy-portal-entry"
        >
          {/* Sub-label with ornamental decorative brass rules */}
          <div className="flex items-center justify-center space-x-4 mb-4 sm:mb-5 max-w-xl w-full opacity-90">
            <span
              aria-hidden="true"
              className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8c734b]/60 to-[#a38655]"
            />
            <h2 className="text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.38em] text-[#c9bfaf] font-mono-archival whitespace-nowrap">
              DEPARTMENT OF UNUSUAL OCCURRENCES
            </h2>
            <span
              aria-hidden="true"
              className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#8c734b]/60 to-[#a38655]"
            />
          </div>

          {/* Main Monumental Heading: Authentic NLUJA ASSAM Logo */}
          <img
            src="/media/entrance/nluja-logo.png"
            alt="NLUJA ASSAM"
            className="entry-gate-logo mx-auto w-full select-none pointer-events-none mb-3 sm:mb-4"
            draggable={false}
          />

          {/* Full Academic Institution Name */}
          <p className="font-serif-body italic text-xl sm:text-2xl md:text-3xl text-[#f3ece0] font-normal tracking-[0.03em] mb-3 sm:mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            National Law University and Judicial Academy, Assam
          </p>

          {/* Archival Quote Narrative */}
          <blockquote className="font-serif-body italic text-base sm:text-lg md:text-xl text-[#d4ccc0] tracking-wide max-w-2xl font-light mb-8 sm:mb-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            “A rather unusual file has arrived at the gates...”
          </blockquote>

          {/* Gateway Access Action Button */}
          <div className="flex flex-col items-center space-y-4">
            <button
              type="button"
              onClick={handleEnterAcademy}
              disabled={isEntering}
              className={`btn-academy-entry group relative inline-flex items-center space-x-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-md backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${isEntering ? 'entering' : ''}`}
              data-purpose="enter-academy-action"
              id="enterBtn"
            >
              {/* Glowing amber indicator dot */}
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-full bg-[#c59b27] transition-all duration-300 shrink-0 ${isEntering ? 'scale-150 bg-[#fae0a5] shadow-[0_0_12px_#fae0a5]' : 'group-hover:scale-125 group-hover:bg-[#e7b83d]'}`}
              />
              {/* CTA Text */}
              <span className="text-xs sm:text-sm font-mono-archival uppercase tracking-widest text-[#f5efe6] font-medium group-hover:text-white transition-colors">
                {isEntering ? 'ENTERING THE ACADEMY...' : 'ENTER THE ACADEMY'}
              </span>
              {/* Forward Arrow */}
              <span
                aria-hidden="true"
                className={`text-xs sm:text-sm font-mono-archival text-[#c59b27] transition-all duration-300 ${isEntering ? 'translate-x-2 text-[#fae0a5]' : 'group-hover:text-[#e7b83d] group-hover:translate-x-1'}`}
              >
                →
              </span>
            </button>
          </div>
        </main>

        {/* Footer Bar: Coordinates & Institutional Protocol */}
        <footer
          className="w-full flex flex-col md:flex-row items-center md:items-end justify-between text-[9.5px] sm:text-[10px] tracking-[0.26em] uppercase text-[#696358] gap-2 pt-2 border-t border-white/[0.04]"
          data-purpose="coordinates-footer"
        >
          {/* Geo-Coordinates */}
          <div className="text-center md:text-left">
            LAT 26.1856° N • LONG 91.7483° E • GUWAHATI CITADEL ARCHIVES
          </div>
          {/* Institutional Protocol Legal */}
          <div className="text-center md:text-right text-[#5f5a50]">
            © MMDXXIV JUDICIAL REPOSITORY • RESTRICTED ARCHIVAL PROTOCOL
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EntryGate;
