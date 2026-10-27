import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MemoryOne.css';
import { markDiscovered, setOwlMemoryUnlocked } from '../../utils/discoveryTracker';
import { stopHedwigAmbience } from '../../utils/archiveAudio';

const MemoryTwo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const handleClose = () => {
    setOwlMemoryUnlocked(1, true);
    setOwlMemoryUnlocked(2, true);
    const panel = document.getElementById('memory-parchment-panel');
    if (panel) {
      panel.style.transform = 'scale(0.97)';
      panel.style.opacity = '0.4';
      setTimeout(() => {
        navigate('/raven');
      }, 400);
    } else {
      navigate('/raven');
    }
  };

  const handleOpenAudioMessage = () => {
    setOwlMemoryUnlocked(1, true);
    setOwlMemoryUnlocked(2, true);
    stopHedwigAmbience();
    const panel = document.getElementById('memory-parchment-panel');
    if (panel) {
      panel.style.transform = 'scale(0.97)';
      panel.style.opacity = '0.4';
      setTimeout(() => {
        navigate('/audio');
      }, 400);
    } else {
      navigate('/audio');
    }
  };

  useEffect(() => {
    markDiscovered('raven');
    setOwlMemoryUnlocked(2, true);
    window.scrollTo(0, 0);

    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = prefersReducedMotion ? 24 : 56;
    const particles: any[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.35 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 0.8 + 0.7,
        baseAlpha: baseAlpha,
        alpha: baseAlpha,
        speedY: -(Math.random() * 0.16 + 0.03),
        speedX: (Math.random() - 0.5) * 0.1,
        twinkleSpeed: Math.random() * 0.02 + 0.006,
        twinkleOffset: Math.random() * Math.PI * 2,
        isGoldHighlight: Math.random() > 0.4
      });
    }

    let time = 0;
    let rafId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          const osc = (Math.sin(time * (p.twinkleSpeed * 100) + p.twinkleOffset) + 1) / 2;
          p.alpha = p.baseAlpha + osc * 0.18;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        if (p.isGoldHighlight) {
          ctx.fillStyle = `rgba(235, 215, 175, ${Math.min(0.5, p.alpha)})`;
        } else {
          ctx.fillStyle = `rgba(215, 195, 160, ${Math.min(0.4, p.alpha * 0.85)})`;
        }
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="memory-one-wrapper relative flex flex-col justify-between selection:bg-archive-brass/20 selection:text-archive-brassLight min-h-screen">
      <div aria-hidden="true" className="ambient-haze"></div>
      <canvas ref={canvasRef} data-purpose="background-dust-layer" id="ambient-canvas"></canvas>
      
      <div className="relative z-10 flex flex-col justify-between min-h-screen px-4 sm:px-6 lg:px-8 py-8 md:py-10 max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <header className="text-center pt-2 md:pt-4 pb-4 cinematic-entry-header" data-purpose="header-metadata">
          <div className="flex items-center justify-center gap-3 text-[11px] md:text-xs tracking-[0.32em] text-[#a19989] font-sans uppercase" style={{ color: 'rgb(184, 169, 148)', letterSpacing: '0.18em', fontSize: '11px' }}>
            <span className="inline-block w-6 md:w-8 h-[1px] bg-[#665e52]/50"></span>
            <span className="text-[9px] text-[#c29d5a]">✦</span>
            <span>OBSERVATION I // FILE 03</span>
            <span className="text-[9px] text-[#c29d5a]">✦</span>
            <span className="inline-block w-6 md:w-8 h-[1px] bg-[#665e52]/50"></span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] tracking-[0.16em] uppercase text-[#f7efe1] mt-3 md:mt-4 font-normal drop-shadow-[0_2px_18px_rgba(235,215,180,0.15)]" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', color: 'rgb(244, 237, 226)', letterSpacing: '0.22em', fontWeight: 500, textShadow: 'rgba(244, 237, 226, 0.12) 0px 2px 20px' }}>
            A CHERISHED MEMORY
          </h1>
          
          <div className="flex flex-col items-center justify-center mt-3 md:mt-4">
            <span className="text-[8px] text-[#c29d5a]/70 mb-1.5">✦</span>
            <div className="flex items-center gap-3 text-[10px] md:text-[11px] tracking-[0.28em] text-[#8e8576] font-sans uppercase">
              <span className="inline-block w-8 md:w-10 h-[1px] bg-[#4f483c]/50"></span>
              <span className="inline-block w-8 md:w-10 h-[1px] bg-[#4f483c]/50"></span>
            </div>
          </div>
        </header>

        {/* Parchment Letter Modal */}
        <main className="my-auto py-4 flex justify-center items-center" data-purpose="main-parchment-content">
          <article id="memory-parchment-panel" className="parchment-sheet cinematic-entry-panel relative w-full max-w-[880px] p-6 sm:p-10 md:p-12 lg:p-14 rounded-sm text-[#27221d] transition-transform duration-300" style={{ background: 'linear-gradient(135deg, rgb(243, 238, 227) 0%, rgb(237, 229, 215) 55%, rgb(234, 226, 211) 100%)', border: '1px solid rgba(194, 157, 90, 0.45)', outline: 'rgba(194, 157, 90, 0.2) solid 1px', outlineOffset: '-5px', boxShadow: 'rgba(0, 0, 0, 0.85) 0px 30px 80px -15px, rgba(184, 160, 128, 0.14) 0px 0px 45px inset, rgba(255, 255, 255, 0.6) 0px 1px 0px inset' }}>
            
            <div className="corner-ornament corner-tl"></div>
            <div className="corner-ornament corner-tr"></div>
            <div className="corner-ornament corner-bl"></div>
            <div className="corner-ornament corner-br"></div>
            
            <div className="absolute inset-[6px] border border-[#c29d5a]/25 pointer-events-none"></div>
            
            <button onClick={handleClose} aria-label="Close memory view" className="btn-silky absolute top-4 right-4 sm:top-5 sm:right-5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#d5cbb8] hover:border-[#c29d5a] flex items-center justify-center text-[#7e7261] hover:text-[#2d2720] hover:bg-[#ede5d6] transition-all duration-200 z-20 group" type="button" style={{ border: '1px solid rgba(194, 157, 90, 0.4)', background: 'rgba(243, 238, 227, 0.6)', backdropFilter: 'blur(2px)' }}>
              <span className="text-xs sm:text-sm font-sans font-light leading-none transition-transform group-hover:scale-110">✕</span>
            </button>

            <div className="cinematic-entry-author relative z-10 text-center mb-6 sm:mb-8 pt-1">
              <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#7a6f5e] font-medium mb-1" style={{ color: 'rgb(154, 140, 123)', letterSpacing: '0.18em', fontSize: '10px' }}>CHRONICLED // RECORDED MEMORY</p>
              <div className="w-full max-w-xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-[#c8bea9] to-transparent mt-5 mb-2"></div>
            </div>

            <div className="cinematic-entry-text relative z-10 px-2 sm:px-6 md:px-8 mb-8 sm:mb-12">
              <div className="font-serif italic text-left antialiased max-w-2xl mx-auto space-y-5 text-[15px] sm:text-base leading-[1.8] sm:leading-[1.82] selection:bg-[#dfd3bc]" style={{ color: 'rgb(26, 23, 21)' }}>
                <p><span className="drop-cap font-normal not-italic text-[#1e1a17]">T</span>here’s another memory I want to tell you about. ✨ I think we were in fifth or sixth grade at the time, if I remember correctly.</p>
                <p>Our teacher had given us some homework, and I had completed mine, but you hadn’t done yours. 😅 Luckily for you, that teacher’s class was scheduled for after lunch, and we had a free period before it. Most of our friends went outside the classroom, maybe to play or just spend some time together, but you and I were sitting on the same bench that day. 🪑🤍</p>
                <p>That’s when you asked me, so politely, if I could help you with my homework. 🥹 You also asked me not to tell anyone that you were completing it at school, because back then, doing your homework in the classroom was practically considered the same as not doing it at all. 😂🤫</p>
                <p>I don’t remember the exact words you used, but I still remember the way you asked me. You were so polite, so gentle about it, and somehow, that little interaction stayed with me. ❤️</p>
                <p>It might sound like such an ordinary thing, but it meant a lot to me.  At that time, I wasn’t particularly good at studies, while you were the class topper. 🏆 You were one of those few people I always looked up to and wanted to compete with. So, having you ask me for help, even with something as simple as homework, felt like a big deal to me. 🥹✨</p>
                <p>Looking back, I know it probably wasn’t anything special for you. Maybe you were just trying to finish your homework before the lecture, and that was all there was to it. 😂 And I’m pretty sure you don’t remember this incident at all. </p>
                <p>But I do. ❤️ I remember how you asked, how we were sitting together on that bench, and how something so small managed to stay with me for all these years. 🥹🤍</p>
                <p>I guess that’s what makes some memories so beautiful. ✨ They don’t have to be extraordinary or unforgettable for everyone. Sometimes, an ordinary little moment becomes special simply because it happened with someone who meant something to you. ❤️🫶</p>
                <p><strong>And for me, this was one of those moments with you.</strong> ^_^</p>
              </div>
            </div>

            <div className="cinematic-entry-footer-inner relative z-10 pt-4 sm:pt-6 border-t border-[#dfd6c5] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-3.5 self-start md:self-auto">
                <div className="wax-seal w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-md" style={{ background: 'radial-gradient(circle at 35% 32%, rgb(74, 21, 27), rgb(61, 18, 23) 65%, rgb(37, 9, 13) 100%)', border: '1px solid rgba(228, 205, 159, 0.25)', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 4px 12px, rgba(255, 200, 200, 0.25) 0px 1px 2px inset' }}>
                  <svg className="w-5 h-5 text-[#f4dfbe] opacity-90 drop-shadow-sm" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M12 2v4"></path>
                    <path d="M5 10c0 4.5 3.5 8 7 8s7-3.5 7-8a7 7 0 0 0-14 0z"></path>
                    <circle cx="9" cy="10" fill="currentColor" r="1.5"></circle>
                    <circle cx="15" cy="10" fill="currentColor" r="1.5"></circle>
                    <path d="M12 13v2"></path>
                    <path d="M9 21h6"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-display text-xs sm:text-[13px] tracking-[0.16em] uppercase font-bold text-[#1e1914]" style={{ letterSpacing: '0.18em', fontSize: '11px', color: 'rgb(30, 25, 20)', fontWeight: 700 }}>
                    Archived By The Owl
                  </p>
                  <p className="font-sans text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#7a6f5f]" style={{ letterSpacing: '0.18em', fontSize: '10px', color: 'rgb(154, 140, 123)' }}>
                    Sentinel Monogram // Authenticated
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                <button onClick={handleClose} className="btn-silky font-sans text-xs uppercase tracking-[0.18em] px-5 py-2.5 rounded-sm border border-[#c4b9a3] text-[#4d4437] hover:text-[#1e1914] hover:bg-[#ede5d6] hover:border-[#9f937d] transition duration-200" type="button" style={{ border: '1px solid rgb(203, 191, 172)', color: 'rgb(82, 71, 56)', letterSpacing: '0.18em', fontSize: '11px', background: 'transparent' }}>
                  ← Close
                </button>
                <button onClick={handleOpenAudioMessage} className="btn-silky font-sans text-xs uppercase tracking-[0.18em] px-6 py-2.5 rounded-sm bg-[#111317] hover:bg-[#1a1e24] text-[#ede5d6] border border-[#2b2a26] hover:border-[#b89f68] shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center group" type="button" style={{ backgroundColor: 'rgb(25, 24, 23)', border: '1px solid rgb(125, 105, 72)', color: 'rgb(237, 229, 214)', letterSpacing: '0.18em', fontSize: '11px', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 4px 14px' }}>
                  <span>OPEN AUDIO MESSAGE</span>
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </article>
        </main>

        {/* Footer */}
        <footer className="pt-4 pb-2 cinematic-entry-bottom" data-purpose="archive-footer-metadata">
          <div className="flex items-center justify-between text-[#7c7567] text-[10px] tracking-[0.22em] font-sans uppercase max-w-4xl mx-auto px-4 mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1.5 rounded-full bg-[#2a2c33]/80"></div>
              <div className="w-7 h-1.5 rounded-full bg-[#d0c6ad] shadow-[0_0_8px_rgba(208,198,173,0.4)]"></div>
              <div className="w-4 h-1.5 rounded-full bg-[#2a2c33]/80"></div>
              <span className="pl-2 font-display text-xs text-[#a39a88]">02 / 02</span>
            </div>
            <div className="text-[#847b6c] tracking-[0.28em] text-[10px] select-none">
              Reference • File
            </div>
          </div>
          <div className="text-center">
            <p className="font-sans text-[9px] md:text-[10px] tracking-[0.34em] text-[#554e42] uppercase">
              Sentinel Archive • Classified • Eyes Only
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MemoryTwo;
