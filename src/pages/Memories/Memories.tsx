import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Memories.css';
import { playArtifactChime } from '../../utils/archiveAudio';
import { markDiscovered } from '../../utils/discoveryTracker';
import frameOfYouImg from '../../assets/images/memories/file-02/a-frame-of-you.webp';
import beautifulPauseImg from '../../assets/images/memories/file-02/a-beautiful-pause.webp';

interface MemoryCardData {
  id: string;
  title: string;
  date: string;
  caption: string;
  supportingText: string;
  baseRot: number;
  image: string;
  objectPosition?: string;
}

const MEMORY_CARDS: MemoryCardData[] = [
  {
    id: 'card-1',
    title: 'A Frame of You',
    date: 'FEB 2024',
    caption: 'Most Beautifull Soul Of The Day',
    supportingText: "I DIDN'T GET THE CHANCE TO COMPLIMENT YOU THAT DAY BUT YOU WERE FABULOUS THAT DAY.",
    baseRot: -2.5,
    image: frameOfYouImg,
    objectPosition: 'center 25%',
  },
  {
    id: 'card-2',
    title: 'A Beautiful Pause',
    date: 'FEB 2023',
    caption: 'Time moved on. The memory stayed.',
    supportingText: 'WE ALL WERE SO HAPPY AT THIS MOVEMENT .',
    baseRot: 2,
    image: beautifulPauseImg,
    objectPosition: 'center 10%',
  },
];

const Memories: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const card1Ref = useRef<HTMLElement>(null);
  const card2Ref = useRef<HTMLElement>(null);

  const [selectedCard, setSelectedCard] = useState<MemoryCardData | null>(null);

  useEffect(() => {
    markDiscovered('memories');
  }, []);

  // Handle ESC key to close photo detail modal
  useEffect(() => {
    if (!selectedCard) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCard]);

  // Card Hover Effect
  useEffect(() => {
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isFinePointer || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent, card: HTMLElement, baseRot: number) => {
      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const cardX = rect.left + rect.width / 2;
        const cardY = rect.top + rect.height / 2;
        const offsetX = (e.clientX - cardX) / (rect.width / 2);
        const offsetY = (e.clientY - cardY) / (rect.height / 2);

        // Subtle tilt: max ~1.9 degrees on X and Y axes
        const tiltX = Math.max(-1.9, Math.min(1.9, -offsetY * 1.8));
        const tiltY = Math.max(-1.9, Math.min(1.9, offsetX * 1.8));

        card.style.transition = 'transform 100ms ease-out, box-shadow 400ms cubic-bezier(0.2, 0.8, 0.25, 1)';
        card.style.transform = `perspective(1000px) translate3d(0, -6px, 0) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotateZ(${baseRot}deg)`;
      });
    };

    const handleMouseLeave = (card: HTMLElement, baseRot: number) => {
      card.style.transition = 'transform 400ms cubic-bezier(0.2, 0.8, 0.25, 1), box-shadow 400ms cubic-bezier(0.2, 0.8, 0.25, 1)';
      card.style.transform = `perspective(1000px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(${baseRot}deg)`;
    };

    const initCard = (card: HTMLElement | null, baseRot: number) => {
      if (!card) return;
      const onMove = (e: MouseEvent) => handleMouseMove(e, card, baseRot);
      const onLeave = () => handleMouseLeave(card, baseRot);
      
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      return () => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      };
    };

    const cleanup1 = initCard(card1Ref.current, -2.5);
    const cleanup2 = initCard(card2Ref.current, 2);

    return () => {
      cleanup1?.();
      cleanup2?.();
    };
  }, [selectedCard]);

  // Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const particles: any[] = [];
    let animId: number;
    let tick = 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles.length = 0;

      // Layer 1 (Distant dust): 50 tiny golden motes (0.8px - 1.5px)
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.8 + Math.random() * 0.7,
          vx: (Math.random() - 0.48) * 0.22,
          vy: -(0.08 + Math.random() * 0.18),
          baseAlpha: 0.22 + Math.random() * 0.35,
          pulseSpeed: 0.012 + Math.random() * 0.02,
          pulseOffset: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.015,
          layer: 'dust'
        });
      }

      // Layer 2 (Mid-ground golden embers): 35 glowing antique gold particles (2px - 3.5px)
      for (let i = 0; i < 35; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 2.0 + Math.random() * 1.5,
          vx: (Math.random() - 0.48) * 0.32,
          vy: -(0.14 + Math.random() * 0.28),
          baseAlpha: 0.42 + Math.random() * 0.38,
          pulseSpeed: 0.018 + Math.random() * 0.028,
          pulseOffset: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.015 + Math.random() * 0.02,
          layer: 'ember'
        });
      }

      // Layer 3 (Defocused foreground bokeh): 10 larger out-of-focus golden orbs (12px - 28px)
      for (let i = 0; i < 10; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 12 + Math.random() * 16,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -(0.05 + Math.random() * 0.12),
          baseAlpha: 0.09 + Math.random() * 0.11,
          pulseSpeed: 0.006 + Math.random() * 0.012,
          pulseOffset: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.007 + Math.random() * 0.01,
          layer: 'bokeh'
        });
      }
    }

    function drawParticle(p: any, time: number) {
      if (!ctx) return;
      const alphaPulse = Math.sin(time * p.pulseSpeed + p.pulseOffset);
      const currentAlpha = Math.max(0.04, Math.min(0.95, p.baseAlpha + alphaPulse * 0.22));

      ctx.save();

      if (p.layer === 'bokeh') {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(245, 195, 110, ${currentAlpha * 1.1})`);
        gradient.addColorStop(0.5, `rgba(220, 160, 75, ${currentAlpha * 0.75})`);
        gradient.addColorStop(0.85, `rgba(180, 115, 45, ${currentAlpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(160, 95, 30, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.layer === 'ember') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(245, 190, 85, ${Math.min(1, currentAlpha * 1.3)})`;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 1.8);
        grad.addColorStop(0, `rgba(255, 240, 200, ${Math.min(1, currentAlpha * 1.2)})`);
        grad.addColorStop(0.35, `rgba(240, 185, 85, ${currentAlpha})`);
        grad.addColorStop(1, 'rgba(215, 140, 45, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.shadowBlur = 4;
        ctx.shadowColor = `rgba(235, 185, 95, ${currentAlpha * 0.7})`;
        ctx.fillStyle = `rgba(240, 200, 130, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    function renderStatic() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        drawParticle(particles[i], 0);
      }
    }

    function animate() {
      tick++;
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const drift = Math.sin(tick * p.wobbleSpeed + p.pulseOffset) * 0.18;
        p.x += p.vx + drift;
        p.y += p.vy;

        const buffer = p.radius + 30;
        if (p.y < -buffer) {
          p.y = height + buffer;
          p.x = Math.random() * width;
        } else if (p.y > height + buffer) {
          p.y = -buffer;
        }

        if (p.x < -buffer) {
          p.x = width + buffer;
        } else if (p.x > width + buffer) {
          p.x = -buffer;
        }

        drawParticle(p, tick);
      }

      animId = requestAnimationFrame(animate);
    }

    resize();
    initParticles();

    if (prefersReducedMotion.matches) {
      renderStatic();
    } else {
      animate();
    }

    const handleResize = () => {
      resize();
      initParticles();
      if (prefersReducedMotion.matches) {
        renderStatic();
      }
    };
    window.addEventListener('resize', handleResize);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        if (animId) cancelAnimationFrame(animId);
        renderStatic();
      } else {
        animate();
      }
    };
    prefersReducedMotion.addEventListener('change', handleMotionChange);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      prefersReducedMotion.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const handleReturn = () => {
    playArtifactChime(392);
  };

  const handleNext = () => {
    playArtifactChime(440);
  };

  const handleOpenDetail = (card: MemoryCardData) => {
    playArtifactChime(523);
    setSelectedCard(card);
  };

  const handleCloseDetail = () => {
    playArtifactChime(392);
    setSelectedCard(null);
  };

  return (
    <div className="memories-page-root text-stone-200 selection:bg-amber-900/40 selection:text-amber-100">
      <div aria-hidden="true" className="cinematic-glow"></div>
      <div aria-hidden="true" className="cinematic-bloom"></div>
      
      <canvas 
        ref={canvasRef} 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none z-[1] w-full h-full" 
      />

      <main className="w-full flex-grow flex flex-col items-center justify-center px-4 py-8 md:py-12 relative z-10">
        <header className="text-center max-w-2xl mx-auto mb-8 md:mb-12 select-none" data-purpose="header">
          <p className="font-kicker text-[11px] md:text-[12.5px] uppercase tracking-[0.24em] text-[#b6976f] mb-3 md:mb-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            RECOVERED DOSSIER // FILE-02
          </p>
          <h1 className="font-cormorant italic text-4xl sm:text-5xl md:text-[64px] font-normal tracking-wide text-[#f5ebd7] leading-none mb-3 md:mb-4 drop-shadow-[0_4px_18px_rgba(235,210,165,0.18)]">
            Memory Archive
          </h1>
          <p className="font-cormorant italic text-base md:text-[19px] text-[#cfbe9f]/90 tracking-wide font-normal">
            A collection of recovered moments, preserved in time.
          </p>
        </header>

        <section aria-label="Archived Memories Gallery" className="polaroid-perspective-wrapper flex flex-col sm:flex-row items-center justify-center gap-7 md:gap-10 lg:gap-12 w-full max-w-5xl my-auto" data-purpose="polaroid-gallery">
          {MEMORY_CARDS.map((card, idx) => {
            const cardRef = idx === 0 ? card1Ref : card2Ref;
            const rotClass = idx === 0 ? 'polaroid-card-left' : 'polaroid-card-right';
            
            return (
              <article 
                key={card.id}
                ref={cardRef}
                onClick={() => handleOpenDetail(card)}
                className={`polaroid-frame ${rotClass} w-[295px] sm:w-[310px] md:w-[335px] pt-4 px-4 pb-6 rounded-[2px] cursor-pointer`}
                data-purpose="polaroid-card"
              >
                <div className="overflow-hidden rounded-[1px] border border-black/40">
                  <div className="film-surface film-bezel aspect-[1.18/1] w-full overflow-hidden relative">
                    <img 
                      src={card.image}
                      alt={card.title}
                      style={{ objectPosition: card.objectPosition || 'center' }}
                      className="w-full h-full object-cover relative z-10"
                    />
                  </div>
                </div>
                <div className="mt-4 pt-1 px-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <h2 className="card-title-text font-classic-serif text-[18px] md:text-[19px] font-normal text-[#1d1916] tracking-tight">
                      {card.title}
                    </h2>
                    <span className="font-date text-[10.5px] font-medium tracking-wider text-[#7d7367] uppercase">
                      {card.date}
                    </span>
                  </div>
                  <p className="card-caption-text font-cormorant italic text-[20px] md:text-[22px] leading-relaxed text-[#2b2520] font-normal my-1">
                    {card.caption}
                  </p>
                  <p className="font-space-grotesk text-[9.5px] tracking-[0.14em] text-[#8e8578] uppercase mt-2">
                    {card.supportingText}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <nav aria-label="Archive Navigation" className="mt-10 md:mt-12 mb-2" data-purpose="navigation-control">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-xl mx-auto px-4">
            <Link 
              to="/case"
              onClick={handleReturn}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-[3px] border border-[#6b5536]/80 bg-[#14110d]/70 text-[#dfcfb4] hover:text-[#faedd6] hover:border-[#b89562] hover:bg-[#1f1912]/90 hover:shadow-[0_0_15px_rgba(184,149,98,0.2)] transition-all duration-300 text-sm md:text-[14.5px] font-serif tracking-wide focus:outline-none focus:ring-1 focus:ring-[#c8a670]"
            >
              <span aria-hidden="true" className="text-base text-[#cfbe9f]">←</span>
              <span>Return to Archive</span>
            </Link>
            <Link 
              to="/raven"
              onClick={handleNext}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-[3px] border border-[#b89562]/70 bg-gradient-to-r from-[#b89562] via-[#cfbe9f] to-[#a8824f] text-[#1d1916] hover:brightness-105 hover:border-[#d6a85e] hover:shadow-[0_0_18px_rgba(207,190,159,0.3)] transition-all duration-300 text-sm md:text-[14.5px] font-serif font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-[#f5ebd7] shadow-[0_2px_12px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <span>File No. 03</span>
              <span aria-hidden="true" className="text-base font-semibold">→</span>
            </Link>
          </div>
        </nav>
      </main>

      {/* Photo Detail View Modal Overlay */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040303]/95 backdrop-blur-sm select-none animate-fadeIn overflow-y-auto"
          data-purpose="dossier-card-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDetail();
            }
          }}
        >
          {/* Atmospheric Background for Detail View */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" data-purpose="ambient-lighting">
            <div className="central-glow"></div>
          </div>

          {/* Submerged Ghost Header */}
          <div className="fixed top-[4%] sm:top-[6%] left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 opacity-40 w-full max-w-xl flex flex-col items-center">
            <p className="font-date tracking-[0.32em] text-[10px] sm:text-[11px] text-[#aa8e52] font-semibold mb-2">
              RECOVERED DOSSIER // FILE-02
            </p>
            <div className="text-2xl sm:text-3xl text-[#b89e68]/20 tracking-wider blur-[2.5px] font-cormorant italic uppercase">
              Memory Archive
            </div>
          </div>

          {/* Main Content Container & Centered Ivory Photo Card */}
          <main className="relative z-20 w-full max-w-[564px] my-auto py-6 sm:py-8 flex items-center justify-center" data-purpose="dossier-card-container">
            <article 
              className="paper-texture card-magnetic-glide w-full max-w-[564px] h-auto rounded-[3px] pt-4 px-6 pb-8 sm:pt-4 sm:px-[29px] sm:pb-[34px] flex flex-col justify-between relative shadow-2xl overflow-hidden" 
              data-purpose="archival-photograph-card"
            >
              {/* Living breathing warmth across parchment */}
              <div className="absolute inset-0 paper-living-light bg-[radial-gradient(ellipse_75%_65%_at_50%_42%,rgba(247,235,212,0.45)_0%,rgba(215,190,145,0.18)_50%,transparent_80%)] pointer-events-none z-[1]"></div>
              
              {/* Close Button Top Right */}
              <header className="w-full flex justify-end items-center mb-3 relative z-10">
                <button 
                  aria-label="Close dossier view" 
                  onClick={handleCloseDetail}
                  className="w-[27px] h-[27px] rounded-full border border-[#3d3831]/60 flex items-center justify-center text-[#2c2720] hover:bg-[#3d3831]/10 transition-colors cursor-pointer" 
                  data-purpose="modal-close-trigger" 
                  type="button"
                >
                  <svg className="w-3.5 h-3.5 stroke-[1.4]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="18" x2="6" y1="6" y2="18"></line>
                    <line x1="6" x2="18" y1="6" y2="18"></line>
                  </svg>
                </button>
              </header>

              {/* Framed Photograph */}
              <section className="w-full flex flex-col items-center relative z-10" data-purpose="framed-photograph-wrapper">
                <div 
                  aria-label={`Archival photograph: ${selectedCard.title}`}
                  className="photo-frame-target w-full p-[6px] border border-[#a89063]/85 rounded-[1px] bg-transparent relative overflow-hidden cursor-default focus:outline-none" 
                  data-purpose="interactive-photo-frame"
                >
                  <div className="steady-settled-aura absolute inset-0 pointer-events-none border border-[#e8d2a0]/30 rounded-[1px]"></div>
                  
                  {/* Framed Archival Matte & Image Container */}
                  <div className="photo-matte w-full min-h-[260px] max-h-[60vh] sm:max-h-[460px] rounded-[1px] relative overflow-hidden flex items-center justify-center border border-black/40">
                    <img 
                      src={selectedCard.image}
                      alt={selectedCard.title}
                      className="max-w-full max-h-[60vh] sm:max-h-[460px] w-auto h-auto object-contain object-center relative z-[2] shadow-sm"
                    />
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#d5b682_0.5px,transparent_0.5px)] [background-size:12px_12px] mix-blend-overlay pointer-events-none z-[3]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none z-[3]"></div>
                    <div className="archival-glass-sheen"></div>
                    <div className="photo-inner-rim-sheen absolute inset-0 pointer-events-none z-[4]"></div>
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#d6bb89]/25 to-transparent pointer-events-none z-[4]"></div>
                  </div>

                  {/* Perimeter Memory Engraving Layer */}
                  <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden" data-purpose="memory-engraving-layer">
                    <svg className="w-full h-full absolute inset-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="engravingLuminousGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="#fff8e7" stopOpacity="1"></stop>
                          <stop offset="35%" stopColor="#f5dc9f" stopOpacity="0.9"></stop>
                          <stop offset="70%" stopColor="#d4af62" stopOpacity="0.55"></stop>
                          <stop offset="100%" stopColor="#9a7a3e" stopOpacity="0"></stop>
                        </linearGradient>
                      </defs>
                      <rect className="perimeter-trace-beam" fill="none" height="99.2" pathLength="400" rx="0.5" stroke="url(#engravingLuminousGradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" vectorEffect="non-scaling-stroke" width="99.2" x="0.4" y="0.4"></rect>
                    </svg>

                    {/* Corner Glints */}
                    <div className="corner-glint-tl absolute top-[1px] left-[1px] w-3 h-3 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[radial-gradient(circle,rgba(255,250,235,1)_0%,rgba(238,206,140,0.75)_35%,rgba(202,158,84,0.3)_60%,transparent_75%)] mix-blend-screen filter drop-shadow-[0_0_3px_rgba(255,240,195,0.9)]"></div>
                      <div className="absolute w-[9px] h-[0.75px] bg-gradient-to-r from-transparent via-[#fff5d6] to-transparent mix-blend-screen opacity-80"></div>
                      <div className="absolute h-[9px] w-[0.75px] bg-gradient-to-b from-transparent via-[#fff5d6] to-transparent mix-blend-screen opacity-80"></div>
                    </div>

                    <div className="corner-glint-tr absolute top-[1px] right-[1px] w-3 h-3 translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[radial-gradient(circle,rgba(255,250,235,1)_0%,rgba(238,206,140,0.75)_35%,rgba(202,158,84,0.3)_60%,transparent_75%)] mix-blend-screen filter drop-shadow-[0_0_3px_rgba(255,240,195,0.9)]"></div>
                      <div className="absolute w-[9px] h-[0.75px] bg-gradient-to-r from-transparent via-[#fff5d6] to-transparent mix-blend-screen opacity-80"></div>
                      <div className="absolute h-[9px] w-[0.75px] bg-gradient-to-b from-transparent via-[#fff5d6] to-transparent mix-blend-screen opacity-80"></div>
                    </div>

                    <div className="corner-glint-br absolute bottom-[1px] right-[1px] w-3 h-3 translate-x-1/2 translate-y-1/2 pointer-events-none flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[radial-gradient(circle,rgba(255,250,235,1)_0%,rgba(238,206,140,0.75)_35%,rgba(202,158,84,0.3)_60%,transparent_75%)] mix-blend-screen filter drop-shadow-[0_0_3px_rgba(255,240,195,0.9)]"></div>
                      <div className="absolute w-[9px] h-[0.75px] bg-gradient-to-r from-transparent via-[#fff5d6] to-transparent mix-blend-screen opacity-80"></div>
                      <div className="absolute h-[9px] w-[0.75px] bg-gradient-to-b from-transparent via-[#fff5d6] to-transparent mix-blend-screen opacity-80"></div>
                    </div>

                    <div className="corner-glint-bl absolute bottom-[1px] left-[1px] w-3 h-3 -translate-x-1/2 translate-y-1/2 pointer-events-none flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[radial-gradient(circle,rgba(255,250,235,1)_0%,rgba(238,206,140,0.75)_35%,rgba(202,158,84,0.3)_60%,transparent_75%)] mix-blend-screen filter drop-shadow-[0_0_3px_rgba(255,240,195,0.9)]"></div>
                      <div className="absolute w-[9px] h-[0.75px] bg-gradient-to-r from-transparent via-[#fff5d6] to-transparent mix-blend-screen opacity-80"></div>
                      <div className="absolute h-[9px] w-[0.75px] bg-gradient-to-b from-transparent via-[#fff5d6] to-transparent mix-blend-screen opacity-80"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Card Typography & Details */}
              <footer className="w-full mt-4 sm:mt-5 px-1 flex flex-col gap-1.5 relative z-10" data-purpose="card-captions">
                {/* Row 1: Title & Date */}
                <div className="w-full flex items-baseline justify-between">
                  <h1 className="text-xl sm:text-[22px] tracking-normal text-[#1e1a17] font-classic-serif font-normal leading-tight">
                    {selectedCard.title}
                  </h1>
                  <span className="text-[11px] sm:text-[11.5px] font-date tracking-[0.22em] text-[#5b5247] uppercase font-medium">
                    {selectedCard.date}
                  </span>
                </div>

                {/* Row 2: Script Caption */}
                <div className="mt-0.5">
                  <p className="font-alex-brush text-[22px] sm:text-[25px] text-[#221d18] tracking-wide leading-none font-normal">
                    {selectedCard.caption}
                  </p>
                </div>

                {/* Row 3: Supporting Details */}
                <div className="mt-2">
                  <p className="text-[9.5px] sm:text-[10px] font-space-grotesk tracking-[0.14em] text-[#6b6256] uppercase font-normal">
                    {selectedCard.supportingText}
                  </p>
                </div>
              </footer>
            </article>
          </main>
        </div>
      )}
    </div>
  );
};

export default Memories;
