import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Raven.css';
import { ravenMemories, type RavenMemory } from '../../content/ravenMemories';
import { playArtifactChime, playUnlockChime } from '../../utils/archiveAudio';
import { markDiscovered } from '../../utils/discoveryTracker';

// Audio Synthesizer helper for tactile chimes
function playVaultResonance(freq: number, type: OscillatorType = 'sine', duration = 1.0, gainVol = 0.08) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(gainVol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Suppress audio failures
  }
}

// Particle class for the enchanted pixie dust canvas system
class EnchantedParticle {
  originX: number;
  originY: number;
  mode: 'spiral' | 'rising-vortex' | 'burst';
  x: number;
  y: number;
  radius: number;
  isStar: boolean;
  angle: number;
  angularSpeed: number;
  spiralRadius: number;
  spiralExpansion: number;
  speedY: number;
  speedX: number;
  alpha: number;
  maxAlpha: number;
  fadeSpeed: number;
  twinklePhase: number;
  twinkleSpeed: number;
  life: number;
  maxLife: number;
  color: string;
  glowColor: string;

  constructor(originX: number, originY: number, mode: 'spiral' | 'rising-vortex' | 'burst' = 'spiral') {
    this.originX = originX;
    this.originY = originY;
    this.mode = mode;
    this.x = originX + (Math.random() - 0.5) * 50;
    this.y = originY + (Math.random() - 0.5) * 35;

    const sizeRoll = Math.random();
    if (sizeRoll < 0.55) {
      this.radius = Math.random() * 1.5 + 2.0;
    } else if (sizeRoll < 0.88) {
      this.radius = Math.random() * 2.2 + 3.8;
    } else {
      this.radius = Math.random() * 2.0 + 6.0;
    }

    this.isStar = Math.random() > 0.65;
    this.angle = Math.random() * Math.PI * 2;
    this.angularSpeed = (Math.random() * 0.08 + 0.04) * (Math.random() > 0.5 ? 1 : -1);
    this.spiralRadius = Math.random() * 24 + 12;
    this.spiralExpansion = Math.random() * 0.7 + 0.35;
    this.speedY = -(Math.random() * 2.2 + 1.2);
    this.speedX = (Math.random() - 0.5) * 2.4;
    this.alpha = 0.08;
    this.maxAlpha = Math.random() * 0.45 + 0.55;
    this.fadeSpeed = Math.random() * 0.009 + 0.006;
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.twinkleSpeed = Math.random() * 0.18 + 0.09;
    this.life = 0;
    this.maxLife = Math.random() * 110 + 95;

    const palette = [
      { rgb: '255, 238, 185', glow: 'rgba(255, 230, 150, 0.95)' },
      { rgb: '248, 214, 115', glow: 'rgba(240, 195, 75, 0.92)' },
      { rgb: '255, 250, 235', glow: 'rgba(255, 245, 210, 0.98)' },
      { rgb: '228, 178, 86', glow: 'rgba(215, 155, 50, 0.85)' },
      { rgb: '215, 235, 255', glow: 'rgba(180, 210, 250, 0.75)' }
    ];
    const selected = palette[Math.floor(Math.random() * palette.length)];
    this.color = selected.rgb;
    this.glowColor = selected.glow;
  }

  update() {
    this.life++;
    this.twinklePhase += this.twinkleSpeed;

    if (this.mode === 'spiral') {
      this.angle += this.angularSpeed;
      this.spiralRadius += this.spiralExpansion;
      this.x = this.originX + Math.cos(this.angle) * this.spiralRadius + Math.sin(this.life * 0.06) * 4;
      this.y += this.speedY;
    } else if (this.mode === 'rising-vortex') {
      this.angle += this.angularSpeed * 1.3;
      this.spiralRadius += this.spiralExpansion * 0.6;
      this.x = this.originX + Math.sin(this.angle) * this.spiralRadius + (Math.random() - 0.5) * 1.5;
      this.y += this.speedY * 1.25;
    } else {
      this.x += this.speedX + Math.sin(this.twinklePhase) * 1.2;
      this.y += this.speedY * 0.85;
    }

    if (this.life < 20) {
      this.alpha = Math.min(this.maxAlpha, this.alpha + 0.07);
    } else if (this.life > this.maxLife - 35) {
      this.alpha = Math.max(0, this.alpha - this.fadeSpeed * 1.6);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0.01) return;
    const twinkleMod = 0.8 + 0.25 * Math.sin(this.twinklePhase);
    const renderAlpha = Math.min(1.0, this.alpha * twinkleMod);

    ctx.save();
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = this.radius > 4.5 ? 18 : 10;
    ctx.fillStyle = `rgba(${this.color}, ${renderAlpha})`;

    if (this.isStar && this.radius > 3.2) {
      const r = this.radius * twinkleMod;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - r * 1.6);
      ctx.lineTo(this.x + r * 0.35, this.y - r * 0.35);
      ctx.lineTo(this.x + r * 1.6, this.y);
      ctx.lineTo(this.x + r * 0.35, this.y + r * 0.35);
      ctx.lineTo(this.x, this.y + r * 1.6);
      ctx.lineTo(this.x - r * 0.35, this.y + r * 0.35);
      ctx.lineTo(this.x - r * 1.6, this.y);
      ctx.lineTo(this.x - r * 0.35, this.y - r * 0.35);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${renderAlpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * twinkleMod, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, renderAlpha * 1.25)})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

const Raven: React.FC = () => {
  // Runtime State (Resets on refresh, survives route navigation)
  const [unlocked, setUnlocked] = useState<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false });
  const [activeManuscript, setActiveManuscript] = useState<RavenMemory | null>(null);
  const [activeMemoryIndex, setActiveMemoryIndex] = useState<number | null>(null);
  const [isUnsealing, setIsUnsealing] = useState<boolean>(false);
  const [unsealingId, setUnsealingId] = useState<number | null>(null);
  const [openedLids, setOpenedLids] = useState<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false });
  const [unlockedPadlocks, setUnlockedPadlocks] = useState<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false });
  const [dialogueText, setDialogueText] = useState<string>('"Touch a seal to unbind what is kept..."');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<EnchantedParticle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const padlockRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    markDiscovered('raven');
  }, []);

  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Particle animation loop
  const runParticleLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.life >= p.maxLife || p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animFrameIdRef.current = requestAnimationFrame(runParticleLoop);
    } else {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  }, []);

  const spawnEnchantedDust = useCallback((x: number, y: number, count = 45, mode: 'spiral' | 'rising-vortex' | 'burst' = 'spiral') => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(new EnchantedParticle(x, y, mode));
    }
    if (!animFrameIdRef.current) {
      runParticleLoop();
    }
  }, [runParticleLoop]);

  // Handle Box Unsealing Sequence
  const triggerUnsealingSequence = (index: number) => {
    if (isUnsealing) return;
    setIsUnsealing(true);
    setUnsealingId(index);

    const memoryId = index + 1; // 1, 2, 3
    const padlockEl = padlockRefs.current[memoryId];
    let lockX = window.innerWidth / 2;
    let lockY = window.innerHeight / 2;

    if (padlockEl) {
      const rect = padlockEl.getBoundingClientRect();
      lockX = rect.left + rect.width / 2;
      lockY = rect.top + rect.height / 2;
    }

    setDialogueText(`Archival seal for Memory ${memoryId} awakening...`);

    // 0.18s: Dust spirals near lock
    setTimeout(() => {
      spawnEnchantedDust(lockX, lockY, 40, 'spiral');
      playVaultResonance(349.23, 'sine', 0.9, 0.06);
    }, 180);

    // 0.45s: Vortex particles
    setTimeout(() => {
      spawnEnchantedDust(lockX, lockY - 10, 55, 'rising-vortex');
    }, 450);

    // 0.85s: Lock releases
    setTimeout(() => {
      setUnlockedPadlocks((prev) => ({ ...prev, [memoryId]: true }));
      spawnEnchantedDust(lockX, lockY - 5, 30, 'burst');
      playUnlockChime();
    }, 850);

    // 1.1s: Box opens
    setTimeout(() => {
      setOpenedLids((prev) => ({ ...prev, [memoryId]: true }));
      setUnlocked((prev) => ({ ...prev, [memoryId]: true }));

      spawnEnchantedDust(lockX, lockY - 30, 75, 'burst');
      spawnEnchantedDust(lockX, lockY - 20, 45, 'rising-vortex');
      playVaultResonance(523.25, 'triangle', 1.4, 0.08);
    }, 1100);

    // 1.5s: Reveal Manuscript Modal
    setTimeout(() => {
      setUnsealingId(null);
      setIsUnsealing(false);
      setActiveMemoryIndex(index);
      setActiveManuscript(ravenMemories[index]);
    }, 1500);
  };

  const handleBoxClick = (index: number) => {
    const memoryId = index + 1;
    if (!unlocked[memoryId]) {
      triggerUnsealingSequence(index);
    } else {
      playArtifactChime(523.25);
      setActiveMemoryIndex(index);
      setActiveManuscript(ravenMemories[index]);
    }
  };

  const handleCloseModal = () => {
    playArtifactChime(349.23);
    setActiveManuscript(null);
    setActiveMemoryIndex(null);
  };

  const handleNextStep = () => {
    if (activeMemoryIndex !== null && activeMemoryIndex < 2) {
      const nextIndex = activeMemoryIndex + 1;
      handleCloseModal();
      setTimeout(() => {
        if (!unlocked[nextIndex + 1]) {
          triggerUnsealingSequence(nextIndex);
        } else {
          setActiveMemoryIndex(nextIndex);
          setActiveManuscript(ravenMemories[nextIndex]);
        }
      }, 400);
    } else {
      handleCloseModal();
    }
  };

  // Keyboard shortcut: Escape closes manuscript modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeManuscript) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeManuscript]);

  const handleReturn = () => {
    playArtifactChime(392);
  };

  const unlockedCount = Object.values(unlocked).filter(Boolean).length;

  return (
    <main className="raven-scene">
      {/* Particle Canvas Overlay */}
      <canvas ref={canvasRef} className="enchanted-dust-canvas" />

      <article className="raven-container">
        {/* Header */}
        <header className="raven-header">
          <div className="raven-header-badge">
            <span className="raven-beacon-dot" />
            <span>SENTINEL RECORD // FILE 05</span>
          </div>
          <h1 className="raven-title">THE RAVEN</h1>
          <p className="raven-subtitle">
            Keeper of the moments that should not be forgotten.
          </p>
        </header>

        {/* Live Status Badge */}
        <div className="raven-status-badge">
          <span className="status-label">VAULT RECORD STATUS</span>
          <span className="status-value">
            {unlockedCount === 0
              ? '3 SEALED MEMORIES'
              : unlockedCount === 3
              ? 'ARCHIVE STATUS: COMPLETE (3 / 3 MEMORIES RECOVERED)'
              : `${unlockedCount} / 3 RECOVERED`}
          </span>
        </div>

        {/* Stationary Perched Raven Stage */}
        <div className="raven-perch-stage">
          <div className="raven-perch-wrapper">
            <img
              src="/media/archive/raven-idle (2).png"
              alt="The Raven Guardian perched quietly on archival stone corbel"
              className="raven-guardian-img"
              draggable={false}
            />
            <div className="raven-corbel-shadow" />
          </div>

          <div className="raven-dialogue-bubble">
            {unlockedCount === 3
              ? '"All memories are bound. The vault is at peace."'
              : dialogueText}
          </div>
        </div>

        {/* 3 Archival Keepsake Reliquaries */}
        <section className="reliquaries-grid" aria-label="Three Archival Keepsake Reliquaries">
          {ravenMemories.map((item, index) => {
            const memoryId = index + 1;
            const isUnlockedBox = unlocked[memoryId];
            const isBoxUnsealing = unsealingId === memoryId;
            const isLidOpened = openedLids[memoryId];
            const isPadlockUnlocked = unlockedPadlocks[memoryId];

            return (
              <article
                key={item.id}
                className={`reliquary-pedestal box-variant-${memoryId} ${
                  isBoxUnsealing ? 'reliquary-unsealing' : ''
                } ${isLidOpened ? 'reliquary-opened' : ''}`}
                onClick={() => handleBoxClick(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBoxClick(index);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Examine memory reliquary ${item.number}`}
              >
                <div className={`reliquary-halo ${isBoxUnsealing ? 'active' : ''}`} />

                <div className="reliquary-card-wrapper">
                  <div className="box-casket">
                    <div className="wood-grain" />

                    {/* Brass Corners */}
                    <div className="brass-corner brass-corner-tl" />
                    <div className="brass-corner brass-corner-tr" />
                    <div className="brass-corner brass-corner-bl" />
                    <div className="brass-corner brass-corner-br" />

                    {/* Casket Lid */}
                    <div className="casket-lid">
                      <div className="brass-plate">
                        <span className="plate-dot" />
                        <span className="plate-text">MEMORY {item.number}</span>
                        <span className="plate-dot" />
                      </div>
                      <div className="brass-inlay-line" />
                    </div>

                    {/* Velvet Interior */}
                    <div className="velvet-chamber">
                      <span className="velvet-text">
                        <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" clipRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                        </svg>
                        RECORD RECOVERED
                      </span>
                    </div>

                    {/* Clasp & Padlock */}
                    <div
                      ref={(el) => { padlockRefs.current[memoryId] = el; }}
                      className={`brass-clasp ${isPadlockUnlocked ? 'unlocked' : ''}`}
                    >
                      <div className="shackle-ring" />
                      <div className="lock-body">
                        <div className="keyhole" />
                      </div>
                    </div>

                    {/* Footer Seal Badge */}
                    <div className="reliquary-footer-seal">
                      <span className={`badge-text ${isUnlockedBox ? 'unlocked' : 'sealed'}`}>
                        {isUnlockedBox ? '[ RECOVERED ]' : '[ SEALED ]'}
                      </span>
                      <span className="examine-hint">Examine Reliquary →</span>
                    </div>
                  </div>

                  <div className="reliquary-shadow" />
                </div>

                <h2 className="reliquary-title">{item.title || `Memory ${item.number}`}</h2>
                <span className="reliquary-date">{item.date || 'CLASSIFIED'}</span>
              </article>
            );
          })}
        </section>

        {/* Vault Completion Banner */}
        {unlockedCount === 3 && (
          <div className="vault-completion-banner">
            <span className="completion-badge">ARCHIVE STATUS: COMPLETE</span>
            <h3 className="completion-title">ALL THREE RECORDS RECOVERED & BOUND</h3>
            <p className="completion-quote">
              "The raven will remember when the stones turn to dust."
            </p>
            <Link to="/case" onClick={handleReturn} className="completion-return-btn">
              ← RETURN TO MASTER ARCHIVE
            </Link>
          </div>
        )}

        {/* Return Button */}
        <div className="raven-return-container">
          <Link to="/case" onClick={handleReturn} className="raven-return-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            <span>RETURN TO ARCHIVE</span>
          </Link>
        </div>
      </article>

      {/* Recovered Manuscript Modal Overlay */}
      {activeManuscript && (
        <div
          className="manuscript-modal-backdrop"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="manuscript-title"
        >
          <div
            className="parchment-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="manuscript-close-btn"
              onClick={handleCloseModal}
              aria-label="Close manuscript modal"
            >
              ✕
            </button>

            <div className="manuscript-content-top">
              <div className="manuscript-header">
                <span className="manuscript-obs-num">
                  {activeManuscript.observation || `OBSERVATION ${activeManuscript.number} // FILE 05`}
                </span>
                <h2 id="manuscript-title" className="manuscript-title">
                  {activeManuscript.title}
                </h2>
                <div className="manuscript-date">{activeManuscript.date}</div>
              </div>

              {/* Author Attribution Prominently Placed Above Prose */}
              <div className="manuscript-author-box">
                <span className="author-label">RECORDED BY</span>
                <span className="author-name">
                  {activeManuscript.author || 'ARYAN MEENA'}
                </span>
              </div>

              {/* Personal Memory Prose */}
              <div className="manuscript-prose-container">
                <p className="manuscript-prose-text">
                  {activeManuscript.memory}
                </p>
                {activeManuscript.personalLine && (
                  <p className="manuscript-personal-line">
                    "{activeManuscript.personalLine}"
                  </p>
                )}
              </div>
            </div>

            {/* Document Footer & Wax Stamp Seal */}
            <div className="manuscript-footer">
              <div className="archival-seal-container">
                <div className="archival-seal">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 2.21.72 4.25 1.94 5.9L12 8l8.06 9.9c1.22-1.65 1.94-3.69 1.94-5.9 0-5.52-4.48-10-10-10zm-1 5a2 2 0 110 4 2 2 0 010-4zm-4.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                </div>
                <div className="seal-text-group">
                  <span className="seal-title">ARCHIVED BY THE RAVEN</span>
                  <span className="seal-sub">SENTINEL MONOGRAM // AUTHENTICATED</span>
                </div>
              </div>

              <div className="manuscript-actions">
                <button
                  type="button"
                  className="manuscript-action-close"
                  onClick={handleCloseModal}
                >
                  ← Close
                </button>
                <button
                  type="button"
                  className="manuscript-action-next"
                  onClick={handleNextStep}
                >
                  {activeMemoryIndex !== null && activeMemoryIndex < 2
                    ? 'UNLOCK NEXT MEMORY →'
                    : 'CONCLUDE ARCHIVE →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Raven;
