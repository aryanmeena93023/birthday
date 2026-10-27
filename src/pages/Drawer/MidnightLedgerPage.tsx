import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './MidnightLedgerPage.css';
import drawerBirthday from '../../content/drawerBirthday';
import { getAudioContext } from '../../utils/archiveAudio';

interface MidnightLedgerPageProps {
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

const FIREFLY_PARTICLES: FireflyConfig[] = [
  { top: '12%', left: '8%', size: 2.5, duration: 18, delay: -3, opacity: 0.16, variant: 1 },
  { top: '22%', left: '85%', size: 2.0, duration: 22, delay: -8, opacity: 0.12, variant: 2 },
  { top: '35%', left: '15%', size: 3.0, duration: 16, delay: -12, opacity: 0.20, variant: 3 },
  { top: '18%', left: '42%', size: 1.8, duration: 25, delay: -5, opacity: 0.14, variant: 4 },
  { top: '48%', left: '78%', size: 2.2, duration: 20, delay: -15, opacity: 0.18, variant: 1 },
  { top: '65%', left: '10%', size: 2.8, duration: 19, delay: -2, opacity: 0.15, variant: 2 },
  { top: '75%', left: '88%', size: 1.5, duration: 24, delay: -10, opacity: 0.10, variant: 3 },
  { top: '82%', left: '30%', size: 2.4, duration: 21, delay: -7, opacity: 0.17, variant: 4 },
  { top: '28%', left: '65%', size: 2.0, duration: 17, delay: -14, opacity: 0.13, variant: 1 },
  { top: '55%', left: '22%', size: 3.2, duration: 26, delay: -6, opacity: 0.22, variant: 2 },
  { top: '14%', left: '72%', size: 1.6, duration: 23, delay: -18, opacity: 0.11, variant: 3 },
  { top: '42%', left: '92%', size: 2.6, duration: 15, delay: -4, opacity: 0.19, variant: 4 },
  { top: '68%', left: '60%', size: 2.2, duration: 27, delay: -11, opacity: 0.14, variant: 1 },
  { top: '88%', left: '70%', size: 1.8, duration: 19, delay: -9, opacity: 0.12, variant: 2 },
  { top: '30%', left: '32%', size: 2.5, duration: 22, delay: -16, opacity: 0.18, variant: 3 },
  { top: '78%', left: '48%', size: 2.0, duration: 20, delay: -1, opacity: 0.15, variant: 4 },
  { top: '10%', left: '25%', size: 1.6, duration: 28, delay: -13, opacity: 0.09, variant: 1 },
  { top: '58%', left: '84%', size: 2.8, duration: 18, delay: -17, opacity: 0.21, variant: 2 },
  { top: '85%', left: '16%', size: 2.2, duration: 24, delay: -5, opacity: 0.13, variant: 3 },
  { top: '20%', left: '94%', size: 1.9, duration: 21, delay: -19, opacity: 0.11, variant: 4 },
  { top: '62%', left: '38%', size: 3.0, duration: 16, delay: -8, opacity: 0.17, variant: 1 },
  { top: '38%', left: '52%', size: 1.7, duration: 25, delay: -21, opacity: 0.14, variant: 2 },
  { top: '92%', left: '40%', size: 2.3, duration: 23, delay: -4, opacity: 0.12, variant: 3 },
  { top: '06%', left: '55%', size: 2.1, duration: 20, delay: -12, opacity: 0.15, variant: 4 },
];

const MidnightLedgerPage: React.FC<MidnightLedgerPageProps> = ({
  onNavigateStage,
  isAmbiencePlaying,
  onToggleAmbience,
}) => {
  const [candleState, setCandleState] = useState<5 | 6 | 7 | 8 | 9>(5);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [lineVisible, setLineVisible] = useState<boolean>(false);

  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNavigatingRef = useRef<boolean>(false);

  const clearTimers = () => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (streamTimerRef.current) {
      clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  // Clean, audible magical sound synthesis tailored for Locked Drawer Page 3
  const playCountdownTick = (countNum: number) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Warm, crystalline resonant tone for countdown 3, 2, 1
      const pitches: Record<number, number> = { 3: 523.25, 2: 587.33, 1: 659.25 }; // C5, D5, E5
      const freq = pitches[countNum] || 523.25;

      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + 0.2);

      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(freq * 2, now);

      // Balanced audible level (~0.30) decaying naturally
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.30, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(gain);
      harmonic.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      harmonic.start(now);
      osc.stop(now + 0.35);
      harmonic.stop(now + 0.35);
    } catch {
      // Graceful fallback
    }
  };

  const playPopupShimmer = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Elegant magical chime chord: E5, G#5, B5, E6 (E-major celestial chime)
      const chord = [659.25, 830.61, 987.77, 1318.51];
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const noteStart = now + i * 0.08;
        osc.frequency.setValueAtTime(freq, noteStart);

        // Balanced audible volume (~0.32 peak) with smooth shimmer sustain
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.32, noteStart + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.9);
      });
    } catch {
      // Graceful fallback
    }
  };

  const runTextStream = (lineIndex: number) => {
    if (lineIndex >= drawerBirthday.lines.length) {
      setCandleState(9);
      setLineVisible(false);
      playPopupShimmer();
      return;
    }

    setCurrentLineIndex(lineIndex);
    setLineVisible(true);

    streamTimerRef.current = setTimeout(() => {
      setLineVisible(false);

      streamTimerRef.current = setTimeout(() => {
        runTextStream(lineIndex + 1);
      }, 600);
    }, 2600);
  };

  const handleBlowCandles = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (candleState !== 5) return;
    setCandleState(6);
    setCountdownValue(3);
    playCountdownTick(3);

    // Countdown 3 -> 2 -> 1
    countdownTimerRef.current = setTimeout(() => {
      setCountdownValue(2);
      playCountdownTick(2);

      countdownTimerRef.current = setTimeout(() => {
        setCountdownValue(1);
        playCountdownTick(1);

        countdownTimerRef.current = setTimeout(() => {
          // Extinguish candles (State 7)
          setCandleState(7);

          // After 1200ms smoke animation -> State 8 (Floating text stream)
          countdownTimerRef.current = setTimeout(() => {
            setCandleState(8);
            runTextStream(0);
          }, 1200);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleReplaySequence = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    isNavigatingRef.current = false;
    clearTimers();
    setCandleState(5);
    setCountdownValue(3);
    setCurrentLineIndex(0);
    setLineVisible(false);
  };

  const handleViewportClick = () => {
    if (candleState !== 9) return;
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    onNavigateStage(4);
  };

  const handleViewportKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (candleState !== 9) return;
    if (e.target !== e.currentTarget) return; // Ignore if focused element is a child button
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      onNavigateStage(4);
    }
  };

  const handleContinueNextStage = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    onNavigateStage(4);
  };

  const isFinished = candleState === 9;

  return (
    <div
      className={`midnight-ledger-viewport ${isFinished ? 'clickable-ready' : ''}`}
      onClick={handleViewportClick}
      onKeyDown={handleViewportKeyDown}
      tabIndex={isFinished ? 0 : -1}
      role={isFinished ? 'button' : undefined}
      aria-label={isFinished ? 'Click anywhere to advance to next stage' : undefined}
    >
      {/* Layered Atmospheric Radial Glow & Firefly Ambient Lights */}
      <div className="ledger-ambient-glow-outer" />
      <div className="ledger-ambient-glow-halo" />
      <div className="ledger-ambient-glow-core" />
      <div className="ledger-bg-stars" />
      <div className="ledger-fireflies-layer" aria-hidden="true">
        {FIREFLY_PARTICLES.map((p, idx) => (
          <div
            key={idx}
            className={`ledger-firefly firefly-variant-${p.variant}`}
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

      {/* FIXED HEADER NAVIGATION */}
      <header className="ledger-header" onClick={(e) => e.stopPropagation()}>
        <div className="ledger-header-inner">
          <div className="ledger-header-left">
            <div className="ledger-header-badge">
              <Link
                to="/case"
                className="ledger-back-arrow"
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
              <span className="ledger-pulse-dot" />
              <span>__NLUJA ASSAM // FILE NO. 06</span>
            </div>
            <span className="ledger-header-loc">LOC: GUWAHATI LAT 26.1445° N</span>
          </div>

          <nav className="ledger-header-nav">
            <Link to="/case" className="ledger-nav-link" onClick={(e) => e.stopPropagation()}>Dossier Index</Link>
            <Link to="/drawer" className="ledger-nav-link active" onClick={(e) => e.stopPropagation()}>Sanctum Desk</Link>

            <Link to="/letter" className="ledger-nav-link" onClick={(e) => e.stopPropagation()}>Sealed Letters</Link>
          </nav>

          <div className="ledger-header-right">
            <button
              type="button"
              className="ledger-ambience-pill"
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

            <Link to="/case" className="ledger-esc-btn" onClick={(e) => e.stopPropagation()} title="Return to Sanctum Desk">
              ESC
            </Link>

            <div className="ledger-user-badge" onClick={(e) => e.stopPropagation()} title="Archival Officer">
              <span className="material-symbols-outlined text-[16px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* SUB-HEADER BAR TAGS */}
      <div className="ledger-sub-bar" onClick={(e) => e.stopPropagation()}>
        <span className="ledger-sub-tag-left">NLUJA ARCHIVAL ACCESS</span>
        <span className="ledger-sub-tag-right">MIDNIGHT CEREMONY</span>
      </div>

      {/* MAIN BIRTHDAY CAKE VIEWPORT CENTERPIECE */}
      <main className="ledger-main-stage">
        <div className="ledger-cake-centerpiece">
          
          {/* 3 Slender Candles Row */}
          <div className="ledger-candles-row">
            {/* Candle 1 */}
            <div className="ledger-candle-unit">
              <div className="ledger-flame-box">
                <div className={`ledger-flame-glow ${candleState === 5 || candleState === 6 ? 'active' : ''}`} />
                <div className={`ledger-flame-fire ${candleState === 5 || candleState === 6 ? 'active' : 'extinguished'}`} />
                <div className={`ledger-smoke-wisp ${candleState >= 7 ? 'active' : ''}`} />
              </div>
              <div className="ledger-candle-wick" />
              <div className="ledger-candle-stick short" />
            </div>

            {/* Candle 2 (Center Tall) */}
            <div className="ledger-candle-unit">
              <div className="ledger-flame-box">
                <div className={`ledger-flame-glow ${candleState === 5 || candleState === 6 ? 'active' : ''}`} />
                <div className={`ledger-flame-fire ${candleState === 5 || candleState === 6 ? 'active' : 'extinguished'}`} />
                <div className={`ledger-smoke-wisp ${candleState >= 7 ? 'active' : ''}`} />
              </div>
              <div className="ledger-candle-wick" />
              <div className="ledger-candle-stick tall" />
            </div>

            {/* Candle 3 */}
            <div className="ledger-candle-unit">
              <div className="ledger-flame-box">
                <div className={`ledger-flame-glow ${candleState === 5 || candleState === 6 ? 'active' : ''}`} />
                <div className={`ledger-flame-fire ${candleState === 5 || candleState === 6 ? 'active' : 'extinguished'}`} />
                <div className={`ledger-smoke-wisp ${candleState >= 7 ? 'active' : ''}`} />
              </div>
              <div className="ledger-candle-wick" />
              <div className="ledger-candle-stick short" />
            </div>
          </div>

          {/* Standalone Tiered Ivory Cake */}
          <div className="ledger-tiered-cake">
            <div className="ledger-cake-tier-top">
              <div className="ledger-top-stars">
                <span>✦</span>
                <span>✦</span>
                <span>✦</span>
                <span>✦</span>
                <span>✦</span>
                <span>✦</span>
              </div>
            </div>
            <div className="ledger-cake-tier-bottom">
              <div className="ledger-bottom-crest-row">
                <span className="ledger-crest-star-primary">✦</span>
                <span className="ledger-crest-star">✦</span>
                <span className="ledger-crest-star-primary">✦</span>
                <span className="ledger-crest-star">✦</span>
                <span className="ledger-crest-star-primary">✦</span>
              </div>
            </div>
            <div className="ledger-pedestal-plate" />
            <div className="ledger-pedestal-base" />
          </div>
        </div>

        {/* STANDALONE INTERACTIVE CONTROLS / CLIMAX DISPLAY */}
        <div className="ledger-content-area">
          {/* State 5: Initial Lit State */}
          {candleState === 5 && (
            <>
              <button
                type="button"
                className="ledger-btn-make-wish"
                onClick={handleBlowCandles}
              >
                <span className="material-symbols-outlined text-[16px]">mode_fan</span>
                <span>MAKE A WISH & EXTINGUISH</span>
              </button>
              <p className="ledger-wish-quote">
                “May every secret inscribed in the ledgers unfold in luminous favor.”
              </p>
            </>
          )}

          {/* State 6: Countdown */}
          {candleState === 6 && (
            <div className="ledger-countdown-wrap">
              <span className="ledger-countdown-label">COUNTDOWN TO EXTINGUISH</span>
              <span className="ledger-countdown-num">{countdownValue}</span>
            </div>
          )}

          {/* State 7: Smoke transition */}
          {candleState === 7 && (
            <div className="ledger-countdown-wrap">
              <span className="ledger-countdown-label">EXTINGUISHING CANDLES...</span>
            </div>
          )}

          {/* State 8: Floating Reflection Stream */}
          {candleState === 8 && (
            <div className="ledger-text-stream">
              <span className="ledger-stream-tag">
                REFLECTION RECORD // {currentLineIndex + 1} OF {drawerBirthday.lines.length}
              </span>
              <p className={`ledger-stream-line ${lineVisible ? 'visible' : 'fade-up'}`}>
                “{drawerBirthday.lines[currentLineIndex]}”
              </p>
            </div>
          )}

          {/* State 9: Final Climax Reveal */}
          {candleState === 9 && (
            <div className="ledger-climax-group">
              <span className="ledger-climax-tag">TESTAMENT OF COMMENDATION</span>
              <div className="ledger-climax-typography">
                <h1 className="ledger-greeting-primary">Happy Birthday</h1>
                <div className="ledger-greeting-divider">
                  <span className="ledger-div-line"></span>
                  <span className="ledger-div-star">✦</span>
                  <span className="ledger-div-line"></span>
                </div>
                <h2 className="ledger-greeting-secondary">Khushi</h2>
                <div className="ledger-greeting-divider small">
                  <span className="ledger-div-line"></span>
                  <span className="ledger-div-star">✦</span>
                  <span className="ledger-div-line"></span>
                </div>
              </div>
              <div className="ledger-climax-btn-row">
                <button
                  type="button"
                  className="ledger-btn-replay"
                  onClick={handleReplaySequence}
                >
                  [ REPLAY CONSECRATION ]
                </button>
                <button
                  type="button"
                  className="ledger-btn-continue"
                  onClick={handleContinueNextStage}
                >
                  <span>CONTINUE TO NEXT STAGE</span>
                  <span className="ledger-btn-arrow">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DIRECT STATE CONTROLLER HUD BAR */}
      <div className="ledger-hud-bar" onClick={(e) => e.stopPropagation()}>
        <div className="ledger-hud-left">
          <span className="ledger-hud-label">DIRECT STATE CONTROLLER</span>
          <span className="ledger-hud-val">
            {candleState === 5
              ? 'STATE 5: CANDLES IGNITED'
              : candleState === 6
              ? 'STATE 6: COUNTDOWN IN PROGRESS'
              : candleState === 7
              ? 'STATE 7: CANDLES EXTINGUISHED'
              : candleState === 8
              ? 'STATE 8: REFLECTION STREAM'
              : 'STATE 9: COMMENDATION & TESTAMENT'}
          </span>
        </div>

        <div className="ledger-hud-matrix">
          <button
            type="button"
            className="ledger-state-pill"
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
            className="ledger-state-pill"
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
            className="ledger-state-pill active"
            onClick={handleReplaySequence}
            title="State 3: Midnight Ledger"
          >
            3
          </button>
          <button
            type="button"
            className="ledger-state-pill"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateStage(4);
            }}
            title="Page 4: Final Consecration & Closure"
          >
            4
          </button>
        </div>

        <div
          className="ledger-synth-badge"
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
          <span className="ledger-pulse-dot" />
          <span>SYNTH AUDIO: {isAmbiencePlaying ? 'ACTIVE' : 'INACTIVE'}</span>
        </div>
      </div>

      {/* FIXED FOOTER SEQUENCE BAR */}
      <footer className="ledger-footer-bar" onClick={(e) => e.stopPropagation()}>
        <div className="ledger-footer-inner">
          <div className="ledger-footer-seq">
            <span className="ledger-seq-label">Sequence</span>
            <span className="ledger-seq-counts">03 / 04</span>
          </div>

          <div className="ledger-footer-steps">
            <div className="ledger-step-item">
              <span>I. Conclave Entry</span>
            </div>
            <span className="ledger-step-dot">•</span>
            <div className="ledger-step-item">
              <span>II. Occurrences Tray</span>
            </div>
            <span className="ledger-step-dot">•</span>
            <div className="ledger-step-item active">
              <span>III. Midnight Ledger</span>
            </div>
            <span className="ledger-step-dot">•</span>
            <div className="ledger-step-item">
              <span>IV. Sealed Docket</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MidnightLedgerPage;
