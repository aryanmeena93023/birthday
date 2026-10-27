import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './FinalConsecrationPage.css';

interface FinalConsecrationPageProps {
  onNavigateStage: (targetStage: 1 | 2 | 3 | 4) => void;
  isAmbiencePlaying: boolean;
  onToggleAmbience: () => void;
}

interface FireflyConfig {
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  variant: 1 | 2 | 3 | 4;
}

// Tier 1: Large Glowing Star Orbs (Luminous Bokeh Orbs)
const GLOWING_STAR_ORBS: FireflyConfig[] = [
  { top: '15%', left: '12%', size: 10, duration: 18, delay: -2, opacity: 0.75, variant: 1 },
  { top: '25%', left: '82%', size: 12, duration: 22, delay: -8, opacity: 0.65, variant: 2 },
  { top: '48%', left: '88%', size: 9, duration: 16, delay: -14, opacity: 0.80, variant: 3 },
  { top: '65%', left: '14%', size: 11, duration: 20, delay: -5, opacity: 0.70, variant: 4 },
  { top: '18%', left: '68%', size: 8, duration: 24, delay: -11, opacity: 0.60, variant: 1 },
  { top: '78%', left: '76%', size: 13, duration: 19, delay: -3, opacity: 0.85, variant: 2 },
  { top: '84%', left: '28%', size: 9, duration: 25, delay: -16, opacity: 0.65, variant: 3 },
  { top: '38%', left: '08%', size: 10, duration: 21, delay: -9, opacity: 0.75, variant: 4 },
  { top: '08%', left: '45%', size: 11, duration: 17, delay: -13, opacity: 0.70, variant: 1 },
  { top: '55%', left: '92%', size: 8, duration: 23, delay: -7, opacity: 0.60, variant: 2 },
  { top: '72%', left: '52%', size: 10, duration: 26, delay: -18, opacity: 0.55, variant: 3 },
  { top: '32%', left: '90%', size: 12, duration: 15, delay: -4, opacity: 0.80, variant: 4 },
];

// Tier 2: Medium Floating Fireflies & Gold Lights
const MEDIUM_FIREFLIES: FireflyConfig[] = [
  { top: '10%', left: '06%', size: 4.5, duration: 14, delay: -3, opacity: 0.55, variant: 1 },
  { top: '20%', left: '88%', size: 3.5, duration: 18, delay: -7, opacity: 0.45, variant: 2 },
  { top: '32%', left: '18%', size: 5.0, duration: 15, delay: -12, opacity: 0.65, variant: 3 },
  { top: '16%', left: '44%', size: 3.0, duration: 22, delay: -5, opacity: 0.50, variant: 4 },
  { top: '45%', left: '76%', size: 4.0, duration: 17, delay: -15, opacity: 0.60, variant: 1 },
  { top: '62%', left: '08%', size: 4.5, duration: 16, delay: -2, opacity: 0.55, variant: 2 },
  { top: '76%', left: '84%', size: 3.2, duration: 20, delay: -10, opacity: 0.40, variant: 3 },
  { top: '84%', left: '34%', size: 4.2, duration: 19, delay: -8, opacity: 0.60, variant: 4 },
  { top: '26%', left: '62%', size: 3.5, duration: 13, delay: -14, opacity: 0.50, variant: 1 },
  { top: '52%', left: '20%', size: 5.2, duration: 23, delay: -6, opacity: 0.70, variant: 2 },
  { top: '12%', left: '76%', size: 3.0, duration: 21, delay: -18, opacity: 0.45, variant: 3 },
  { top: '40%', left: '94%', size: 4.0, duration: 14, delay: -4, opacity: 0.65, variant: 4 },
  { top: '66%', left: '64%', size: 3.8, duration: 24, delay: -11, opacity: 0.50, variant: 1 },
  { top: '86%', left: '68%', size: 3.2, duration: 18, delay: -9, opacity: 0.45, variant: 2 },
  { top: '28%', left: '30%', size: 4.8, duration: 19, delay: -16, opacity: 0.60, variant: 3 },
  { top: '75%', left: '44%', size: 3.6, duration: 17, delay: -1, opacity: 0.55, variant: 4 },
  { top: '08%', left: '22%', size: 3.0, duration: 25, delay: -13, opacity: 0.40, variant: 1 },
  { top: '56%', left: '82%', size: 4.6, duration: 16, delay: -17, opacity: 0.68, variant: 2 },
  { top: '88%', left: '14%', size: 3.8, duration: 21, delay: -5, opacity: 0.50, variant: 3 },
  { top: '22%', left: '96%', size: 3.4, duration: 19, delay: -19, opacity: 0.45, variant: 4 },
  { top: '60%', left: '34%', size: 5.0, duration: 15, delay: -8, opacity: 0.60, variant: 1 },
  { top: '36%', left: '50%', size: 3.2, duration: 22, delay: -21, opacity: 0.48, variant: 2 },
  { top: '94%', left: '38%', size: 4.0, duration: 20, delay: -4, opacity: 0.42, variant: 3 },
  { top: '04%', left: '58%', size: 3.6, duration: 18, delay: -12, opacity: 0.52, variant: 4 },
];

// Tier 3: Crisp Distant Sparkling Star Points
const SPARKLING_POINTS: FireflyConfig[] = [
  { top: '06%', left: '15%', size: 1.8, duration: 9, delay: -2, opacity: 0.70, variant: 1 },
  { top: '14%', left: '35%', size: 2.2, duration: 11, delay: -5, opacity: 0.80, variant: 2 },
  { top: '24%', left: '78%', size: 1.5, duration: 10, delay: -8, opacity: 0.65, variant: 3 },
  { top: '36%', left: '06%', size: 2.0, duration: 12, delay: -1, opacity: 0.75, variant: 4 },
  { top: '44%', left: '90%', size: 1.6, duration: 8, delay: -10, opacity: 0.60, variant: 1 },
  { top: '58%', left: '16%', size: 2.2, duration: 13, delay: -4, opacity: 0.85, variant: 2 },
  { top: '68%', left: '80%', size: 1.4, duration: 9, delay: -7, opacity: 0.55, variant: 3 },
  { top: '80%', left: '22%', size: 2.0, duration: 11, delay: -12, opacity: 0.75, variant: 4 },
  { top: '90%', left: '84%', size: 1.8, duration: 10, delay: -3, opacity: 0.65, variant: 1 },
  { top: '18%', left: '52%', size: 2.2, duration: 14, delay: -9, opacity: 0.80, variant: 2 },
  { top: '48%', left: '60%', size: 1.5, duration: 9, delay: -6, opacity: 0.50, variant: 3 },
  { top: '72%', left: '38%', size: 2.0, duration: 12, delay: -15, opacity: 0.70, variant: 4 },
  { top: '09%', left: '92%', size: 1.6, duration: 8, delay: -4, opacity: 0.60, variant: 1 },
  { top: '30%', left: '25%', size: 2.4, duration: 13, delay: -11, opacity: 0.85, variant: 2 },
  { top: '64%', left: '70%', size: 1.8, duration: 10, delay: -8, opacity: 0.65, variant: 3 },
  { top: '86%', left: '58%', size: 2.0, duration: 11, delay: -14, opacity: 0.70, variant: 4 },
  { top: '03%', left: '40%', size: 1.5, duration: 9, delay: -1, opacity: 0.55, variant: 1 },
  { top: '50%', left: '04%', size: 2.2, duration: 12, delay: -6, opacity: 0.80, variant: 2 },
  { top: '78%', left: '95%', size: 1.8, duration: 10, delay: -13, opacity: 0.60, variant: 3 },
  { top: '95%', left: '10%', size: 2.0, duration: 14, delay: -5, opacity: 0.75, variant: 4 },
];

const FinalConsecrationPage: React.FC<FinalConsecrationPageProps> = ({
  onNavigateStage,
  isAmbiencePlaying,
  onToggleAmbience,
}) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const card = cardRef.current;
    if (!card) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      const xNorm = Math.max(-1, Math.min(1, deltaX / (rect.width / 2)));
      const yNorm = Math.max(-1, Math.min(1, deltaY / (rect.height / 2)));

      const rotateX = yNorm * 4;
      const rotateY = -xNorm * 4;
      const translateZ = 6;

      const shadowX = -xNorm * 12;
      const shadowY = -yNorm * 12 + 28;
      const glowOpacity = 0.22 + Math.abs(xNorm) * 0.08;

      card.style.transition = 'transform 0.06s ease-out, box-shadow 0.06s ease-out';
      card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(${translateZ}px)`;
      card.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 85px rgba(0, 0, 0, 0.95), 0 0 35px rgba(250, 224, 165, ${glowOpacity.toFixed(2)})`;
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const card = cardRef.current;
    if (!card) return;

    card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    card.style.boxShadow = '';
  };

  const handleReplayExperience = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateStage(3);
  };

  const handleReturnToArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/case');
  };

  return (
    <div className="consecration-viewport">
      {/* Moving Atmospheric Deep Indigo & Sapphire Light Fields */}
      <div className="consecration-blue-field-left" />
      <div className="consecration-blue-field-right" />
      <div className="consecration-cyan-field-top" />

      {/* Layered Ambient Glow behind Parchment */}
      <div className="consecration-ambient-glow-outer" />
      <div className="consecration-ambient-glow-core" />
      <div className="consecration-bg-stars" />

      {/* Multi-tier Atmospheric Luminous Particles Layer */}
      <div className="consecration-fireflies-layer" aria-hidden="true">
        {/* Tier 1: Large Glowing Star Orbs */}
        {GLOWING_STAR_ORBS.map((p, idx) => (
          <div
            key={`orb-${idx}`}
            className={`consecration-star-orb orb-variant-${p.variant}`}
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
            }}
          />
        ))}

        {/* Tier 2: Medium Floating Firefly Particles */}
        {MEDIUM_FIREFLIES.map((p, idx) => (
          <div
            key={`ff-${idx}`}
            className={`consecration-firefly firefly-variant-${p.variant}`}
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
            }}
          />
        ))}

        {/* Tier 3: Crisp Distant Sparkling Points */}
        {SPARKLING_POINTS.map((p, idx) => (
          <div
            key={`sparkle-${idx}`}
            className={`consecration-sparkle sparkle-variant-${p.variant}`}
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* SHARED NLUJA HEADER */}
      <header className="consecration-header" onClick={(e) => e.stopPropagation()}>
        <div className="consecration-header-inner">
          <div className="consecration-header-left">
            <div className="consecration-header-badge">
              <Link
                to="/case"
                className="consecration-back-arrow"
                aria-label="Return to Archive"
                title="Return to Archive"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </Link>
              <span className="consecration-pulse-dot" />
              <span>NLUJA ASSAM // FILE NO. 06</span>
            </div>
            <span className="consecration-header-loc">LOC: GUWAHATI LAT 26.1445° N</span>
          </div>

          <nav className="consecration-header-nav">
            <Link to="/case" className="consecration-nav-link" onClick={(e) => e.stopPropagation()}>Dossier Index</Link>
            <Link to="/drawer" className="consecration-nav-link active" onClick={(e) => e.stopPropagation()}>Sanctum Desk</Link>

            <Link to="/letter" className="consecration-nav-link" onClick={(e) => e.stopPropagation()}>Sealed Letters</Link>
          </nav>

          <div className="consecration-header-right">
            <button
              type="button"
              className="consecration-ambience-pill"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAmbience();
              }}
              title="Toggle Ambience Audio"
            >
              <span className="material-symbols-outlined text-[15px] text-[#b4c9df]">
                {isAmbiencePlaying ? 'volume_up' : 'volume_off'}
              </span>
              <span>AMBIENCE: {isAmbiencePlaying ? 'ACTIVE' : 'INACTIVE'}</span>
            </button>

            <Link to="/case" className="consecration-esc-btn" onClick={(e) => e.stopPropagation()} title="Return to Sanctum Desk">
              ESC
            </Link>

            <div className="consecration-user-badge" onClick={(e) => e.stopPropagation()} title="Archival Officer">
              <span className="material-symbols-outlined text-[16px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* SUB-HEADER BAR TAGS */}
      <div className="consecration-sub-bar" onClick={(e) => e.stopPropagation()}>
        <span className="consecration-sub-tag-left">NLUJA ARCHIVAL ACCESS</span>
        <span className="consecration-sub-tag-right">FINAL CEREMONIAL CONSECRATION</span>
      </div>

      {/* MAIN PARCHMENT DOCUMENT CONTAINER */}
      <main className="consecration-main-stage">
        <div className="consecration-tilt-wrapper">
          <div
            ref={cardRef}
            className="consecration-parchment-card"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {/* Decorative Gold Corner Brackets */}
            <span className="parchment-corner top-left" />
            <span className="parchment-corner top-right" />
            <span className="parchment-corner bottom-left" />
            <span className="parchment-corner bottom-right" />

            {/* Top Square Burgundy Emblem with Centered Gold Star */}
            <div className="parchment-emblem-wrap">
              <div className="parchment-emblem">
                <span className="parchment-emblem-star">★</span>
              </div>
            </div>

            {/* Confidential Archival Label */}
            <div className="parchment-label">
              NLUJA SPECIAL CEREMONIAL TESTAMENT // CONFIDENTIAL
            </div>

            {/* Main Birthday Headline */}
            <h1 className="parchment-headline">
              <span>HAPPY BIRTHDAY,</span>
              <span className="parchment-name">KHUSHI</span>
            </h1>

            {/* Decorative Gold Line & Diamond Divider */}
            <div className="parchment-divider">
              <span className="parchment-line" />
              <span className="parchment-diamond">✦</span>
              <span className="parchment-line" />
            </div>

            {/* Personal Birthday Message */}
            <p className="parchment-message">
              “May this year be kinder, brighter, and filled with memories worth holding onto. I hope you like this gift and I trust it brings a smile to your face.”
            </p>

            {/* Case Conclusion Box */}
            <div className="parchment-conclusion-box">
              <span className="conclusion-line-primary">
                CASE CONCLUSION: A YEAR WORTH REMEMBERING.
              </span>
              <span className="conclusion-line-secondary">
                ARCHIVE STATUS: CELEBRATION COMPLETE.
              </span>
            </div>

            {/* Final Action Buttons */}
            <div className="parchment-btn-row">
              <button
                type="button"
                className="consecration-btn-replay"
                onClick={handleReplayExperience}
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>REPLAY EXPERIENCE</span>
              </button>

              <button
                type="button"
                className="consecration-btn-return"
                onClick={handleReturnToArchive}
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>RETURN TO ARCHIVE</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* DIRECT STATE CONTROLLER HUD BAR */}
      <div className="consecration-hud-bar" onClick={(e) => e.stopPropagation()}>
        <div className="consecration-hud-left">
          <span className="consecration-hud-label">DIRECT STATE CONTROLLER</span>
          <div className="consecration-hud-val-wrap">
            <span className="consecration-pulse-dot-red" />
            <span className="consecration-hud-val">
              STAGE 04: FINAL CONSECRATION & CLOSURE
            </span>
          </div>
        </div>

        <div className="consecration-hud-matrix">
          <button
            type="button"
            className="consecration-state-pill"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateStage(1);
            }}
            title="State 1: Drawer Locked"
          >
            1
          </button>
          <button
            type="button"
            className="consecration-state-pill"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateStage(2);
            }}
            title="State 2: Occurrences Tray"
          >
            2
          </button>
          <button
            type="button"
            className="consecration-state-pill"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateStage(3);
            }}
            title="State 3: Midnight Ledger"
          >
            3
          </button>
          <button
            type="button"
            className="consecration-state-pill active"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateStage(4);
            }}
            title="State 4: Final Consecration & Closure"
          >
            4
          </button>
        </div>

        <div
          className="consecration-synth-badge"
          onClick={(e) => {
            e.stopPropagation();
            onToggleAmbience();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              onToggleAmbience();
            }
          }}
          title="Toggle Synthesizer / Ambience Audio"
        >
          <span className="material-symbols-outlined text-[15px] text-[#fae0a5]">volume_up</span>
          <span>SYNTH AUDIO: {isAmbiencePlaying ? 'ACTIVE' : 'INACTIVE'}</span>
        </div>
      </div>

      {/* FIXED FOOTER SEQUENCE BAR */}
      <footer className="consecration-footer-bar" onClick={(e) => e.stopPropagation()}>
        <div className="consecration-footer-inner">
          <div className="consecration-footer-seq">
            <span className="consecration-seq-label">Sequence</span>
            <span className="consecration-seq-counts">04 / 04</span>
          </div>

          <div className="consecration-footer-steps">
            <div className="consecration-step-item">
              <span>I. Conclave Entry</span>
            </div>
            <span className="consecration-step-dot">•</span>
            <div className="consecration-step-item">
              <span>II. Occurrences Tray</span>
            </div>
            <span className="consecration-step-dot">•</span>
            <div className="consecration-step-item">
              <span>III. Midnight Ledger</span>
            </div>
            <span className="consecration-step-dot">•</span>
            <div className="consecration-step-item active">
              <span>IV. Sealed Docket</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FinalConsecrationPage;
