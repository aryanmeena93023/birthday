import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Letter.css';
import { markDiscovered } from '../../utils/discoveryTracker';
import { playArtifactChime } from '../../utils/archiveAudio';

const Letter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const letterCardRef = useRef<HTMLElement>(null);
  const lightOverlayRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const [isAmbientActive, setIsAmbientActive] = useState(false);

  const [revealStep, setRevealStep] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const letterBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsReducedMotion(true);
      // Immediately show all lines if reduced motion is requested
      const host = letterBodyRef.current;
      if (host) {
        host.querySelectorAll('.letter-line-item').forEach((el) => {
          el.classList.add('is-visible');
        });
      }
      return;
    }

    const host = letterBodyRef.current;
    if (!host) return;

    let isCancelled = false;
    const lineElements = Array.from(host.querySelectorAll<HTMLElement>('.letter-line-item'));
    if (lineElements.length === 0) return;

    // Sequential top-to-bottom line reveal with 90ms stagger (within Phase 1 target: 80–100ms)
    // Starting after 320ms so parchment entrance smoothly settles
    let currentLine = 0;
    const totalLines = lineElements.length;

    const startTimer = setTimeout(() => {
      if (isCancelled) return;

      const staggerInterval = setInterval(() => {
        if (isCancelled) {
          clearInterval(staggerInterval);
          return;
        }

        if (currentLine < totalLines) {
          const el = lineElements[currentLine];
          if (el) {
            el.classList.add('is-visible');
          }
          currentLine++;
        } else {
          clearInterval(staggerInterval);
        }
      }, 90); // 90ms delay between consecutive lines (approx 80–100ms target)

      return () => clearInterval(staggerInterval);
    }, 320);

    // Guaranteed failsafe: all lines become visible by 4.2s
    const failsafeTimer = setTimeout(() => {
      lineElements.forEach((el) => el.classList.add('is-visible'));
    }, 4200);

    return () => {
      isCancelled = true;
      clearTimeout(startTimer);
      clearTimeout(failsafeTimer);
    };
  }, []);

  useEffect(() => {
    markDiscovered('letter');
    window.scrollTo(0, 0);

    // Particles logic
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width: number, height: number;
    const particles: DustMote[] = [];
    const PARTICLE_COUNT = 38;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class DustMote {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speedX: number = 0;
      speedY: number = 0;
      baseAlpha: number = 0;
      alpha: number = 0;
      pulseSpeed: number = 0;
      pulseAngle: number = 0;

      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 10;
        this.size = Math.random() * 1.8 + 0.6;
        this.speedY = -(Math.random() * 0.35 + 0.12);
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.baseAlpha = Math.random() * 0.45 + 0.15;
        this.alpha = this.baseAlpha;
        this.pulseSpeed = Math.random() * 0.02 + 0.008;
        this.pulseAngle = Math.random() * Math.PI * 2;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.pulseAngle += this.pulseSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.pulseAngle) * 0.12;

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset(false);
        }
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(224, 182, 118, ${Math.max(0, this.alpha)})`;
        ctx!.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new DustMote());
    }

    const animate = () => {
      ctx!.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!letterCardRef.current || !lightOverlayRef.current) return;
    const rect = letterCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lightOverlayRef.current.style.setProperty('--mouse-x', `${x}px`);
    lightOverlayRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseLeave = () => {
    if (!lightOverlayRef.current) return;
    lightOverlayRef.current.style.setProperty('--mouse-x', '50%');
    lightOverlayRef.current.style.setProperty('--mouse-y', '50%');
  };

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playWaxSealFeedback = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  };

  const toggleAmbientAudio = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!isAmbientActive) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(68, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      ambientOscillatorRef.current = osc;
      ambientGainRef.current = gain;
      setIsAmbientActive(true);
    } else {
      if (ambientGainRef.current && ambientOscillatorRef.current) {
        ambientGainRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        const osc = ambientOscillatorRef.current;
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch(e) {}
        }, 850);
      }
      setIsAmbientActive(false);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (ambientOscillatorRef.current) {
        try {
          ambientOscillatorRef.current.stop();
          ambientOscillatorRef.current.disconnect();
        } catch(e) {}
      }
    };
  }, []);

  const handleReturnClick = () => {
    playArtifactChime(392);
  };

  const handleNextClick = () => {
    playArtifactChime(440);
  };

  return (
    <div className="letter-scene text-archive-ink selection:bg-[#722026] selection:text-[#f8ebd7]">
      {/* Ambient Visual Atmospheres */}
      <div aria-hidden="true" className="ambient-glow" />
      <div aria-hidden="true" className="ambient-torch-flicker" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[2] opacity-65"
        id="ambient-particles-canvas"
      />

      {/* Main Archival Dossier Shell */}
      <main className="relative z-10 w-full flex-grow flex flex-col items-center justify-center px-3 sm:px-6 py-8 sm:py-14">
        {/* Top Secret Archive Header Meta */}
        <header className="w-full max-w-2xl flex items-center justify-between pb-3 sm:pb-4 px-2 select-none opacity-80">
          <div className="flex items-center space-x-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-700/80 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="font-display text-[10px] md:text-xs tracking-[0.28em] text-[#ab947a] uppercase">
              DECRYPTED REPOSITORY ARCHIVE // NLUJA RECORD
            </span>
          </div>
          <div className="font-mono text-[9px] md:text-[11px] tracking-wider text-[#79634e]">
            INDEX REF: 01-KHUSHI
          </div>
        </header>

        {/* The Antique Letter Parchment */}
        <article
          ref={letterCardRef}
          className="parchment-sheet animate-parchment-reveal w-full max-w-2xl p-4 sm:p-6 md:p-10 relative transition-all duration-300"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Interactive Mouse Light Follower */}
          <div
            ref={lightOverlayRef}
            aria-hidden="true"
            className="mouse-light-overlay"
            style={{ '--mouse-x': '50%', '--mouse-y': '50%' } as React.CSSProperties}
          />

          {/* Inset Double Border Frame */}
          <div className="archive-inner-frame relative w-full h-full p-4 sm:p-6 md:p-8 z-[4]">
            {/* Archival Sub-Header Bar with Red Dot & Attached Note Tag */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#a88d67]/35 relative">
              <div className="flex items-center space-x-3 sm:space-x-3.5 pr-2 pt-1 sm:pt-0">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7a1c22] shadow-[0_0_6px_rgba(122,28,34,0.7)] flex-shrink-0" />
                <h1 className="font-serif tracking-[0.25em] md:tracking-[0.28em] text-xs sm:text-sm font-semibold uppercase text-[#4d3629]">
                  CONFIDENTIAL ARCHIVE RECORD // FILE 01
                </h1>
              </div>

              {/* Slanted Note Tag & 3D Wax Seal */}
              <div className="relative flex items-center self-end sm:self-auto -mt-2 sm:-mt-5 -mr-1 sm:-mr-4">
                <div
                  className="note-tag px-3 py-1.5 sm:px-4 sm:py-2 pr-6 sm:pr-8 text-center cursor-default z-10 select-none shadow-sm transition-transform duration-200 hover:-rotate-2"
                  title="Dedication tag"
                >
                  <span 
                    className="font-script text-2xl sm:text-3xl text-[#2a1d17] leading-[1.1] block tracking-wide"
                    style={{ fontFamily: '"Great Vibes", "Alex Brush", cursive', paddingRight: '0.2rem' }}
                  >
                    For <br /> Khushi !!
                  </span>
                </div>

                <div
                  className="wax-seal -ml-4 sm:-ml-5 z-20"
                  role="button"
                  tabIndex={0}
                  title="Official Archival Seal of Khushi"
                  onClick={(e) => {
                    playWaxSealFeedback();
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'scale(0.95)';
                    setTimeout(() => (el.style.transform = ''), 150);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      playWaxSealFeedback();
                    }
                  }}
                >
                  <div className="wax-seal-inner">
                    <span className="wax-monogram">K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Letter Content Body */}
            <div ref={letterBodyRef} className="pt-8 sm:pt-10 md:pt-12 text-[#221612] max-w-2xl">
              <div className="mb-7 sm:mb-9 letter-line-item">
                <h2
                  className="font-script text-4xl sm:text-5xl md:text-[54px] font-normal tracking-wide text-[#1c120c] leading-tight select-none"
                  style={{
                    fontFamily: '"Great Vibes", "Alex Brush", cursive',
                    fontSize: '3rem',
                    letterSpacing: '0.03em',
                    color: 'rgb(30, 19, 13)',
                    textShadow: 'rgba(0, 0, 0, 0.08) 0px 1px 1px',
                  }}
                >
                  Dear Khushi,
                </h2>
              </div>

              <div
                className="space-y-4 sm:space-y-5 font-serif text-[17px] sm:text-[19px] md:text-[20.5px] leading-[1.8] sm:leading-[1.9] text-[#2c1d17] font-[450]"
                style={{
                  fontFamily: '"Cormorant Garamond", Garamond, Georgia, serif',
                  fontSize: '1.15rem',
                  lineHeight: 1.85,
                  letterSpacing: '0.015em',
                  fontStyle: 'italic',
                  color: 'rgb(42, 27, 20)',
                }}
              >
                <div className="letter-line-item">
                  <p>First of all,</p>
                </div>
                <div className="letter-line-item pl-8 sm:pl-16">
                  <p>Happy Birthday!</p>
                </div>

                <div className="letter-line-item">
                  <p>
                    I hope this year brings you lots of happiness, new opportunities, good experiences, and plenty of reasons to smile.
                  </p>
                </div>
                <div className="letter-line-item">
                  <p>
                    May your hard work pay off, your plans work out the way you hope, and you get to achieve the things you've been looking forward to.
                  </p>
                </div>
                <div className="letter-line-item">
                  <p>
                    I hope you meet good people, learn new things, try things you've always wanted to try, and make the most of all the little moments along the way.
                  </p>
                </div>

                <div className="letter-line-item">
                  <p>
                    I hope this year brings you more good days than bad ones, more laughter than stress, and lots of things to look forward to.
                  </p>
                </div>
                <div className="letter-line-item">
                  <p>
                    Most importantly, I hope you stay happy, healthy, and keep finding your own reasons to smile.
                  </p>
                </div>
                <div className="letter-line-item">
                  <p>
                    And of course, I hope you have a really lovely birthday!
                  </p>
                </div>

                <div className="pt-2 sm:pt-3 letter-line-item">
                  <p>
                    I also made this little project as a birthday surprise for you.
                  </p>
                </div>
                <div className="letter-line-item">
                  <p>
                    I wanted to do something a little different instead of just sending a birthday message, so I thought, why not make something of my own for the occasion?
                  </p>
                </div>
                <div className="letter-line-item">
                  <p>
                    It's a small way of wishing you on your birthday, but one that I wanted to make a little more personal than the usual birthday wishes.
                  </p>
                </div>

                <div className="letter-line-item">
                  <p>
                    I hope you enjoy going through it and have fun exploring it.
                  </p>
                </div>
                <div className="letter-line-item">
                  <p>
                    And don't judge it too harshly, okay? 😂 I'm still learning a few things along the way!
                  </p>
                </div>

                <div className="letter-line-item">
                  <p>
                    Anyway, that's enough from me. I won't turn your birthday wish into a whole essay.
                  </p>
                </div>

                <div className="letter-line-item">
                  <p>
                    Have a wonderful day, enjoy yourself, and may the year ahead bring you lots of happiness, success, and reasons to look back and say, <em>"That was a good year."</em>
                  </p>
                </div>

                <div className="pt-2 letter-line-item">
                  <span
                    style={{
                      fontFamily: 'Cinzel, "Cormorant Garamond", serif',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      letterSpacing: '0.24em',
                      color: 'rgb(90, 46, 34)',
                      display: 'inline-block',
                      textTransform: 'uppercase',
                    }}
                  >
                    HAPPY BIRTHDAY ,"3<span className="inline-block relative underline decoration-amber-700 decoration-2 underline-offset-4 font-bold" style={{textDecoration: 'underline 2px', textUnderlineOffset: '4px', fontStyle: 'italic', color: 'rgb(110, 38, 29)'}}>0</span>00"
                  </span>
                </div>

                <div className="pt-4 pb-2 flex flex-col items-end text-right select-none pr-2 sm:pr-6 letter-line-item">
                  <span
                    className="font-serif italic text-xl sm:text-2xl text-[#3c2a1e] tracking-wide leading-tight"
                    style={{
                      fontFamily: '"Cormorant Garamond", Garamond, Georgia, serif',
                      fontStyle: 'italic',
                      color: 'rgb(60, 42, 30)',
                    }}
                  >
                    With love,
                  </span>
                  <span
                    className="font-script text-3xl sm:text-4xl md:text-[48px] text-[#221612] leading-none pt-1 sm:pt-2 -mr-1"
                    style={{
                      fontFamily: '"Great Vibes", "Alex Brush", cursive',
                      color: 'rgb(34, 22, 18)',
                      textShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 1px',
                    }}
                  >
                    Aryan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Dossier Navigation */}
        <nav
          aria-label="Archive dossier navigation"
          className="w-full max-w-2xl mt-8 mb-2 flex flex-col sm:flex-row items-center justify-center gap-4 z-10 px-2"
        >
          <Link
            to="/case"
            onClick={handleReturnClick}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded border border-[#a88d67]/35 bg-[#120d0b]/80 hover:bg-[#1f1510] text-[#d6c5af] hover:text-[#f3e9db] font-display text-[11px] sm:text-xs tracking-[0.22em] uppercase transition-all duration-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#a88d67]"
          >
            <span>←</span>
            <span>RETURN TO ARCHIVE</span>
          </Link>
          <Link
            to="/memories"
            onClick={handleNextClick}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded border border-[#b89562]/80 bg-gradient-to-r from-[#b89562] via-[#cfbe9f] to-[#a8824f] text-[#1c140d] hover:brightness-105 hover:border-[#d6a85e] hover:shadow-[0_0_18px_rgba(207,190,159,0.35)] font-display text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-[#f5ebd7] cursor-pointer"
          >
            <span>MOVE TO FILE 02</span>
            <span>→</span>
          </Link>
        </nav>
      </main>

      {/* Archival Footer Controls & Audio Atmosphere */}
      <footer
        className="relative z-10 w-full max-w-3xl py-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left select-none text-[#735e4b]"
      >
        <div className="flex items-center space-x-2">
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-[#8a7258] opacity-75"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          <p className="font-display text-[10px] sm:text-xs tracking-[0.22em] uppercase">
            SENTINEL ARCHIVE • CONFIDENTIAL CLASSIFICATION • FILE 01
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <button
            aria-label="Toggle ambient ambience"
            title="Toggle ambient candle whisper"
            className="font-serif italic text-xs text-[#9d8368] hover:text-[#c4a98a] transition-colors duration-200 flex items-center space-x-1.5 focus:outline-none"
            onClick={toggleAmbientAudio}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                isAmbientActive ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-[#7a1c22]'
              }`}
            />
            <span>{isAmbientActive ? 'Whisper Active' : 'Ambient Whisper'}</span>
          </button>
          <span className="text-[#3c3026]">•</span>
          <span className="font-display text-[10px] sm:text-xs tracking-[0.18em] text-[#9d8368] hover:text-[#d3b697] cursor-pointer transition-colors duration-200">
            PERMANENT MEMORY VAULT
          </span>
        </div>
      </footer>

      {revealStep < 9 && !isReducedMotion && (
        <button
          onClick={() => setRevealStep(10)}
          className="fixed bottom-6 right-6 z-50 text-[10px] font-display tracking-[0.2em] text-[#a88d67] hover:text-[#d3b697] transition-colors bg-[#120d0b]/80 px-4 py-2 rounded border border-[#a88d67]/30 shadow-lg focus:outline-none"
        >
          SKIP REVEAL
        </button>
      )}
    </div>
  );
};

export default Letter;
