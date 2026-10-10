import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Drawer.css';
import { isDiscovered, markDiscovered } from '../../utils/discoveryTracker';
import { toggleAmbienceDrone, isAmbienceActive, playArtifactChime } from '../../utils/archiveAudio';
import MidnightLedgerPage from './MidnightLedgerPage';
import FinalConsecrationPage from './FinalConsecrationPage';

// Web Audio synthesizer for physical tactile feedback
function playTactileSound(type: 'keyInsert' | 'unlockClunk' | 'glideOpen' | 'lockShut') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'keyInsert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'unlockClunk') {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.exponentialRampToValueAtTime(55, now + 0.35);
      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(320, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(90, now + 0.25);
      gain2.gain.setValueAtTime(0.12, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.3);
    } else if (type === 'glideOpen') {
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.4);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.42);
    } else if (type === 'lockShut') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    }
  } catch {
    // Audio fallback
  }
}

const Drawer: React.FC = () => {
  // Access control state: Master key is acquired from sealed chest (Forbidden page)
  const isKeyAcquired = isDiscovered('forbidden');

  // Single source of truth React state for stages and animation states
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('stage') || params.get('state');
    if (s === '4') return 4;
    if (s === '3') return 3;
    if (s === '2') return 2;
    if (s === '1') return 1;
    return isDiscovered('drawer') ? 2 : 1;
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(() => isDiscovered('drawer'));
  const [isKeyRotating, setIsKeyRotating] = useState<boolean>(() => isDiscovered('drawer'));
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState<boolean>(() => isAmbienceActive());
  const [keyNotice, setKeyNotice] = useState<string | null>(null);

  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionGuardRef = useRef<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const infoSectionRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
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
    if (stage === 2 || stage === 3 || stage === 4) {
      markDiscovered('drawer');
    }
  }, [stage]);

  useEffect(() => {
    return () => {
      clearTimers();
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
      card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(${translateZ}px) scale(1.025)`;
      card.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 85px rgba(0, 0, 0, 0.95), 0 0 35px rgba(250, 224, 165, ${glowOpacity.toFixed(2)})`;
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const card = cardRef.current;
    if (!card) return;

    card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.transform = '';
    card.style.boxShadow = '';
  };

  const handleToggleAmbience = () => {
    const active = toggleAmbienceDrone((playing) => {
      setIsAmbiencePlaying(playing);
    });
    setIsAmbiencePlaying(active);
  };

  const completeStageTransition = (targetStage: 1 | 2 | 3 | 4) => {
    transitionGuardRef.current = false;
    clearTimers();

    if (targetStage === 2 || targetStage === 3 || targetStage === 4) {
      markDiscovered('drawer');
      setStage(targetStage);
      setIsDrawerOpen(true);
      setIsKeyRotating(true);
    } else {
      setStage(1);
      setIsDrawerOpen(false);
      setIsKeyRotating(false);
    }
    setIsAnimating(false);
  };

  const handleToggleUnlock = (targetUnlocked?: boolean) => {
    const nextUnlocked = targetUnlocked !== undefined ? targetUnlocked : (stage === 1);

    if (!isKeyAcquired) {
      setKeyNotice('Master Drawer key not acquired yet. Acquire the master key from the sealed chest on the Restricted Record (/forbidden) page first.');
      playArtifactChime(220);
      setTimeout(() => {
        infoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    if (isAnimating) return;
    if (nextUnlocked && (stage === 2 || stage === 3)) return;
    if (!nextUnlocked && stage === 1) return;

    setKeyNotice(null);
    setIsAnimating(true);
    transitionGuardRef.current = false;
    clearTimers();

    if (nextUnlocked) {
      // Step A — Key insertion & rotation animation (500ms)
      setIsKeyRotating(true);
      playTactileSound('keyInsert');

      unlockTimerRef.current = setTimeout(() => {
        // Step B — Bolt disengages (500ms mark)
        playTactileSound('unlockClunk');

        unlockTimerRef.current = setTimeout(() => {
          // Step C — Physical drawer opening slide begins (600ms mark)
          playTactileSound('glideOpen');
          setIsDrawerOpen(true); // Applies .unlocked class to faceplate (1000ms CSS slide)

          // Fallback timer (1250ms after slide starts) to ensure stage completion
          unlockTimerRef.current = setTimeout(() => {
            completeStageTransition(2);
          }, 1250);
        }, 100);
      }, 500);

    } else {
      // Step A & B — Relocking Sequence back to Stage 1
      playTactileSound('glideOpen');
      setIsDrawerOpen(false); // Applies .locked class, sliding drawer back up

      unlockTimerRef.current = setTimeout(() => {
        playTactileSound('lockShut');
        completeStageTransition(1);
      }, 1000);
    }
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === 'transform' && e.target === e.currentTarget && isAnimating) {
      if (isDrawerOpen && stage === 1) {
        // Step D — Transition to Page 2 state when physical exit animation finishes
        completeStageTransition(2);
      } else if (!isDrawerOpen && (stage === 2 || stage === 3)) {
        completeStageTransition(1);
      }
    }
  };

  const handleAdvanceToStage3 = () => {
    setKeyNotice(null);
    clearTimers();
    playArtifactChime(523.25);
    setStage(3);
    setIsDrawerOpen(true);
    setIsKeyRotating(true);
  };

  // Direct HUD matrix jump — no animation guard or key check needed for stage-control navigation
  const jumpToStage = (targetStage: 1 | 2 | 3 | 4) => {
    if (targetStage !== 1 && !isKeyAcquired) {
      setKeyNotice('Master Drawer key not acquired yet. Acquire the master key from the sealed chest on the Restricted Record (/forbidden) page first.');
      playArtifactChime(220);
      setTimeout(() => {
        infoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setKeyNotice(null);
    clearTimers();
    transitionGuardRef.current = false;
    setIsAnimating(false);
    if (targetStage === 1) {
      setStage(1);
      setIsDrawerOpen(false);
      setIsKeyRotating(false);
    } else {
      markDiscovered('drawer');
      setStage(targetStage);
      setIsDrawerOpen(true);
      setIsKeyRotating(true);
    }
    if (targetStage !== 1) playArtifactChime(523.25);
  };

  // If Stage III is active, render the dedicated standalone MidnightLedgerPage component
  if (stage === 3) {
    return (
      <MidnightLedgerPage
        onNavigateStage={completeStageTransition}
        isAmbiencePlaying={isAmbiencePlaying}
        onToggleAmbience={handleToggleAmbience}
      />
    );
  }

  // If Stage IV is active, render the dedicated standalone FinalConsecrationPage component
  if (stage === 4) {
    return (
      <FinalConsecrationPage
        onNavigateStage={completeStageTransition}
        isAmbiencePlaying={isAmbiencePlaying}
        onToggleAmbience={handleToggleAmbience}
      />
    );
  }

  return (
    <div className="drawer-page-container">
      {/* Background Ambient Vignette & Candle Light Layers */}
      <div className="drawer-ambient-vignette" />
      <div className="drawer-glow-layer">
        <div className="drawer-glow-center" />
        <div className="drawer-glow-left" />
        <div className="drawer-glow-right" />
      </div>

      {/* FIXED HEADER NAVIGATION */}
      <header className="drawer-header">
        <div className="drawer-header-inner">
          <div className="drawer-header-left">
            <div className="drawer-header-badge">
              <span className="drawer-pulse-dot" />
              <span className="drawer-header-title">NLUJA ASSAM // FILE NO. 06</span>
            </div>
            <span className="drawer-header-loc drawer-hide-mobile">LOC: GUWAHATI LAT 26.1445° N</span>
          </div>

          <nav className="drawer-header-nav">
            <Link to="/case" className="drawer-nav-link">Dossier Index</Link>
            <Link to="/drawer" className="drawer-nav-link active">Sanctum Desk</Link>

            <Link to="/letter" className="drawer-nav-link">Sealed Letters</Link>
          </nav>

          <div className="drawer-header-right">
            <button
              type="button"
              className="drawer-ambience-pill"
              onClick={handleToggleAmbience}
              title="Toggle Ambience Audio"
            >
              <span className="material-symbols-outlined text-[16px] text-[#b4c9df]">
                {isAmbiencePlaying ? 'volume_up' : 'volume_off'}
              </span>
              <span className="drawer-ambience-text">
                AMBIENCE: {isAmbiencePlaying ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </button>

            <Link to="/case" className="drawer-esc-btn" title="Return to Sanctum Desk">
              ESC
            </Link>

            <div className="drawer-user-badge" title="Archival Officer">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT STAGE */}
      <main className="drawer-main-content">
        <div className="drawer-content-inner">

          {/* Archival Identification Docket Header */}
          <div className="drawer-docket-bar">
            <div className="drawer-docket-left">
              <span className="drawer-gold-dot" />
              <span className="drawer-docket-label">NLUJA ARCHIVAL ACCESS // MASTER DESK SANCTUM</span>
            </div>
            <span className="drawer-docket-tag">#06 // CONFIDENTIAL</span>
          </div>

          {/* Master Inscription Hierarchy */}
          <div className="drawer-heading-group">
            <div className="drawer-sub-category">
              <span className="drawer-gold-rule" />
              <span className="drawer-sub-title">SUB-VAULT COMPARTMENT</span>
              <span className="drawer-gold-rule" />
            </div>
            <h1 className="drawer-hero-title">
              {stage === 2 ? 'Occurrences Tray' : 'The Master Drawer'}
            </h1>
            <p className="drawer-hero-subtitle">
              {stage === 2
                ? 'Sanctum interior disengaged. Recovered keepsake specimen #06 unveiled.'
                : 'An antique mahogany sanctum preserved under academic seal.'}
            </p>
          </div>

          {/* MAIN STAGE: Tactile Mahogany Desk Joinery Centerpiece */}
          <div className="drawer-perspective-stage" id="deskHousing">
            <div className="drawer-housing-trench">
              <div className="drawer-woodgrain-light" />
              <div className="drawer-woodgrain-glare" />

              {/* Upper Recessed Rail Indicator */}
              <div className="drawer-recessed-rail">
                <div className="drawer-rail-spec">
                  <span className="material-symbols-outlined text-[14px] text-[#fae0a5]">straighten</span>
                  <span>SPEC. SPECIMEN DRAWER NO. VII</span>
                </div>
                <div className="drawer-rail-dots">
                  <span className="drawer-rail-dot" />
                  <span className="drawer-rail-dot" />
                  <span className="drawer-rail-dot" />
                </div>
              </div>

              {/* INNER DRAWER CAVITY */}
              <div className="drawer-inner-sanctum" id="interiorSanctumCavity">
                <div className="drawer-velvet-glow" />

                <div className="drawer-sanctum-header">
                  <div className="drawer-velvet-badge">
                    <span className="drawer-velvet-dot" />
                    <span className="drawer-velvet-title">Sanctum Interior // Crimson Velvet Lining</span>
                  </div>
                  <span className="drawer-specimen-code">VAULT SPECIMEN #06-RECOVERED</span>
                </div>

                {/* STAGE 2: RECOVERED KEEPSAKE CARD */}
                {stage === 2 && (
                  <>
                    <div className="drawer-stage2-env">
                      <div className="drawer-env-glow" />
                      <div className="drawer-env-grid-horiz" />
                      <div className="drawer-env-grid-vert" />
                      <div className="drawer-env-circle-outer" />
                      <div className="drawer-env-circle-inner" />
                      <div className="drawer-env-diamond top" />
                      <div className="drawer-env-diamond bottom" />
                      <div className="drawer-env-diamond left" />
                      <div className="drawer-env-diamond right" />

                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={`dust-${i}`} className={`drawer-env-dust dust-${i % 3}`} style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 10}s`,
                          animationDuration: `${15 + Math.random() * 15}s`
                        }} />
                      ))}

                      <div className="drawer-env-vignette" />
                    </div>
                    <div
                      className="drawer-stage2-card visible"
                      ref={cardRef}
                      onPointerMove={handlePointerMove}
                      onPointerLeave={handlePointerLeave}
                    >
                      <div className="drawer-card-corner-tl" />
                      <div className="drawer-card-corner-tr" />
                      <div className="drawer-card-corner-bl" />
                      <div className="drawer-card-corner-br" />

                      <div className="drawer-stage2-top-bar">
                        <span className="drawer-stage2-seal-tag">• RECOVERED KEEPSAKE // SEAL 06</span>
                        <span className="material-symbols-outlined drawer-stage2-lock-icon">lock</span>
                      </div>

                      <span className="drawer-stage2-category">TESTAMENT REGISTER</span>
                      <h3 className="drawer-stage2-title">FOR KHUSHI</h3>
                      <div className="drawer-stage2-divider" />
                      <p className="drawer-stage2-quote">
                        “A midnight testament preserved in deep affection.”
                      </p>

                      <div className="drawer-stage2-status-row">
                        <span className="drawer-consecrated-pill">CONSECRATED</span>
                        <span
                          className="material-symbols-outlined drawer-stage2-arrow"
                          onClick={handleAdvanceToStage3}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handleAdvanceToStage3();
                          }}
                          title="Advance to Stage 03"
                        >
                          arrow_forward
                        </span>
                      </div>

                      <button
                        type="button"
                        className="drawer-stage2-cta-btn"
                        onClick={handleAdvanceToStage3}
                      >
                        <span>✦ CLICK TO ADVANCE DIRECTLY TO STAGE 03</span>
                      </button>
                    </div>
                  </>
                )}

                <div className="drawer-sanctum-footer">
                  <span>RUNNER GLIDES: OILED EBONY SLIDES</span>
                  <span className="drawer-sanctum-disengaged">
                    <span className="drawer-pulse-dot" />
                    MECHANISM DISENGAGED
                  </span>
                </div>
              </div>

              {/* PHYSICAL DRAWER FACE (Sliding Wooden Front Panel) */}
              <div
                className={`drawer-slide-transition drawer-faceplate ${isDrawerOpen ? 'unlocked' : 'locked'}`}
                id="drawerFace"
                onClick={() => handleToggleUnlock()}
                onTransitionEnd={handleTransitionEnd}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleToggleUnlock();
                  }
                }}
              >
                <div className="drawer-beveled-overlay" />

                <div className="drawer-escutcheon-group">
                  <div className={`drawer-escutcheon-plate ${(isKeyRotating || isDrawerOpen) ? 'bright' : ''}`}>
                    <div className="drawer-escutcheon-top-rim" />
                    <div className="drawer-engraving">
                      <span className="drawer-engraving-text">NLUJA-06</span>
                      <span className="drawer-engraving-line" />
                    </div>

                    {/* Sculpted Keyhole Cylinder */}
                    <div className="drawer-keyhole-basin">
                      {(isKeyRotating || isDrawerOpen) && <div className="drawer-keyhole-glow" />}
                      <div className={`drawer-keyhole-slot ${(isKeyRotating || isDrawerOpen) ? 'rotated' : ''}`}>
                        <div className="drawer-keyhole-circle" />
                        <div className="drawer-keyhole-stem" />
                        {(isKeyRotating || isDrawerOpen) && (
                          <div className="drawer-key-glimmer">
                            <div className="drawer-glimmer-dot" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cast Brass Drop Handle */}
                    <div className="drawer-handle-wrap">
                      <div className="drawer-handle-bosses">
                        <div className="drawer-boss-left" />
                        <div className="drawer-boss-right" />
                        <div className={`drawer-bail-handle ${isDrawerOpen ? 'swung' : ''}`} />
                      </div>
                    </div>
                  </div>

                  <div className="drawer-escutcheon-shadow" />
                </div>

                {/* Lock Status Badge Pill */}
                <div className="drawer-status-pill-wrap">
                  <div className={`drawer-status-pill ${stage === 2 ? 'unlocked' : 'locked'}`}>
                    <span className="material-symbols-outlined drawer-status-icon">
                      {stage === 2 ? 'lock_open' : 'lock'}
                    </span>
                    <span className="drawer-status-text">
                      {stage === 2 ? 'STATUS: UNLOCKED // BOLT DISENGAGED' : 'STATUS: LOCKED // CIPHER ENGAGED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MASTER BRASS KEY ARTIFACT BUTTON */}
            <div className={`drawer-key-widget-anchor ${isDrawerOpen ? 'exited' : ''}`}>
              <button
                type="button"
                className={`drawer-master-key-btn ${isAnimating ? 'animating' : ''}`}
                onClick={() => handleToggleUnlock()}
                disabled={isAnimating}
              >
                <div className="drawer-key-badge">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                  </svg>
                </div>
                <div className="drawer-key-btn-content">
                  <span className="drawer-key-label-top">BRASS MASTER CIPHER</span>
                  <span className="drawer-key-label-action">
                    <span>
                      {!isKeyAcquired
                        ? 'KEY REQUIRED — SEALED CHEST'
                        : isAnimating
                          ? (isDrawerOpen ? 'RESTORING LOCK BOLT...' : 'DISENGAGING LOCK BOLT...')
                          : stage === 2
                            ? 'RESTORE LOCK BOLT'
                            : 'UNLOCK SANCTUM DRAWER'}
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      {stage === 2 ? 'replay' : 'arrow_forward'}
                    </span>
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* SUPPORTING INFORMATION SECTION */}
          <div className="drawer-info-section" ref={infoSectionRef}>
            <div className="drawer-procedure-card">
              <div className="drawer-procedure-header">
                <span className="material-symbols-outlined text-[#b4c9df] text-[18px]">lock_clock</span>
                <span className="drawer-procedure-title">UNLOCKING PROCEDURE</span>
              </div>
              <p className="drawer-procedure-body">
                Acquire the master drawer key from the locked chest and then unlock the sanctum compartment ahead to inspect the sealed charter!
              </p>

              {keyNotice && (
                <div className="flex flex-col gap-4 mt-2 w-full">
                  <div className="drawer-key-warning-notice !mt-0">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>{keyNotice}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-2">
                    <Link to="/case" className="w-full sm:w-auto py-3 px-6 rounded-lg border border-[#4a5568]/50 hover:border-[#dfc27d]/70 bg-[#0d111a]/85 hover:bg-[#131926] text-[#e2e8f0] hover:text-[#fce7a9] font-serif text-[11px] sm:text-xs tracking-[0.2em] font-medium transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.4)] text-center uppercase no-underline">
                      Return to Archive
                    </Link>
                    <Link to="/forbidden" className="w-full sm:w-auto py-3 px-6 rounded-lg bg-gradient-to-br from-[#e5c17d] via-[#dfba76] to-[#d8ae64] hover:brightness-105 text-[#15120d] font-serif text-[11px] sm:text-xs font-bold tracking-[0.2em] transition-all duration-300 shadow-[0_0_15px_rgba(223,194,125,0.25)] hover:shadow-[0_0_20px_rgba(223,194,125,0.4)] border border-[#edd89f]/40 text-center uppercase no-underline">
                      Inspect Locked Chest →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DIRECT STATE CONTROLLER HUD */}
          <div className="drawer-hud-controller">
            <div className="drawer-hud-status">
              <span className="drawer-hud-label">DIRECT STATE CONTROLLER</span>
              <div className="drawer-hud-value-wrap">
                <span className={`drawer-hud-value ${stage === 2 ? 'unlocked' : 'locked'}`}>
                  {stage === 2 ? 'STATE 2: CIPHER DISENGAGED // KEEPSAKE UNVEILED' : 'STATE 1: DRAWER LOCKED'}
                </span>
                <span className="drawer-pulse-dot" />
              </div>
            </div>

            {/* State Selection Matrix */}
            <div className="drawer-state-matrix">
              <button
                type="button"
                className={`drawer-state-pill-btn ${stage === 1 ? 'active-locked' : 'inactive'}`}
                onClick={() => jumpToStage(1)}
                aria-current={stage === 1 ? 'page' : undefined}
                title="Page 1: The Master Drawer"
              >
                1
              </button>
              <button
                type="button"
                className={`drawer-state-pill-btn ${stage === 2 ? 'active-unlocked' : 'inactive'}`}
                onClick={() => jumpToStage(2)}
                aria-current={stage === 2 ? 'page' : undefined}
                title="Page 2: Occurrences Tray"
              >
                2
              </button>
              <button
                type="button"
                className="drawer-state-pill-btn inactive"
                onClick={() => jumpToStage(3)}
                title="Page 3: Midnight Ledger"
              >
                3
              </button>
              <button
                type="button"
                className="drawer-state-pill-btn inactive"
                onClick={() => jumpToStage(4)}
                title="Page 4: Final Consecration & Closure"
              >
                4
              </button>
            </div>

            {/* Synth Audio Indicator Pill */}
            <div
              className="drawer-synth-audio-badge"
              onClick={handleToggleAmbience}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleToggleAmbience();
              }}
              title="Toggle Synthesizer / Ambience Audio"
            >
              <span className="material-symbols-outlined text-[16px] text-[#b4c9df]">graphic_eq</span>
              <span className="drawer-ambience-text">
                SYNTH AUDIO: {isAmbiencePlaying ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* FIXED FOOTER SEQUENCE BAR */}
      <footer className="drawer-footer-bar">
        <div className="drawer-footer-inner">
          <div className="drawer-footer-sequence-tag">
            <span className="drawer-sequence-label">Sequence</span>
            <div className="drawer-sequence-counts">
              <span className="drawer-count-current">{stage === 2 ? '02' : '01'}</span>
              <span className="drawer-count-slash">/</span>
              <span className="drawer-count-total">04</span>
            </div>
          </div>

          <div className="drawer-footer-steps">
            <div className={`drawer-step-item ${stage === 1 ? 'active' : 'inactive'}`}>
              <span className="drawer-step-num">I.</span>
              <span className="drawer-step-name">Conclave Entry</span>
            </div>
            <span className="drawer-step-divider drawer-hide-mobile">•</span>
            <div className={`drawer-step-item ${stage === 2 ? 'active' : 'inactive'}`}>
              <span className="drawer-step-num">II.</span>
              <span className="drawer-step-name">Occurrences Tray</span>
            </div>
            <span className="drawer-step-divider drawer-hide-mobile">•</span>
            <div className="drawer-step-item inactive drawer-hide-mobile">
              <span className="drawer-step-num">III.</span>
              <span className="drawer-step-name">Midnight Ledger</span>
            </div>
            <span className="drawer-step-divider drawer-hide-mobile">•</span>
            <div className="drawer-step-item inactive drawer-hide-mobile">
              <span className="drawer-step-num">IV.</span>
              <span className="drawer-step-name">Sealed Docket</span>
            </div>
          </div>

          <div className="drawer-footer-empty" />
        </div>
      </footer>
    </div>
  );
};

export default Drawer;

