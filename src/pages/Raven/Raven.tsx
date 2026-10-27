import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import owlSentinelImg from '../../assets/images/owl-sentinel.png';
import './Raven.css';
import { markDiscovered, getOwlMemoryUnlockedState, setOwlMemoryUnlocked } from '../../utils/discoveryTracker';
import { playHedwigAmbience, stopHedwigAmbience } from '../../utils/archiveAudio';

const Raven: React.FC = () => {
  const initialUnlockedState = getOwlMemoryUnlockedState();
  const [unlocked1, setUnlocked1] = useState(initialUnlockedState.unlocked1);
  const [unlocked2, setUnlocked2] = useState(initialUnlockedState.unlocked2);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    markDiscovered('raven');
    const state = getOwlMemoryUnlockedState();
    setUnlocked1(state.unlocked1);
    setUnlocked2(state.unlocked2);

    return () => {
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const box1Ref = useRef<HTMLDivElement>(null);
  const box2Ref = useRef<HTMLDivElement>(null);
  const clasp1Ref = useRef<HTMLDivElement>(null);
  const clasp2Ref = useRef<HTMLDivElement>(null);

  const unlockedCount = (unlocked1 ? 1 : 0) + (unlocked2 ? 1 : 0);

  // Toast Notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2600);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showNotice = (msg: string) => {
    setToastMessage(msg);
  };

  // Pixie Dust Effect
  const spawnPixieDust = (targetEl: HTMLElement | null) => {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const numParticles = 32;
    const colors = ['#FFF8E1', '#FCE29A', '#E6C673', '#FFFCF2', '#dfc27d', '#ffe8a8'];

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.className = 'pixie-particle';
      
      const size = Math.random() * 3 + 1.2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.backgroundColor = chosenColor;
      particle.style.boxShadow = `0 0 6px ${chosenColor}`;
      
      const startX = rect.left + rect.width / 2 + (Math.random() - 0.5) * 50;
      const startY = rect.top + rect.height / 2 + (Math.random() - 0.5) * 40;
      
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 60 + 20;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 35;
      
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1400);
    }
  };

  const handleToggleBox1 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!unlocked1) {
      setUnlocked1(true);
      setOwlMemoryUnlocked(1, true);
      spawnPixieDust(clasp1Ref.current);
      showNotice('Archival seal unlocked for MEMORY I. Index revealed.');
      playHedwigAmbience(false, false);
      
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const delay = isReduced ? 100 : 1400;
      
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = setTimeout(() => {
        navigate('/raven/memory-1');
      }, delay);
    } else {
      setUnlocked1(false);
      setOwlMemoryUnlocked(1, false);
      showNotice('Archival reliquary MEMORY I resealed.');
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    }
  };

  const handleToggleBox2 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!unlocked2) {
      setUnlocked2(true);
      setOwlMemoryUnlocked(2, true);
      spawnPixieDust(clasp2Ref.current);
      showNotice('Archival seal unlocked for MEMORY II. Index revealed.');
      playHedwigAmbience(false, false);
      
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const delay = isReduced ? 100 : 1400;
      
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = setTimeout(() => {
        navigate('/raven/memory-2');
      }, delay);
    } else {
      setUnlocked2(false);
      setOwlMemoryUnlocked(2, false);
      showNotice('Archival reliquary MEMORY II resealed.');
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    }
  };


  // 3D Tilt Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardRef: React.RefObject<HTMLDivElement | null>) => {
    const card = cardRef.current;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!card || !isFinePointer) return;

    const bounds = card.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    const normX = ((mouseX / bounds.width) - 0.5) * 2;
    const normY = ((mouseY / bounds.height) - 0.5) * 2;

    const clampedX = Math.max(-1, Math.min(1, normX));
    const clampedY = Math.max(-1, Math.min(1, normY));

    const maxTilt = 2.2;
    const rotX = -clampedY * maxTilt;
    const rotY = clampedX * maxTilt;
    const sheenX = (mouseX / bounds.width) * 100;
    const sheenY = (mouseY / bounds.height) * 100;

    card.style.transform = `perspective(1400px) rotateX(${rotX.toFixed(3)}deg) rotateY(${rotY.toFixed(3)}deg) translateZ(0)`;
    card.style.setProperty('--mouse-x', `${sheenX.toFixed(2)}%`);
    card.style.setProperty('--mouse-y', `${sheenY.toFixed(2)}%`);
  };

  const handleMouseLeave = (cardRef: React.RefObject<HTMLDivElement | null>) => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
  };

  // Starfield Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;
    const motionListener = (e: MediaQueryListEvent) => { prefersReducedMotion = e.matches; };
    reducedMotionQuery.addEventListener('change', motionListener);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: any[] = [];
    let rafId: number;

    const particleColors = [
      { r: 253, g: 251, b: 247 },
      { r: 236, g: 230, b: 216 },
      { r: 234, g: 197, b: 139 },
      { r: 223, g: 194, b: 125 },
      { r: 245, g: 225, b: 175 }
    ];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth + 40;
      height = window.innerHeight + 40;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      createParticles();
    };

    const createParticles = () => {
      particles = [];
      const count = Math.max(48, Math.floor((width * height) / 18500));

      for (let i = 0; i < count; i++) {
        const isDistant = Math.random() > 0.45;
        const colorObj = particleColors[Math.floor(Math.random() * particleColors.length)];
        const size = isDistant ? (Math.random() * 0.45 + 0.8) : (Math.random() * 0.55 + 1.25);
        const baseAlpha = isDistant ? (Math.random() * 0.18 + 0.15) : (Math.random() * 0.25 + 0.3);
        const speedY = isDistant ? -(Math.random() * 0.028 + 0.022) : -(Math.random() * 0.045 + 0.038);
        const speedX = (Math.random() - 0.5) * 0.025;
        const pulsePhase = Math.random() * Math.PI * 2;
        const pulseSpeed = Math.random() * 0.008 + 0.004;

        particles.push({ x: Math.random() * width, y: Math.random() * height, size, baseAlpha, color: colorObj, speedY, speedX, pulsePhase, pulseSpeed, isDistant });
      }
    };

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      targetParallaxX = -normX * 10;
      targetParallaxY = -normY * 10;
    };
    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true });

    let lastTime = performance.now();

    const render = (now: number) => {
      rafId = requestAnimationFrame(render);
      const delta = Math.min((now - lastTime) / 16.666, 3);
      lastTime = now;

      if (!prefersReducedMotion) {
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.04;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.04;
        canvas.style.transform = `translate3d(${currentParallaxX.toFixed(2)}px, ${currentParallaxY.toFixed(2)}px, 0)`;
      } else {
        canvas.style.transform = 'translate3d(0, 0, 0)';
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.y += p.speedY * delta;
          p.x += p.speedX * delta;
          p.pulsePhase += p.pulseSpeed * delta;

          if (p.y < -10) p.y = height + 8;
          if (p.y > height + 10) p.y = -8;
          if (p.x < -10) p.x = width + 8;
          if (p.x > width + 10) p.x = -8;
        }

        const pulse = prefersReducedMotion ? 1 : (Math.sin(p.pulsePhase) * 0.35 + 0.85);
        const currentAlpha = Math.max(0.12, Math.min(0.58, p.baseAlpha * pulse));

        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (!p.isDistant && currentAlpha > 0.35) {
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${(currentAlpha * 0.28).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      reducedMotionQuery.removeEventListener('change', motionListener);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="raven-page-wrapper h-full bg-[#05070c] relative flex flex-col justify-between items-center min-h-screen py-10 px-4 md:px-8 selection:bg-brass-700 selection:text-white">
      <canvas id="ambient-canvas" ref={canvasRef} width="2640" height="2780" style={{ transform: 'translate3d(0px, 0px, 0px)' }}></canvas>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header */}
        <header className="text-center mb-6" data-purpose="archive-header">
          <div className="inline-flex items-center justify-center gap-2.5 mb-4 group cursor-default">
            <span className="beacon-pulse inline-block w-1.5 h-1.5 rounded-full bg-[#dfc27d]"></span>
            <span className="meta-shimmer-text tracking-[0.28em] transition-all duration-300 group-hover:tracking-[0.32em]" style={{ fontFamily: 'monospace, ui-monospace, sans-serif', fontSize: '13px', fontWeight: 500, textTransform: 'uppercase' }}>
              SENTINEL RECORD // FILE 03
            </span>
          </div>
          <h1 className="mb-3 select-none title-celestial-sheen cursor-default" style={{ fontFamily: 'Cinzel, "Playfair Display", Baskerville, serif', fontSize: 'clamp(3.2rem, 6.2vw, 5.2rem)', fontWeight: 700, letterSpacing: '0.32em', textIndent: '0.32em' }}>
            HEDWIG
          </h1>
          <p className="mb-8 select-none epigraph-living-ink cursor-default" style={{ fontFamily: '"Cormorant Garamond", "Playfair Display", serif', fontSize: 'clamp(1.2rem, 2.1vw, 1.55rem)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.5 }}>
            Keeper of the moments that should not be forgotten.
          </p>
          <div className="inline-flex flex-col items-center justify-center transition-all duration-300 hover:border-[#dfc27d]/50" style={{ borderRadius: '12px', background: 'rgba(18, 22, 30, 0.72)', border: '1px solid rgba(184, 148, 88, 0.28)', boxShadow: 'rgba(255, 255, 255, 0.05) 0px 1px 2px inset, rgba(0, 0, 0, 0.5) 0px 10px 30px', padding: '16px 36px', minWidth: '320px', backdropFilter: 'blur(8px)' }}>
            <span className="tracking-[0.32em] text-[#7f8694] font-medium uppercase mb-1.5 transition-colors duration-300 hover:text-[#b8c2d1]" style={{ fontFamily: 'monospace, ui-monospace, sans-serif', fontSize: '11px' }}>
              VAULT RECOVER ST<u style={{ textDecorationThickness: '1px', textUnderlineOffset: '2px' }}>"<span style={{ color: '#dfc27d', textShadow: '0 0 6px rgba(223, 194, 125, 0.4)' }}>8</span>"</u>US
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="vault-counter-glow" style={{ fontFamily: '"Cinzel", "Playfair Display", serif', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.24em', color: '#ece6d8' }}>
                {unlockedCount} / 2 RECOVERED
              </span>
              <span className="flex items-center gap-1.5 ml-1 text-[#dfc27d]" style={{ fontSize: '14px' }}>
                <span className="twinkle-dot-1 w-1.5 h-1.5 rounded-full bg-[#dfc27d] inline-block"></span>
                <span className="twinkle-dot-2 w-1.5 h-1.5 rounded-full bg-[#dfc27d] inline-block"></span>
                <span className="twinkle-dot-3 w-1.5 h-1.5 rounded-full bg-[#dfc27d] inline-block"></span>
              </span>
            </div>
          </div>
        </header>

        {/* Sentinel Creature Section */}
        <section className="flex flex-col items-center relative my-2">
          <div aria-hidden="true" className="absolute -top-16 flex items-center justify-center pointer-events-none select-none z-0">
            <div className="owl-haze-pulse-mist absolute w-[520px] h-[520px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(234, 197, 139, 0.16) 0%, rgba(190, 215, 245, 0.08) 38%, rgba(8, 11, 18, 0.03) 65%, transparent 75%)', mixBlendMode: 'screen' }}></div>
            <div className="owl-haze-pulse-core absolute w-[360px] h-[360px] rounded-full blur-2xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255, 235, 185, 0.28) 0%, rgba(234, 197, 139, 0.16) 42%, rgba(175, 205, 240, 0.04) 68%, transparent 82%)', mixBlendMode: 'screen' }}></div>
            <div className="owl-haze-pulse-core absolute w-[240px] h-[260px] -top-1 rounded-full blur-xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(255, 248, 230, 0.35) 0%, rgba(234, 197, 139, 0.18) 50%, transparent 78%)', mixBlendMode: 'screen', animationDelay: '-5.5s' }}></div>
          </div>
          <div className="relative animate-float z-10 transition-transform duration-700 hover:scale-[1.02] cursor-pointer" id="owl-hero" onClick={() => showNotice('Owl Sentinel observes the archive quietly.')}>
            <img alt="The Sentinel White Owl" className="w-56 sm:w-64 md:w-72 h-auto mx-auto object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.22)] drop-shadow-[0_0_80px_rgba(180,210,255,0.14)] owl-lifelike-motion" src={owlSentinelImg} />
          </div>
          <div className="mt-2 mb-8 z-10">
            <div className="mystic-badge inline-flex items-center px-4 py-1.5 rounded-full border bg-[#0d1320]/80 backdrop-blur-md cursor-default seal-awakening-pulse">
              <span className="mystic-badge-text font-archival italic text-sm tracking-wide">
                Archival seal for Owl Sentinel awakening...
              </span>
            </div>
          </div>
        </section>

        {/* Memory Boxes */}
        <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-4 mb-12 items-start">
          
          {/* Box 1 */}
          <article className="flex flex-col items-center w-full tilt-wrapper">
            <div 
              ref={box1Ref}
              className={`archival-box-enclosure box-tilt-card group relative w-full rounded-2xl p-2 select-none cursor-pointer ${unlocked1 ? 'is-unlocked shadow-[0_0_35px_rgba(223,194,125,0.22)]' : ''}`} 
              style={{ minHeight: '310px', transform: 'perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0px)', '--mouse-x': '50%', '--mouse-y': '50%', background: 'radial-gradient(at 50% 45%, rgb(12, 18, 32) 0%, rgb(7, 11, 20) 65%, rgb(4, 7, 13) 100%)' } as React.CSSProperties}
              onMouseMove={(e) => handleMouseMove(e, box1Ref)}
              onMouseLeave={() => handleMouseLeave(box1Ref)}
              onClick={(e) => { if (!unlocked1) handleToggleBox1(e); }}
            >
              <div aria-hidden="true" className="specular-sheen-overlay"></div>
              <div className="relative w-full h-full rounded-[14px] border border-[#b89458]/35 p-1.5 bg-gradient-to-b from-[#161310] via-[#0f0d0a] to-[#080706] shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)]" style={{ background: 'linear-gradient(rgb(15, 22, 38), rgb(9, 14, 26), rgb(5, 8, 17))' }}>
                <div className="relative w-full h-full rounded-[10px] border border-[#b89458]/25 px-5 py-4 min-h-[280px] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#181410]/70 to-[#0c0a08]/90" style={{ background: 'linear-gradient(rgba(13, 20, 34, 0.85), rgba(7, 11, 20, 0.95))' }}>
                  <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-[#dfc27d]/80 pointer-events-none"></span>
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-[#dfc27d]/80 pointer-events-none"></span>
                  <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-[#dfc27d]/80 pointer-events-none"></span>
                  <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-[#dfc27d]/80 pointer-events-none"></span>
                  
                  <div className="flex items-center justify-between relative z-10 w-full">
                    <div className="brass-pill-glow inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border bg-[#1a150e]/90 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] transition-all duration-300" style={{ backgroundColor: 'rgba(14, 20, 32, 0.92)', borderColor: 'rgba(184, 148, 88, 0.35)' }}>
                      <span className="font-serif text-[10px] tracking-[0.24em] font-medium">✦ MEMORY I ✦</span>
                    </div>
                    <span className={`box-status-tag font-sans text-[10px] tracking-[0.24em] uppercase transition-colors duration-300 font-medium ${unlocked1 ? 'status-tag-glow text-white' : 'text-[#8e7b5e]'}`}>
                      [ {unlocked1 ? 'UNLOCKED' : 'LOCKED'} ]
                    </span>
                  </div>

                  <div className="relative flex flex-col items-center justify-center my-4 z-10 text-center w-full" ref={clasp1Ref}>
                    <div className="relative flex items-center justify-center mb-1.5">
                      <div className={`lock-glow absolute w-28 h-28 rounded-full blur-xl pointer-events-none transition-all duration-700 ${unlocked1 ? 'bg-[#dfc27d]/25' : 'bg-[#dfc27d]/10'}`}></div>
                      <div className="relative w-11 h-12 flex items-center justify-center pt-1.5 transition-transform duration-500">
                        <svg className="w-10 h-10 text-[#dfc27d] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] filter drop-shadow-[0_0_8px_rgba(223,194,125,0.4)]" fill="none" style={{ overflow: 'visible' }} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="brassShackleGrad1" x1="0%" x2="100%" y1="0%" y2="100%">
                              <stop offset="0%" stopColor="#f5e6b5"></stop>
                              <stop offset="50%" stopColor="#dfc27d"></stop>
                              <stop offset="100%" stopColor="#8e7033"></stop>
                            </linearGradient>
                            <linearGradient id="brassBodyGrad1" x1="0%" x2="0%" y1="0%" y2="100%">
                              <stop offset="0%" stopColor="#2a2217"></stop>
                              <stop offset="50%" stopColor="#18130d"></stop>
                              <stop offset="100%" stopColor="#0e0b07"></stop>
                            </linearGradient>
                          </defs>
                          <path className="lock-shackle" d="M11 13V8.5C11 5.73858 13.2386 3.5 16 3.5C18.7614 3.5 21 5.73858 21 8.5V13" stroke="url(#brassShackleGrad1)" strokeLinecap="round" strokeWidth="2.4"></path>
                          <rect fill="url(#brassBodyGrad1)" height="14" rx="3" stroke="#cda95d" strokeWidth="1.5" width="16" x="8" y="12"></rect>
                          <circle cx="10.5" cy="14.5" fill="#dfc27d" opacity="0.8" r="0.75"></circle>
                          <circle cx="21.5" cy="14.5" fill="#dfc27d" opacity="0.8" r="0.75"></circle>
                          <circle cx="10.5" cy="23.5" fill="#dfc27d" opacity="0.5" r="0.75"></circle>
                          <circle cx="21.5" cy="23.5" fill="#dfc27d" opacity="0.5" r="0.75"></circle>
                          <circle cx="16" cy="17.8" fill="#dfc27d" r="1.4"></circle>
                          <path d="M16 19.2V22" stroke="#dfc27d" strokeLinecap="round" strokeWidth="1.4"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="w-full max-w-[290px] my-2.5 relative flex items-center justify-center">
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#b89458]/60 to-transparent"></div>
                      <span className="absolute w-2 h-2 rotate-45 border border-[#dfc27d]/70 bg-[#14100b] shadow-[0_0_6px_rgba(223,194,125,0.4)]"></span>
                    </div>
                    
                    {!unlocked1 ? (
                      <div className="locked-content transition-all duration-500">
                        <p className="font-serif italic text-base md:text-lg tracking-wider text-[#f4e8cc]">Sealed Reliquary</p>
                        <p className="font-sans text-[9px] tracking-[0.25em] text-[#8a7758] uppercase mt-0.5">ARCHIVAL SEAL INTACT · 01-A</p>
                      </div>
                    ) : (
                      <div className="unlocked-content transition-all duration-500">
                        <p className="clasp-released-text font-serif italic text-base md:text-lg tracking-wider">Clasp Released</p>
                        <p className="font-sans text-[9px] tracking-[0.25em] text-[#cbb692] uppercase mt-0.5 transition-colors">LIGHT PASSING THROUGH · 01-A</p>
                      </div>
                    )}

                    <div className={`archival-index-panel w-full max-w-[300px] mt-2.5 space-y-1 text-left transition-all duration-500 ${unlocked1 ? 'opacity-100 max-h-[136px]' : 'opacity-0 max-h-0 pointer-events-none'}`}>
                      <div className="flex items-center justify-between py-1 px-2.5 rounded border border-[#786134]/30 bg-[#0d1424]/75 hover:bg-[#141e34] transition-colors"><span className="font-sans text-[9px] tracking-[0.22em] text-[#d5c7a9] uppercase">01 · MEMORY RECORD</span><span className="font-mono text-[9px] text-[#dfc27d]">RESTORED</span></div>
                      <div className="flex items-center justify-between py-1 px-2.5 rounded border border-[#786134]/30 bg-[#0d1424]/75 hover:bg-[#141e34] transition-colors"><span className="font-sans text-[9px] tracking-[0.22em] text-[#d5c7a9] uppercase">02 · OBSERVATION</span><span className="font-mono text-[9px] text-[#dfc27d]">DECRYPTED</span></div>
                      <div className="flex items-center justify-between py-1 px-2.5 rounded border border-[#786134]/30 bg-[#0d1424]/75 hover:bg-[#141e34] transition-colors"><span className="font-sans text-[9px] tracking-[0.22em] text-[#d5c7a9] uppercase">03 · PERSONAL NOTE</span><span className="font-mono text-[9px] text-[#dfc27d]">AVAILABLE</span></div>
                      <div className="flex items-center justify-between py-1 px-2.5 rounded border border-[#786134]/30 bg-[#0d1424]/75 hover:bg-[#141e34] transition-colors"><span className="font-sans text-[9px] tracking-[0.22em] text-[#d5c7a9] uppercase">04 · ARCHIVE ENTRY</span><span className="font-mono text-[9px] text-[#dfc27d]">FILE 01</span></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#463821]/40 text-[10px] tracking-[0.2em] relative z-10 w-full">
                    <span className="index-code-animate font-sans font-medium text-xs">INDEX - 01</span>
                    <button onClick={handleToggleBox1} className={`action-toggle-btn font-serif text-xs hover:text-[#f7e6b8] tracking-[0.22em] uppercase transition-all px-3 py-1 rounded border cursor-pointer ${unlocked1 ? 'text-[#dfc27d] border-[#dfc27d]/60 bg-[#dfc27d]/10' : 'text-[#cca660] border-[#6b542a]/40 bg-[#18130d]/80 hover:bg-[#dfc27d]/10 hover:border-[#dfc27d]'}`} type="button" style={{ backgroundColor: 'rgba(13, 19, 31, 0.85)' }}>
                      [ {unlocked1 ? 'RESEAL' : 'UNLOCK'} ]
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-4 mb-2">
              {unlocked1 ? (
                <Link 
                  to="/raven/memory-1" 
                  className="flex flex-col items-center group cursor-pointer mt-1" 
                  style={{ textDecoration: 'none' }}
                >
                  <h2 className="memory-heading-lum font-serif text-sm sm:text-base tracking-[0.24em] font-medium uppercase drop-shadow-sm transition-colors group-hover:text-white">A BEAUTIFUL SMILE</h2>
                  <span className="mt-3 font-sans text-[10px] tracking-[0.24em] text-[#fce7a9] uppercase transition-all duration-300 px-4 py-1.5 rounded border border-[#dfc27d]/40 bg-[#dfc27d]/10 group-hover:bg-[#dfc27d]/25 group-hover:border-[#dfc27d]/80 group-hover:text-white group-hover:shadow-[0_0_12px_rgba(223,194,125,0.3)]">OPEN MEMORY →</span>
                </Link>
              ) : (
                <h2 className="memory-heading-lum font-serif text-sm sm:text-base tracking-[0.24em] font-medium uppercase drop-shadow-sm cursor-default">A BEAUTIFUL SMILE</h2>
              )}
            </div>
          </article>

          {/* Box 2 */}
          <article className="flex flex-col items-center w-full tilt-wrapper">
            <div 
              ref={box2Ref}
              className={`archival-box-enclosure box-tilt-card group relative w-full rounded-2xl p-2 select-none cursor-pointer ${unlocked2 ? 'is-unlocked shadow-[0_0_35px_rgba(223,194,125,0.22)]' : ''}`} 
              style={{ minHeight: '310px', transform: 'perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0px)', '--mouse-x': '50%', '--mouse-y': '50%', background: 'radial-gradient(at 50% 45%, rgb(12, 18, 32) 0%, rgb(7, 11, 20) 65%, rgb(4, 7, 13) 100%)' } as React.CSSProperties}
              onMouseMove={(e) => handleMouseMove(e, box2Ref)}
              onMouseLeave={() => handleMouseLeave(box2Ref)}
              onClick={(e) => { if (!unlocked2) handleToggleBox2(e); }}
            >
              <div aria-hidden="true" className="specular-sheen-overlay"></div>
              <div className="relative w-full h-full rounded-[14px] border border-[#b89458]/35 p-1.5 bg-gradient-to-b from-[#161310] via-[#0f0d0a] to-[#080706] shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)]" style={{ background: 'linear-gradient(rgb(15, 22, 38), rgb(9, 14, 26), rgb(5, 8, 17))' }}>
                <div className="relative w-full h-full rounded-[10px] border border-[#b89458]/25 px-5 py-4 min-h-[280px] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#181410]/70 to-[#0c0a08]/90" style={{ background: 'linear-gradient(rgba(13, 20, 34, 0.85), rgba(7, 11, 20, 0.95))' }}>
                  <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-[#dfc27d]/80 pointer-events-none"></span>
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-[#dfc27d]/80 pointer-events-none"></span>
                  <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-[#dfc27d]/80 pointer-events-none"></span>
                  <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-[#dfc27d]/80 pointer-events-none"></span>
                  
                  <div className="flex items-center justify-between relative z-10 w-full">
                    <div className="brass-pill-glow inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border bg-[#1a150e]/90 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] transition-all duration-300" style={{ backgroundColor: 'rgba(14, 20, 32, 0.92)', borderColor: 'rgba(184, 148, 88, 0.35)' }}>
                      <span className="font-serif text-[10px] tracking-[0.24em] font-medium">✦ MEMORY II ✦</span>
                    </div>
                    <span className={`box-status-tag font-sans text-[10px] tracking-[0.24em] uppercase transition-colors duration-300 font-medium ${unlocked2 ? 'status-tag-glow text-white' : 'text-[#8e7b5e]'}`}>
                      [ {unlocked2 ? 'UNLOCKED' : 'LOCKED'} ]
                    </span>
                  </div>

                  <div className="relative flex flex-col items-center justify-center my-4 z-10 text-center w-full" ref={clasp2Ref}>
                    <div className="relative flex items-center justify-center mb-1.5">
                      <div className={`lock-glow absolute w-28 h-28 rounded-full blur-xl pointer-events-none transition-all duration-700 ${unlocked2 ? 'bg-[#dfc27d]/25' : 'bg-[#dfc27d]/10'}`}></div>
                      <div className="relative w-11 h-12 flex items-center justify-center pt-1.5 transition-transform duration-500">
                        <svg className="w-10 h-10 text-[#dfc27d] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] filter drop-shadow-[0_0_8px_rgba(223,194,125,0.4)]" fill="none" style={{ overflow: 'visible' }} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="brassShackleGrad2" x1="0%" x2="100%" y1="0%" y2="100%">
                              <stop offset="0%" stopColor="#f5e6b5"></stop>
                              <stop offset="50%" stopColor="#dfc27d"></stop>
                              <stop offset="100%" stopColor="#8e7033"></stop>
                            </linearGradient>
                            <linearGradient id="brassBodyGrad2" x1="0%" x2="0%" y1="0%" y2="100%">
                              <stop offset="0%" stopColor="#2a2217"></stop>
                              <stop offset="50%" stopColor="#18130d"></stop>
                              <stop offset="100%" stopColor="#0e0b07"></stop>
                            </linearGradient>
                          </defs>
                          <path className="lock-shackle" d="M11 13V8.5C11 5.73858 13.2386 3.5 16 3.5C18.7614 3.5 21 5.73858 21 8.5V13" stroke="url(#brassShackleGrad2)" strokeLinecap="round" strokeWidth="2.4"></path>
                          <rect fill="url(#brassBodyGrad2)" height="14" rx="3" stroke="#cda95d" strokeWidth="1.5" width="16" x="8" y="12"></rect>
                          <circle cx="10.5" cy="14.5" fill="#dfc27d" opacity="0.8" r="0.75"></circle>
                          <circle cx="21.5" cy="14.5" fill="#dfc27d" opacity="0.8" r="0.75"></circle>
                          <circle cx="10.5" cy="23.5" fill="#dfc27d" opacity="0.5" r="0.75"></circle>
                          <circle cx="21.5" cy="23.5" fill="#dfc27d" opacity="0.5" r="0.75"></circle>
                          <circle cx="16" cy="17.8" fill="#dfc27d" r="1.4"></circle>
                          <path d="M16 19.2V22" stroke="#dfc27d" strokeLinecap="round" strokeWidth="1.4"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="w-full max-w-[290px] my-2.5 relative flex items-center justify-center">
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#b89458]/60 to-transparent"></div>
                      <span className="absolute w-2 h-2 rotate-45 border border-[#dfc27d]/70 bg-[#14100b] shadow-[0_0_6px_rgba(223,194,125,0.4)]"></span>
                    </div>
                    
                    {!unlocked2 ? (
                      <div className="locked-content transition-all duration-500">
                        <p className="font-serif italic text-base md:text-lg tracking-wider text-[#f4e8cc]">Sealed Reliquary</p>
                        <p className="font-sans text-[9px] tracking-[0.25em] text-[#8a7758] uppercase mt-0.5">ARCHIVAL SEAL INTACT · 02-B</p>
                      </div>
                    ) : (
                      <div className="unlocked-content transition-all duration-500">
                        <p className="clasp-released-text font-serif italic text-base md:text-lg tracking-wider">Clasp Released</p>
                        <p className="font-sans text-[9px] tracking-[0.25em] text-[#cbb692] uppercase mt-0.5 transition-colors">LIGHT PASSING THROUGH · 02-B</p>
                      </div>
                    )}

                    <div className={`archival-index-panel w-full max-w-[300px] mt-2.5 space-y-1 text-left transition-all duration-500 ${unlocked2 ? 'opacity-100 max-h-[136px]' : 'opacity-0 max-h-0 pointer-events-none'}`}>
                      <div className="flex items-center justify-between py-1 px-2.5 rounded border border-[#786134]/30 bg-[#0d1424]/75 hover:bg-[#141e34] transition-colors"><span className="font-sans text-[9px] tracking-[0.22em] text-[#d5c7a9] uppercase">01 · MEMORY RECORD</span><span className="font-mono text-[9px] text-[#dfc27d]">RESTORED</span></div>
                      <div className="flex items-center justify-between py-1 px-2.5 rounded border border-[#786134]/30 bg-[#0d1424]/75 hover:bg-[#141e34] transition-colors"><span className="font-sans text-[9px] tracking-[0.22em] text-[#d5c7a9] uppercase">02 · OBSERVATION</span><span className="font-mono text-[9px] text-[#dfc27d]">DECRYPTED</span></div>
                      <div className="flex items-center justify-between py-1 px-2.5 rounded border border-[#786134]/30 bg-[#0d1424]/75 hover:bg-[#141e34] transition-colors"><span className="font-sans text-[9px] tracking-[0.22em] text-[#d5c7a9] uppercase">03 · PERSONAL NOTE</span><span className="font-mono text-[9px] text-[#dfc27d]">AVAILABLE</span></div>
                      <div className="flex items-center justify-between py-1 px-2.5 rounded border border-[#786134]/30 bg-[#0d1424]/75 hover:bg-[#141e34] transition-colors"><span className="font-sans text-[9px] tracking-[0.22em] text-[#d5c7a9] uppercase">04 · ARCHIVE ENTRY</span><span className="font-mono text-[9px] text-[#dfc27d]">FILE 02</span></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#463821]/40 text-[10px] tracking-[0.2em] relative z-10 w-full">
                    <span className="index-code-animate font-sans font-medium text-xs">INDEX - 02</span>
                    <button onClick={handleToggleBox2} className={`action-toggle-btn font-serif text-xs hover:text-[#f7e6b8] tracking-[0.22em] uppercase transition-all px-3 py-1 rounded border cursor-pointer ${unlocked2 ? 'text-[#dfc27d] border-[#dfc27d]/60 bg-[#dfc27d]/10' : 'text-[#cca660] border-[#6b542a]/40 bg-[#18130d]/80 hover:bg-[#dfc27d]/10 hover:border-[#dfc27d]'}`} type="button" style={{ backgroundColor: 'rgba(13, 19, 31, 0.85)' }}>
                      [ {unlocked2 ? 'RESEAL' : 'UNLOCK'} ]
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-4 mb-2">
              {unlocked2 ? (
                <Link 
                  to="/raven/memory-2" 
                  className="flex flex-col items-center group cursor-pointer mt-1" 
                  style={{ textDecoration: 'none' }}
                >
                  <h2 className="memory-heading-lum font-serif text-sm sm:text-base tracking-[0.24em] font-medium uppercase drop-shadow-sm transition-colors group-hover:text-white">A CHERISHED MEMORY</h2>
                  <span className="mt-3 font-sans text-[10px] tracking-[0.24em] text-[#fce7a9] uppercase transition-all duration-300 px-4 py-1.5 rounded border border-[#dfc27d]/40 bg-[#dfc27d]/10 group-hover:bg-[#dfc27d]/25 group-hover:border-[#dfc27d]/80 group-hover:text-white group-hover:shadow-[0_0_12px_rgba(223,194,125,0.3)]">OPEN MEMORY →</span>
                </Link>
              ) : (
                <h2 className="memory-heading-lum font-serif text-sm sm:text-base tracking-[0.24em] font-medium uppercase drop-shadow-sm cursor-default">A CHERISHED MEMORY</h2>
              )}
            </div>
          </article>
        </main>

        {/* Footer Nav */}
        <footer className="mt-4 mb-8 flex justify-center w-full">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 w-full max-w-2xl px-4">
            <Link
              to="/case"
              onClick={() => stopHedwigAmbience()}
              className="group button-archive-expand inline-flex items-center justify-center gap-3 w-full sm:w-auto py-3.5 px-8 rounded-lg border border-[#4a5568]/50 hover:border-[#dfc27d]/70 bg-[#0d111a]/85 hover:bg-[#131926] text-[#e2e8f0] hover:text-[#fce7a9] font-serif text-xs sm:text-[13px] tracking-[0.22em] font-medium transition-all duration-300 shadow-[0_4px_22px_rgba(0,0,0,0.65)] hover:shadow-[0_0_24px_rgba(223,194,125,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer uppercase backdrop-blur-md"
            >
              <span className="arrow-glide-left inline-block font-sans text-sm text-[#dfc27d]">←</span>
              <span className="whitespace-nowrap">RETURN TO ARCHIVE</span>
            </Link>
            <button
              className="group button-archive-expand inline-flex items-center justify-center gap-3 w-full sm:w-auto py-3.5 px-8 rounded-lg bg-gradient-to-br from-[#e5c17d] via-[#dfba76] to-[#d8ae64] hover:brightness-105 text-[#15120d] font-serif text-xs sm:text-[13px] font-bold tracking-[0.22em] transition-all duration-300 animate-gold-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer uppercase border border-[#edd89f]/40"
              type="button"
              onClick={() => {
                stopHedwigAmbience();
                navigate('/audio');
              }}
            >
              <span className="whitespace-nowrap">MOVE TO FILE NO. 04</span>
              <span className="arrow-glide-right inline-block font-sans text-sm font-bold">→</span>
            </button>
          </div>
        </footer>
      </div>

      <div className={`fixed bottom-6 z-50 transition-all duration-500 px-6 py-2.5 rounded-full border border-[#836a36] bg-[#0f131d]/95 backdrop-blur-md shadow-[0_0_25px_rgba(212,175,55,0.35)] text-center ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'}`}>
        <span className="font-archival italic text-sm text-[#f1ddab] tracking-wide">{toastMessage}</span>
      </div>
    </div>
  );
};

export default Raven;
