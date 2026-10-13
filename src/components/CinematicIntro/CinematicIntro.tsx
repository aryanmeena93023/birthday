import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './CinematicIntro.css';
import { toggleAmbienceDrone, isAmbienceActive, playUnlockChime } from '../../utils/archiveAudio';

const CinematicIntro: React.FC = () => {
  const navigate = useNavigate();
  const [isEntering, setIsEntering] = useState(false);
  const [ambientActive, setAmbientActive] = useState(isAmbienceActive());

  const containerRef = useRef<HTMLDivElement>(null);
  const gateImageRef = useRef<HTMLImageElement>(null);
  const lightConeRef = useRef<HTMLDivElement>(null);
  const mistOverlayRef = useRef<HTMLDivElement>(null);
  const gateDoorsRef = useRef<HTMLDivElement>(null);
  const gateLeftRef = useRef<HTMLDivElement>(null);
  const gateRightRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  const handleToggleAudio = () => {
    const nextState = toggleAmbienceDrone((playing) => setAmbientActive(playing));
    setAmbientActive(nextState);
  };

  const handleEnterClick = () => {
    if (isEntering) return;
    setIsEntering(true);

    if (ambientActive) {
      playUnlockChime();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        navigate('/case');
      }
    });

    timelineRef.current = tl;

    // STATE 2 — ENTER ACTIVATION (0.00s - 0.80s)
    tl.to(btnRef.current, {
      scale: 0.96,
      y: 2,
      duration: 0.25,
      ease: 'power2.out'
    })
    .to(gateDoorsRef.current, {
      opacity: 0.9,
      duration: 0.4,
      ease: 'power2.inOut'
    }, 0.1)
    .to(gateLeftRef.current, {
      rotateY: -5,
      duration: 0.4,
      ease: 'power2.out'
    }, 0.1)
    .to(gateRightRef.current, {
      rotateY: 5,
      duration: 0.4,
      ease: 'power2.out'
    }, 0.1)
    .to(contentRef.current, {
      opacity: 0.25,
      scale: 0.97,
      y: 8,
      filter: 'blur(1px)',
      duration: 0.6,
      ease: 'power2.inOut'
    }, 0.2)
    .to([headerRef.current, footerRef.current], {
      opacity: 0.35,
      duration: 0.6,
      ease: 'power2.inOut'
    }, 0.2)

    // STATE 3 — GATE OPENING (0.80s - 2.40s)
    .to(gateDoorsRef.current, {
      opacity: 1,
      duration: 0.5
    }, 0.8)
    .to(gateLeftRef.current, {
      rotateY: -82,
      scaleX: 0.78,
      duration: 1.6,
      ease: 'power3.inOut'
    }, 0.8)
    .to(gateRightRef.current, {
      rotateY: 82,
      scaleX: 0.78,
      duration: 1.6,
      ease: 'power3.inOut'
    }, 0.8)
    .to(lightConeRef.current, {
      opacity: 0.85,
      scale: 2.6,
      duration: 1.6,
      ease: 'power2.out'
    }, 0.9)
    .to(gateImageRef.current, {
      scale: 1.10,
      yPercent: 1.5,
      filter: 'contrast(1.08) brightness(1.02)',
      duration: 1.6,
      ease: 'power2.inOut'
    }, 0.8)
    .to(contentRef.current, {
      opacity: 0,
      scale: 0.92,
      y: 18,
      duration: 0.8,
      ease: 'power2.in'
    }, 0.8)
    .to([headerRef.current, footerRef.current], {
      opacity: 0.1,
      duration: 0.8
    }, 0.8)

    // STATE 4 — CROSSING THE THRESHOLD (2.40s - 4.00s)
    .to(gateLeftRef.current, {
      rotateY: -92,
      scaleX: 0.65,
      duration: 1.6,
      ease: 'power2.inOut'
    }, 2.4)
    .to(gateRightRef.current, {
      rotateY: 92,
      scaleX: 0.65,
      duration: 1.6,
      ease: 'power2.inOut'
    }, 2.4)
    .to(lightConeRef.current, {
      opacity: 0.95,
      scale: 4.2,
      duration: 1.6,
      ease: 'power2.inOut'
    }, 2.4)
    .to(mistOverlayRef.current, {
      opacity: 0.12,
      duration: 1.6
    }, 2.4)
    .to(gateImageRef.current, {
      scale: 1.42,
      yPercent: 4.5,
      filter: 'contrast(1.12) brightness(0.98)',
      duration: 1.6,
      ease: 'power2.inOut'
    }, 2.4)

    // STATE 5 — INTERIOR REVEAL (4.00s - 5.80s)
    .to(gateImageRef.current, {
      scale: 1.75,
      yPercent: 7.5,
      filter: 'contrast(1.15) brightness(0.92)',
      opacity: 0.08,
      duration: 1.8,
      ease: 'power2.inOut'
    }, 4.0)
    .to(gateDoorsRef.current, {
      opacity: 0,
      duration: 1.2
    }, 4.0)
    .to(lightConeRef.current, {
      opacity: 0.4,
      scale: 6,
      duration: 1.8,
      ease: 'power2.inOut'
    }, 4.0)
    .to([headerRef.current, footerRef.current], {
      opacity: 0,
      duration: 0.8
    }, 4.0)

    // STATE 6 — ARCHIVE TRANSITION TO /CASE (5.80s - 6.40s)
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, 5.8);
  };

  return (
    <div ref={containerRef} className="cinematic-entrance-root">
      {/* Final Approved Gate Image */}
      <img
        ref={gateImageRef}
        src="/media/entrance/academy-gate.webp"
        alt="NLUJA Assam Gate Entrance"
        className="gate-bg-image"
      />

      {/* Ground Mist & Vignette */}
      <div ref={mistOverlayRef} className="ground-mist-overlay" />

      {/* Warm Amber Interior Light Bloom Cone */}
      <div ref={lightConeRef} className="interior-light-cone" />

      {/* 3D Iron Gate Swing Doors */}
      <div ref={gateDoorsRef} className="gate-doors-container">
        <div className="gate-doors-frame">
          <div ref={gateLeftRef} className="gate-leaf-left" />
          <div ref={gateRightRef} className="gate-leaf-right" />
        </div>
      </div>

      {/* Lantern Glow Spots */}
      <div className="lantern-spot lantern-left" />
      <div className="lantern-spot lantern-right" />

      {/* Header Bar */}
      <header ref={headerRef} className="entrance-header" id="mainHeader">
        <div className="header-left-group">
          <span className="header-beacon-dot" />
          <span className="header-code">RECOVERY DEPOSIT // MK-84</span>
          <span className="hidden sm:inline opacity-60">•</span>
          <span className="hidden sm:inline opacity-80">JUDICIAL ARCHIVES REQUISITION</span>
        </div>
        <div className="header-right-group">
          <span className="hidden lg:inline text-[10px] tracking-[0.28em] text-primary/80">
            OCTOBER 1984 COVENANT
          </span>
          <button
            type="button"
            onClick={handleToggleAudio}
            className="audio-toggle-btn"
            title="Toggle Atmosphere Audio"
          >
            <span className="material-symbols-outlined text-sm">
              {ambientActive ? 'volume_up' : 'volume_off'}
            </span>
            <span>{ambientActive ? 'ATMOSPHERE : ON' : 'ATMOSPHERE : MUTED'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Center Block */}
      <main ref={contentRef} className="portal-center-block" id="portalCenterBlock">
        <div className="dept-badge-container">
          <span className="badge-line" />
          <span className="dept-badge-text">DEPARTMENT OF UNUSUAL OCCURRENCES</span>
          <span className="badge-line" />
        </div>

        <h1 className="main-academy-title">NLUJA ASSAM</h1>

        <p className="main-academy-sub">National Law University and Judicial Academy, Assam</p>

        <p className="epigraph-text">“A rather unusual file has arrived at the gates...”</p>

        <div className="enter-escutcheon-wrapper">
          <div className="btn-brass-aura" />
          <button
            ref={btnRef}
            type="button"
            onClick={handleEnterClick}
            disabled={isEntering}
            className="enter-academy-btn"
            id="enterBtn"
          >
            <span className="enter-btn-dot" />
            <span className="enter-btn-label">ENTER THE ACADEMY</span>
            <span className="material-symbols-outlined text-sm">east</span>
          </button>
        </div>

        <div className="clearance-tag">
          <span className="material-symbols-outlined text-xs">lock</span>
          <span>SANCTUM JURISDICTION // LEVEL IV RESTRICTED REPOSITORY</span>
        </div>
      </main>

      {/* Archival Footer Bar */}
      <footer ref={footerRef} className="entrance-footer" id="mainFooter">
        <div className="footer-coords">
          <span>LAT 26.1856° N</span>
          <span>•</span>
          <span>LONG 91.7483° E</span>
          <span>•</span>
          <span>GUWAHATI CITADEL ARCHIVES</span>
        </div>
        <div className="footer-copyright">
          © MMDXXIV JUDICIAL REPOSITORY • RESTRICTED ARCHIVAL PROTOCOL
        </div>
      </footer>
    </div>
  );
};

export default CinematicIntro;



