import React from 'react';
import './AudioMemory.css';

interface MedallionProps {
  isPlaying: boolean;
  amplitude: number; // 0 to 1
  onClick: () => void;
}

export const Medallion: React.FC<MedallionProps> = ({
  isPlaying,
  amplitude,
  onClick,
}) => {
  // Scale halo & ripples based on audio amplitude
  const rippleScale1 = 1 + amplitude * 0.18;
  const rippleScale2 = 0.95 + amplitude * 0.25;
  const rippleScale3 = 0.9 + amplitude * 0.32;
  const rippleOpacity1 = isPlaying ? 0.35 + amplitude * 0.45 : 0;
  const rippleOpacity2 = isPlaying ? 0.25 + amplitude * 0.35 : 0;
  const rippleOpacity3 = isPlaying ? 0.15 + amplitude * 0.25 : 0;

  const haloGlowOpacity = isPlaying ? 0.2 + amplitude * 0.4 : 0.05;

  return (
    <div className="medallion-stage-container">
      {/* Radial Midnight Scrim & Atmospheric Halo */}
      <div
        className="ambient-halo-blur"
        style={{ opacity: isPlaying ? 0.85 : 0.4 }}
      />
      <div
        className="halo-glow-inner"
        style={{ opacity: haloGlowOpacity, transform: `scale(${1 + amplitude * 0.15})` }}
      />

      {/* Acoustic Ripple Rings */}
      <div className="ripple-rings-layer">
        <div
          className="ripple-ring ring-3"
          style={{
            transform: `scale(${rippleScale3})`,
            opacity: rippleOpacity3,
          }}
        />
        <div
          className="ripple-ring ring-2"
          style={{
            transform: `scale(${rippleScale2})`,
            opacity: rippleOpacity2,
          }}
        />
        <div
          className="ripple-ring ring-1"
          style={{
            transform: `scale(${rippleScale1})`,
            opacity: rippleOpacity1,
          }}
        />
      </div>

      {/* Floating Golden Motes Layer */}
      <div className={`motes-container ${isPlaying ? 'active' : ''}`}>
        <span className="mote mote-1" />
        <span className="mote mote-2" />
        <span className="mote mote-3" />
        <span className="mote mote-4" />
        <span className="mote mote-5" />
      </div>

      {/* Turnable Walnut & Brass Relic Medallion */}
      <button
        type="button"
        className={`medallion-relic-button ${isPlaying ? 'is-playing' : ''}`}
        onClick={onClick}
        aria-label={isPlaying ? 'Pause Audio Memory' : 'Play Audio Memory'}
        title={isPlaying ? 'Pause Audio Memory' : 'Play Audio Memory'}
      >
        <div className="medallion-outer-disc">
          <div className="medallion-rim">
            <div className="medallion-walnut-core">
              {/* Radial Engraved Lines */}
              <svg
                className={`medallion-radial-svg ${isPlaying ? 'rotating-relic' : ''}`}
                viewBox="0 0 160 160"
                aria-hidden="true"
              >
                <circle cx="80" cy="80" r="74" fill="none" stroke="#ddc48b" strokeWidth="0.6" strokeDasharray="2 4" />
                <circle cx="80" cy="80" r="68" fill="none" stroke="#baa36d" strokeWidth="0.5" />
              </svg>

              <div className="medallion-inner-sanctum">
                <div
                  className="medallion-aura"
                  style={{ opacity: isPlaying ? 0.9 : 0.1 }}
                />

                {/* Relic Brass Glyph & Astrolabe Markings */}
                <svg className="medallion-glyph-svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="brass-grad-foil" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fae0a5" />
                      <stop offset="40%" stopColor="#ddc48b" />
                      <stop offset="70%" stopColor="#baa36d" />
                      <stop offset="100%" stopColor="#6f5c2d" />
                    </linearGradient>
                    <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fae0a5" stopOpacity="0.35" />
                      <stop offset="60%" stopColor="#baa36d" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#1b1512" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <circle cx="60" cy="60" r="54" fill="url(#core-glow)" />
                  <circle cx="60" cy="60" r="52" stroke="#ddc48b" strokeWidth="0.6" strokeDasharray="1.5 3" opacity="0.6" />
                  <circle cx="60" cy="60" r="47" stroke="#baa36d" strokeWidth="0.8" opacity="0.75" />
                  <circle cx="60" cy="60" r="44" stroke="#ddc48b" strokeWidth="0.5" strokeDasharray="0.8 4" opacity="0.5" />

                  {/* Ticks */}
                  <g opacity="0.7">
                    <line x1="60" y1="7" x2="60" y2="13" stroke="#ddc48b" strokeWidth="1" />
                    <line x1="60" y1="107" x2="60" y2="113" stroke="#ddc48b" strokeWidth="1" />
                    <line x1="7" y1="60" x2="13" y2="60" stroke="#ddc48b" strokeWidth="1" />
                    <line x1="107" y1="60" x2="113" y2="60" stroke="#ddc48b" strokeWidth="1" />
                    <circle cx="60" cy="10" r="1.5" fill="#fae0a5" />
                    <circle cx="60" cy="110" r="1.5" fill="#fae0a5" />
                    <circle cx="10" cy="60" r="1.5" fill="#fae0a5" />
                    <circle cx="110" cy="60" r="1.5" fill="#fae0a5" />
                  </g>

                  {/* Relic Musical Treble / Archival Glyph */}
                  <g id="relic-glyph">
                    <path
                      d="M64 26 C64 26, 74 22, 85 31 C92 37.5, 84 45, 74 42.5 C67 40.5, 65 36.5, 64 35.5 L64 72 C64 79.5, 56.5 86, 47.5 86 C38.5 86, 31 79.5, 31 72 C31 64.5, 38.5 58, 47.5 58 C51.3 58, 54.8 59.2, 57.5 61.3 L57.5 29.5 C57.5 27.5, 59 26, 61 26 Z"
                      fill="url(#brass-grad-foil)"
                      stroke="#fae0a5"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <ellipse cx="47.5" cy="72" rx="11" ry="8" fill="#241c17" opacity="0.45" />
                    <circle cx="47.5" cy="72" r="3.5" fill="#fae0a5" opacity="0.8" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Relic Indicator Dot */}
      <div className="relic-live-indicator">
        <span className={`relic-live-dot ${isPlaying ? 'playing' : ''}`} />
      </div>
    </div>
  );
};
