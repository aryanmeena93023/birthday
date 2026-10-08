import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Drawer.css';
import { playArtifactChime, playUnlockChime } from '../../utils/archiveAudio';
import { markDiscovered, isDiscovered } from '../../utils/discoveryTracker';
import { drawerBirthday } from '../../content/drawerBirthday';

// WebAudio Synthesizer for pure JS sound cues
function playSynth(type: 'click' | 'glide' | 'chime' | 'whoosh' | 'blow') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'glide') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(55, now + 0.95);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.95);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.95);
    } else if (type === 'chime') {
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);
        gain.gain.setValueAtTime(0.12, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 2.0);
      });
    } else if (type === 'whoosh') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.28);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'blow') {
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, now);
      filter.frequency.linearRampToValueAtTime(180, now + 0.55);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(now);
    }
  } catch {
    // Suppress audio errors
  }
}

const Drawer: React.FC = () => {
  // Key requirement check from centralized archive discovery state (forbidden cipher box contains/unlocks key)
  const isKeyAcquired = isDiscovered('forbidden');

  // Single Source of Truth Stage State (Resets on refresh, survives route navigation)
  // Stage 1: Locked, Stage 2: Unlocking/Opening, Stage 3: Keepsake Revealed, Stage 4+: Birthday Experience
  const [currentState, setCurrentState] = useState<number>(() => (isDiscovered('drawer') ? 3 : 1));
  const [isTurning, setIsTurning] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [lineVisible, setLineVisible] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (currentState >= 3) {
      markDiscovered('drawer');
    }
  }, [currentState]);

  // Dust Motes Animation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const motes: Array<{ x: number; y: number; radius: number; alpha: number; dx: number; dy: number }> = [];
    for (let i = 0; i < 50; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.5 + 0.2,
        dx: (Math.random() - 0.5) * 0.3,
        dy: -Math.random() * 0.4 - 0.1
      });
    }

    let animId: number;
    const animateMotes = () => {
      ctx.clearRect(0, 0, width, height);
      motes.forEach((m) => {
        m.x += m.dx;
        m.y += m.dy;
        if (m.y < 0) {
          m.y = height;
          m.x = Math.random() * width;
        }
        if (m.x < 0) m.x = width;
        if (m.x > width) m.x = 0;

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(221, 196, 139, ${m.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animateMotes);
    };
    animateMotes();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const clearAllTimers = useCallback(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (textTimerRef.current) clearInterval(textTimerRef.current);
  }, []);

  const changeState = useCallback(
    (targetState: number) => {
      if (!isKeyAcquired && targetState !== 1) {
        return;
      }
      clearAllTimers();
      setCurrentState(targetState);

      if (soundEnabled) {
        if (targetState === 2) playSynth('click');
        else if (targetState === 4 || targetState === 8 || targetState === 9) playSynth('chime');
        else if (targetState === 5) playSynth('whoosh');
        else if (targetState === 7) playSynth('blow');
      }

      // STATE 6: Countdown Execution
      if (targetState === 6) {
        setCountdownValue(3);
        if (soundEnabled) playSynth('click');
        let count = 3;
        countdownTimerRef.current = setInterval(() => {
          count -= 1;
          if (count > 0) {
            setCountdownValue(count);
            if (soundEnabled) playSynth('click');
          } else {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            changeState(7);
          }
        }, 1000);
      }

      // STATE 7: Auto-advance after candle extinction
      if (targetState === 7) {
        setTimeout(() => {
          changeState(8);
        }, 1900);
      }

      // STATE 8: Floating Text Stream
      if (targetState === 8) {
        setCurrentLineIndex(0);
        setLineVisible(true);
        let idx = 0;
        textTimerRef.current = setInterval(() => {
          idx += 1;
          if (idx < drawerBirthday.lines.length) {
            setLineVisible(false);
            setTimeout(() => {
              setCurrentLineIndex(idx);
              setLineVisible(true);
              if (soundEnabled) playSynth('chime');
            }, 400);
          } else {
            if (textTimerRef.current) clearInterval(textTimerRef.current);
            setTimeout(() => {
              changeState(9);
            }, 1500);
          }
        }, 2500);
      }
    },
    [clearAllTimers, soundEnabled]
  );

  const handleTurnKey = () => {
    if (isTurning || currentState !== 1 || !isKeyAcquired) return;

    setIsTurning(true);
    playArtifactChime(369.99);

    // Phase 1: Key turns 90deg cleanly inside keyhole (0ms - 800ms) while drawer stays stationary in state 1
    setTimeout(() => {
      playUnlockChime();
    }, 800);

    // Phase 2: Lock released (950ms), drawer front face begins smooth downward slide in state 2
    setTimeout(() => {
      changeState(2);
    }, 950);

    // Phase 3: Drawer slide complete (1850ms), transition to state 3 (keepsake revealed)
    setTimeout(() => {
      setIsTurning(false);
      markDiscovered('drawer');
      changeState(3);
    }, 1850);
  };

  const handleKeepsakeClick = () => {
    if (currentState !== 3) return;
    changeState(4);
    setTimeout(() => {
      changeState(5);
    }, 1300);
  };

  const handleBlowCandles = () => {
    changeState(6);
  };

  const handleReplay = () => {
    changeState(1);
  };

  const handleReturn = () => {
    playArtifactChime(392);
  };

  const stateLabels: { [key: number]: string } = {
    1: 'STATE 1: DRAWER LOCKED',
    2: 'STATE 2: KEY UNLOCK & DRAWER OPENS',
    3: 'STATE 3: BIRTHDAY KEEPSAKE REVEALED',
    4: 'STATE 4: CINEMATIC TRANSITION & CAKE REVEAL',
    5: 'STATE 5: CANDLES IGNITED',
    6: 'STATE 6: THE CINEMATIC COUNTDOWN',
    7: 'STATE 7: CANDLES EXTINGUISHED',
    8: 'STATE 8: FLOATING MEMORY TEXT',
    9: 'STATE 9: FINAL HAPPY BIRTHDAY CLIMAX',
    10: 'STATE 10: END OF EXPERIENCE'
  };

  return (
    <main className="drawer-master-scene">
      {/* Dynamic Dust Motes Canvas */}
      <canvas ref={canvasRef} className="motes-canvas-layer" />

      {/* Top Fixed Header Bar */}
      <header className="drawer-top-bar">
        <div className="top-bar-container">
          <div className="top-bar-left">
            <span className="top-bar-beacon-ping" />
            <span className="top-bar-text">NLUJA Assam // Dept. of Unusual Occurrences</span>
          </div>
          <div className="top-bar-right">
            <button
              type="button"
              className="sound-toggle-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <span>{soundEnabled ? 'AMBIENCE: ACTIVE' : 'AMBIENCE: MUTED'}</span>
            </button>
            <Link to="/case" onClick={handleReturn} className="esc-link">
              <span>ESC</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="drawer-main-content">
        {!isKeyAcquired ? (
          /* LOCKED ACCESS GATE UI (When Desk Drawer Key has not been claimed from forbidden chest) */
          <div className="drawer-experience-stage">
            <div className="drawer-hint-header">
              <p className="drawer-sector-tag">RESTRICTED VAULT // SECTOR IV</p>
              <h1 className="drawer-main-title">The Master Study Drawer</h1>
              <p className="drawer-main-sub">An antique mahogany sanctum preserved under academic seal.</p>
            </div>

            <div className="mahogany-desk-frame">
              <div className="beveled-[#2c1d13] top-moulding-strip" />

              <div className="drawer-housing-cavity">
                {/* Physical Front Drawer Face in Locked Sealed State */}
                <div className="drawer-front-face">
                  <div className="wood-panel-recess" />

                  <div className="escutcheon-plate-wrapper">
                    <div className="brass-escutcheon-plate">
                      <span className="escutcheon-code">NLUJA-06</span>
                      <div className="keyhole-container">
                        <div className="keyhole-black-slot" />
                      </div>
                      <div className="drop-bail-ring-handle">
                        <div className="drop-bail-inner" />
                      </div>
                    </div>

                    <div className="drawer-status-chip drawer-locked-warning">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                      </svg>
                      <span>STATUS: ACCESS RESTRICTED</span>
                    </div>
                  </div>

                  <div className="interactive-key-action-container">
                    <div className="drawer-locked-gate-card">
                      <div className="locked-gate-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                        </svg>
                      </div>
                      <span className="locked-gate-title">DESK DRAWER KEY REQUIRED</span>
                      <p className="locked-gate-desc">
                        Recover the key from the sealed chest before accessing this drawer.
                      </p>
                      <Link to="/case" onClick={handleReturn} className="btn-locked-return-archive">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                        <span>RETURN TO ARCHIVE</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="desk-joinery-footer">
                <span>JOINERY: MAHOGANY MORTISE #1984</span>
                <span>CHAMBER SECURITY: LEVEL III ARCHIVE</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Meta Header Ribbon (Visible only in Stage A) */}
            {currentState <= 3 && (
              <div className="drawer-meta-ribbon">
                <div className="meta-ribbon-left">
                  <span className="meta-dot" />
                  <span>NLUJA ARCHIVAL ACCESS // MASTER DESK SANCTUM</span>
                </div>
                <div className="meta-ribbon-right">
                  <span className="meta-loc">LOC: GUWAHATI LAT 26.1445° N</span>
                  <span className="meta-dossier">DOSSIER #06 // CONFIDENTIAL</span>
                </div>
              </div>
            )}

            {/* STAGE A: THE DESK DRAWER MODULE (States 1, 2, 3) */}
            {currentState <= 3 && (
              <div className="drawer-experience-stage">
                <div className="drawer-hint-header">
                  <p className="drawer-sector-tag">SUB-VAULT COMPARTMENT // SECTOR IV</p>
                  <h1 className="drawer-main-title">The Master Study Drawer</h1>
                  <p className="drawer-main-sub">An antique mahogany sanctum preserved under academic seal.</p>
                </div>

                <div className="mahogany-desk-frame">
                  <div className="beveled-[#2c1d13] top-moulding-strip" />

                  <div className="drawer-housing-cavity">
                    {/* Velvet Interior & Keepsake */}
                    <div className={`velvet-interior-cavity ${currentState >= 2 ? 'sliding-open' : ''}`}>
                      <div className="velvet-sheen" />

                      {/* State 3: Keepsake Artifact */}
                      <div className="keepsake-artifact-card" onClick={handleKeepsakeClick}>
                        <div className="artifact-card-glow" />
                        <div className="matchbox-container">
                          <div className="matchbox-header">
                            <span className="matchbox-tag">RECOVERED KEEPSAKE // SEAL 06</span>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                              <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z" />
                            </svg>
                          </div>
                          <div className="matchbox-body">
                            <span className="matchbox-register">TESTAMENT REGISTER</span>
                            <h3 className="matchbox-title">FOR KHUSHI</h3>
                            <div className="matchbox-line" />
                            <p className="matchbox-caption">"A midnight testament preserved in deep affection."</p>
                          </div>
                          <div className="matchbox-footer">
                            <div className="striker-bar" />
                            <span className="ceremony-prompt">OPEN CEREMONY →</span>
                          </div>
                        </div>

                        <div className="artifact-instruction-badge">
                          <span className="ping-dot" />
                          <span>CLICK ARTIFACT TO UNVEIL CELEBRATION</span>
                        </div>
                      </div>
                    </div>

                    {/* Physical Front Drawer Face */}
                    <div className={`drawer-front-face ${currentState >= 2 ? 'slid-down' : ''}`}>
                      <div className="wood-panel-recess" />

                      <div className="escutcheon-plate-wrapper">
                        <div className="brass-escutcheon-plate">
                          <span className="escutcheon-code">NLUJA-06</span>
                          <div className="keyhole-container">
                            <div className="keyhole-black-slot" />
                            <div className={`keyhole-glow-leak ${currentState >= 2 ? 'active' : ''}`} />
                          </div>
                          <div className="drop-bail-ring-handle">
                            <div className="drop-bail-inner" />
                          </div>
                        </div>

                        <div className="drawer-status-chip">
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                          </svg>
                          <span>
                            {currentState === 1
                              ? isKeyAcquired
                                ? 'STATUS: CIPHER LOCKED (KEY ACQUIRED)'
                                : 'STATUS: CIPHER LOCKED (KEY REQUIRED)'
                              : currentState === 2
                                ? 'STATUS: UNLOCKED & SLIDING'
                                : 'STATUS: RECOVERY ACCESSIBLE'}
                          </span>
                        </div>
                      </div>

                      {/* Turn Key Action Button */}
                      {currentState === 1 && (
                        <div className="interactive-key-action-container">
                          <button
                            type="button"
                            className="btn-use-key"
                            onClick={handleTurnKey}
                            disabled={isTurning || !isKeyAcquired}
                            title={!isKeyAcquired ? 'Master brass cipher key required from the Forbidden box' : undefined}
                          >
                            <div className={`key-icon-wrapper ${isTurning ? 'turning' : ''}`}>
                              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                              </svg>
                            </div>
                            <div className="key-btn-text">
                              <span className="key-tag">BRASS MASTER CIPHER</span>
                              <span className="key-label">
                                {!isKeyAcquired
                                  ? 'KEY REQUIRED'
                                  : isTurning
                                    ? 'TURNING SANCTUM KEY...'
                                    : 'TURN SANCTUM KEY'}
                              </span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="desk-joinery-footer">
                    <span>JOINERY: MAHOGANY MORTISE #1984</span>
                    <span>CHAMBER SECURITY: LEVEL III ARCHIVE</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE B: MIDNIGHT BIRTHDAY CHAMBER (States 4 to 10) */}
            {currentState >= 4 && (
              <div className="celebration-chamber-stage">
                <div className="cake-ambient-glow" />
                <div className="cake-spotlight-beam" />

                {/* Minimal Subtle Outer Flanking Metadata (Single line per side, far screen margins) */}
                {currentState <= 8 && (
                  <div className="cake-side-metadata-flanks">
                    <span className="cake-flank-left">NLUJA ARCHIVAL ACCESS</span>
                    <span className="cake-flank-right">MIDNIGHT CEREMONY</span>
                  </div>
                )}

                {/* Vintage Archival Birthday Cake */}
                {currentState <= 8 && (
                  <div className="cake-artifact-wrapper">
                    {/* 3 Slender Tapered Candles */}
                    <div className="candles-assembly">
                      {/* Candle 1 */}
                      <div className="candle-unit">
                        <div className="flame-container">
                          <div className={`flame-glow ${currentState >= 5 && currentState < 7 ? 'active' : ''}`} />
                          <div className={`flame-element ${currentState >= 5 && currentState < 7 ? 'flame-active' : 'extinguished'}`} />
                          <div className={`smoke-wisp ${currentState >= 7 ? 'active' : ''}`} />
                        </div>
                        <div className="candle-wick" />
                        <div className="candle-body candle-short" />
                      </div>

                      {/* Candle 2 (Center - Taller) */}
                      <div className="candle-unit">
                        <div className="flame-container">
                          <div className={`flame-glow ${currentState >= 5 && currentState < 7 ? 'active' : ''}`} />
                          <div className={`flame-element ${currentState >= 5 && currentState < 7 ? 'flame-active' : 'extinguished'}`} />
                          <div className={`smoke-wisp ${currentState >= 7 ? 'active' : ''}`} />
                        </div>
                        <div className="candle-wick" />
                        <div className="candle-body candle-tall" />
                      </div>

                      {/* Candle 3 */}
                      <div className="candle-unit">
                        <div className="flame-container">
                          <div className={`flame-glow ${currentState >= 5 && currentState < 7 ? 'active' : ''}`} />
                          <div className={`flame-element ${currentState >= 5 && currentState < 7 ? 'flame-active' : 'extinguished'}`} />
                          <div className={`smoke-wisp ${currentState >= 7 ? 'active' : ''}`} />
                        </div>
                        <div className="candle-wick" />
                        <div className="candle-body candle-short" />
                      </div>
                    </div>

                    {/* Tiered Cake */}
                    <div className="tiered-cake-structure">
                      {/* Top Tier */}
                      <div className="cake-top-tier">
                        <div className="tier-glaze-highlight" />
                        <div className="top-trim-gold" />
                        <span className="tier-stars-pattern">✦ ✦ ✦ ✦ ✦ ✦</span>
                        <div className="burgundy-trim-ribbon" />
                      </div>

                      {/* Bottom Tier */}
                      <div className="cake-bottom-tier">
                        <div className="tier-glaze-highlight" />
                        <div className="top-trim-gold" />
                        <div className="bottom-tier-decor">
                          <span>❦</span>
                          <span className="decor-star">✦</span>
                          <span>❦</span>
                          <span className="decor-star">✦</span>
                          <span>❦</span>
                        </div>
                        <div className="burgundy-trim-ribbon" />
                      </div>

                      {/* Silver Pedestal Stand */}
                      <div className="pedestal-top-plate" />
                      <div className="pedestal-base-stem" />
                      <div className="pedestal-shadow-blur" />
                    </div>

                    {/* State 5: Blowout Action Prompt */}
                    {currentState === 5 && (
                      <div className="blowout-action-container">
                        <button
                          type="button"
                          className="btn-blow-candles"
                          onClick={handleBlowCandles}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M14.5 17c0 1.65-1.35 3-3 3s-3-1.35-3-3h2c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1H3v-2h8.5c1.65 0 3 1.35 3 3zM19 6.5C19 4.57 17.43 3 15.5 3S12 4.57 12 6.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5H3v2h12.5c1.93 0 3.5-1.57 3.5-3.5zM18.5 11H3v2h15.5c.83 0 1.5.67 1.5 1.5S19.33 16 18.5 16s-1.5-.67-1.5-1.5h-2c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5z" />
                          </svg>
                          <span>MAKE A WISH & EXTINGUISH</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* State 6: Countdown Display */}
                {currentState === 6 && (
                  <div className="countdown-banner">
                    <span className="countdown-tag">CEREMONIAL MOMENT</span>
                    <div className="countdown-number">{countdownValue}</div>
                  </div>
                )}

                {/* State 8: Floating Memory Text Stream */}
                {currentState === 8 && (
                  <div className="floating-text-stage">
                    <p className={`memory-line-text ${lineVisible ? 'visible' : 'fade-up'}`}>
                      {drawerBirthday.lines[currentLineIndex]}
                    </p>
                    <div className="memory-line-divider" />
                    <span className="memory-stream-tag">ARCHIVAL RETRIEVAL // REFLECTION RECORD</span>
                  </div>
                )}

                {/* State 9 & 10: Final Happy Birthday Climax & Actions */}
                {currentState >= 9 && (
                  <div className="final-climax-card">
                    <div className="climax-wax-seal">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </div>

                    <span className="climax-sub-badge">{drawerBirthday.finalSub}</span>

                    <h1 className="climax-title">{drawerBirthday.finalTitle}</h1>

                    <div className="climax-divider" />

                    <p className="climax-personal-message">{drawerBirthday.personalMessage}</p>

                    <div className="climax-stamp-box">
                      <span className="stamp-main">{drawerBirthday.caseConclusion}</span>
                      <span className="stamp-sub">{drawerBirthday.archiveStatus}</span>
                    </div>

                    {/* State 10 Action Buttons */}
                    <div className="climax-actions-container">
                      <button type="button" className="btn-replay" onClick={handleReplay}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                        <span>REPLAY EXPERIENCE</span>
                      </button>

                      <Link to="/case" onClick={handleReturn} className="btn-return-archive">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                        <span>RETURN TO ARCHIVE</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* HUD State Stepper & Controller (Only rendered when isKeyAcquired is true) */}
      {isKeyAcquired && (
        <footer className="hud-state-controller">
          <div className="hud-container">
            <div className="hud-label-group">
              <span className="hud-tag font-bold">DIRECT STATE CONTROLLER</span>
              <span className="hud-current-state">{stateLabels[currentState]}</span>
            </div>

            <div className="hud-pills-row">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`state-pill ${currentState === num ? 'active' : ''}`}
                  onClick={() => changeState(num)}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="hud-audio-group">
              <button
                type="button"
                className="hud-audio-btn"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                <span>{soundEnabled ? 'SYNTH AUDIO: ACTIVE' : 'SYNTH AUDIO: MUTED'}</span>
              </button>
            </div>
          </div>
        </footer>
      )}
    </main>
  );
};

export default Drawer;
