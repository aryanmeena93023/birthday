import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  playDialClick,
  playUnlockChime,
  playArtifactChime,
  toggleAmbienceDrone,
  isAmbienceActive
} from '../../utils/archiveAudio';
import { markDiscovered, isDiscovered } from '../../utils/discoveryTracker';
import { restrictedRecords } from '../../content/restrictedRecords';
import './Forbidden.css';

export type ChestStage =
  | 'CHEST_LOCKED'
  | 'CHEST_OPENING'
  | 'RECORD_1_READY'
  | 'RECORD_1_PLAYING'
  | 'RECORD_1_COMPLETE'
  | 'RECORD_2_READY'
  | 'RECORD_2_PLAYING'
  | 'RECORD_2_COMPLETE'
  | 'KEY_REVEAL'
  | 'KEY_ACQUIRED';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();
  const initialUnlocked = isDiscovered('forbidden');

  // Authoritative Chest State Machine
  const [chestStage, setChestStage] = useState<ChestStage>(
    initialUnlocked ? 'KEY_ACQUIRED' : 'CHEST_LOCKED'
  );

  const [digits, setDigits] = useState<number[]>([1, 9, 8, 4]);
  const [cipherError, setCipherError] = useState<string | null>(null);
  const [isReleasingPins, setIsReleasingPins] = useState<boolean>(false);
  const [ambientActive, setAmbientActive] = useState<boolean>(isAmbienceActive());
  const [masterKeyAcquired, setMasterKeyAcquired] = useState<boolean>(initialUnlocked);

  // Content File References
  const record1Data = restrictedRecords[0];
  const record2Data = restrictedRecords[1];

  // GSAP Refs
  const chestLidRef = useRef<HTMLDivElement | null>(null);
  const interiorChamberRef = useRef<HTMLDivElement | null>(null);
  const recordCardRef = useRef<HTMLDivElement | null>(null);
  const keyCompartmentRef = useRef<HTMLDivElement | null>(null);
  const keyPedestalRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Audio Toggle
  const handleToggleAudio = () => {
    const nextState = toggleAmbienceDrone((playing) => setAmbientActive(playing));
    setAmbientActive(nextState);
  };

  // Tumbler Dials Adjustment
  const adjustDigit = (index: number, delta: number) => {
    playDialClick(300 + index * 40);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = (next[index] + delta + 10) % 10;
      return next;
    });
    setCipherError(null);
  };

  // Attempt Lock Unlock
  const attemptUnlock = () => {
    const code = digits.join('');
    const validCodes = ['1984', '3000', '1928', '1047'];

    if (validCodes.includes(code)) {
      playUnlockChime();
      setIsReleasingPins(true);
      setCipherError('TUMBLERS ALIGNED • RELEASING HASP...');

      setTimeout(() => {
        setIsReleasingPins(false);
        setChestStage('CHEST_OPENING');
      }, 600);
    } else {
      playDialClick(180);
      setCipherError('INCORRECT COMBINATION • TUMBLER DETENT FAILED');
    }
  };

  // Re-engage Chest Lid & Lock
  const handleLockAgain = () => {
    playDialClick(280);
    setMasterKeyAcquired(false);
    setChestStage('CHEST_LOCKED');
  };

  // GSAP Chest Opening Sequence
  useEffect(() => {
    if (chestStage === 'CHEST_OPENING') {
      const tl = gsap.timeline({
        onComplete: () => {
          setChestStage('RECORD_1_READY');
        }
      });

      // Phase 1: Lock disengage & subtle vibration
      if (chestLidRef.current) {
        tl.to(chestLidRef.current, {
          y: -2,
          rotationX: 3,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      // Phase 2: Lid opens with weight & resistance
      if (chestLidRef.current) {
        tl.to(chestLidRef.current, {
          rotationX: -105,
          transformOrigin: 'top center',
          duration: 1.4,
          ease: 'power3.inOut'
        });
      }

      // Phase 3: Interior light glow & dark velvet reveal
      if (interiorChamberRef.current) {
        tl.fromTo(
          interiorChamberRef.current,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' },
          '-=0.8'
        );
      }
    }
  }, [chestStage]);

  // GSAP Record Entry Animations
  useEffect(() => {
    if (chestStage === 'RECORD_1_READY' || chestStage === 'RECORD_2_READY') {
      if (recordCardRef.current) {
        gsap.fromTo(
          recordCardRef.current,
          { opacity: 0, y: 24, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' }
        );
      }
    }
  }, [chestStage]);

  // GSAP Key Reveal Animation
  useEffect(() => {
    if (chestStage === 'KEY_REVEAL') {
      const tl = gsap.timeline();

      if (keyCompartmentRef.current) {
        tl.fromTo(
          keyCompartmentRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
        );
      }

      if (keyPedestalRef.current) {
        tl.fromTo(
          keyPedestalRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' },
          '-=0.4'
        );
      }
    }
  }, [chestStage]);

  // Video Action Handlers
  const startRecord1 = () => {
    playArtifactChime(record1Data.pitch);
    setChestStage('RECORD_1_PLAYING');
  };

  const startRecord2 = () => {
    playArtifactChime(record2Data.pitch);
    setChestStage('RECORD_2_PLAYING');
  };

  // Natural Video ended handler: MUST NOT CLOSE PLAYER OR AUTO NAVIGATE!
  const handleVideoEnded = (recordNum: 1 | 2) => {
    playUnlockChime();
    if (recordNum === 1) {
      setChestStage('RECORD_1_COMPLETE');
    } else {
      setChestStage('RECORD_2_COMPLETE');
    }
  };

  // Manual Finish Video Action (Secondary Control)
  const finishVideoEarly = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    playUnlockChime();
    if (chestStage === 'RECORD_1_PLAYING') {
      setChestStage('RECORD_2_READY');
    } else if (chestStage === 'RECORD_2_PLAYING') {
      setChestStage('KEY_REVEAL');
    }
  };

  // Explicit User Navigation Actions after natural completion
  const continueToRecord2 = () => {
    playDialClick(340);
    if (videoRef.current) videoRef.current.pause();
    setChestStage('RECORD_2_READY');
  };

  const continueToKeyReveal = () => {
    playDialClick(360);
    if (videoRef.current) videoRef.current.pause();
    setChestStage('KEY_REVEAL');
  };

  // Acquire Master Key Action
  const acquireMasterKey = () => {
    if (masterKeyAcquired) return;
    playUnlockChime();
    playArtifactChime(659.25);
    markDiscovered('forbidden');
    setMasterKeyAcquired(true);
    setChestStage('KEY_ACQUIRED');
  };

  const closeVideoPlayerModal = () => {
    playDialClick(280);
    if (videoRef.current) videoRef.current.pause();

    if (chestStage === 'RECORD_1_PLAYING') {
      setChestStage('RECORD_1_READY');
    } else if (chestStage === 'RECORD_2_PLAYING') {
      setChestStage('RECORD_2_READY');
    } else if (chestStage === 'RECORD_1_COMPLETE') {
      setChestStage('RECORD_2_READY');
    } else if (chestStage === 'RECORD_2_COMPLETE') {
      setChestStage('KEY_REVEAL');
    }
  };

  const isModalOpen =
    chestStage === 'RECORD_1_PLAYING' ||
    chestStage === 'RECORD_1_COMPLETE' ||
    chestStage === 'RECORD_2_PLAYING' ||
    chestStage === 'RECORD_2_COMPLETE';

  const currentRecordNum: 1 | 2 =
    chestStage === 'RECORD_1_PLAYING' || chestStage === 'RECORD_1_COMPLETE' ? 1 : 2;

  const currentRecordData = currentRecordNum === 1 ? record1Data : record2Data;

  const isActivelyPlaying =
    chestStage === 'RECORD_1_PLAYING' || chestStage === 'RECORD_2_PLAYING';

  return (
    <div className="bg-[#07080a] font-body-md text-body-md text-[#f5efe6] antialiased min-h-screen flex flex-col selection:bg-[#baa36d]/40 selection:text-[#f5efe6]">
      {/* Quiet Archival Header */}
      <header className="fixed top-0 w-full z-50 bg-[#07080a]/92 backdrop-blur-md border-b border-[#baa36d]/20 shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
        <div className="h-16 max-w-[1180px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/case"
              className="font-space-mono text-xs text-[#cbd5e1] hover:text-[#cfbc8c] transition-colors flex items-center gap-1.5"
            >
              ← Return to Archive
            </Link>
            <span className="text-[#64748b]/40 font-space-mono text-xs">/</span>
            <span className="font-space-mono text-xs text-[#cfbc8c] tracking-wider uppercase font-semibold">
              CASE FILE // NO. 04
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggleAudio}
              aria-label="Toggle Ambient Sound"
              className="h-8 px-3 bg-[#160e0a] hover:bg-[#22150e] text-[#cbd5e1] hover:text-[#cfbc8c] flex items-center gap-2 transition-colors rounded border border-[#baa36d]/25 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">
                {ambientActive ? 'volume_up' : 'volume_off'}
              </span>
              <span className="font-space-mono text-[10px] tracking-widest uppercase hidden sm:inline font-semibold">
                {ambientActive ? 'Ambient Audio' : 'Muted'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Scene Container */}
      <main className="w-full pt-20 bg-[#07080a] flex-1 flex flex-col">
        <div className="flex flex-col w-full relative min-h-full items-center justify-start overflow-hidden px-4 md:px-8 py-6 select-none">
          {/* Subtle Warm Dark Walnut & Burgundy Atmosphere */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[#3a101f]/20 rounded-full blur-[160px]"></div>
            <div className="ambient-dust-mote w-2 h-2 top-1/4 left-1/3"></div>
            <div className="ambient-dust-mote w-2.5 h-2.5 top-1/3 right-1/4"></div>
            <div className="ambient-dust-mote w-1.5 h-1.5 bottom-1/3 left-1/5"></div>
          </div>

          {/* Title Header Section */}
          <div className="relative z-10 w-full max-w-[880px] mb-8 text-center flex flex-col items-center">
            <span className="font-space-mono text-[11px] text-[#cfbc8c] tracking-[0.3em] uppercase font-bold mb-1.5">
              CASE FILE // NO. 04
            </span>
            <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl text-[#f5efe6] tracking-tight font-bold drop-shadow-md">
              THE RESTRICTED RECORD
            </h1>
            <p className="font-eb-garamond italic text-lg md:text-xl text-[#d6cbb8] max-w-xl mt-2 leading-relaxed">
              "A sealed record, waiting behind four numbers."
            </p>
          </div>

          {/* Main Physical Chest Structure Container */}
          <div className="relative z-10 w-full max-w-[880px] flex flex-col items-center">
            <div className="w-full relative rounded-lg bg-[#0c0d0f] p-4 md:p-8 shadow-[0_35px_90px_rgba(0,0,0,0.96)] border border-[#baa36d]/35 overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#baa36d_1px,transparent_1px)] [background-size:24px_24px]"></div>

              <div className="relative w-full max-w-[800px] mx-auto transition-all duration-700 ease-out">
                {/* =========================================================================
                    STATE 0: CHEST LOCKED (Physical Chest Exterior)
                   ========================================================================= */}
                {chestStage === 'CHEST_LOCKED' && (
                  <div className="restricted-record-chest p-6 md:p-12 flex flex-col items-center justify-center transition-all duration-500">
                    {/* Brass Hardware Corner Brackets */}
                    <div className="brass-corner-tl"></div>
                    <div className="brass-corner-tr"></div>
                    <div className="brass-corner-bl"></div>
                    <div className="brass-corner-br"></div>

                    {/* Dark Walnut Grain Overlay */}
                    <div className="absolute inset-0 rounded-lg pointer-events-none opacity-40 bg-[linear-gradient(90deg,#120b07_0%,#342217_25%,#22150e_50%,#342217_75%,#120b07_100%)]"></div>

                    {/* Physical Warning Seal Plaque */}
                    <div className="relative z-10 mb-8 px-8 py-3 bg-gradient-to-b from-[#8c7643] via-[#baa36d] to-[#594926] rounded shadow-lg flex flex-col items-center text-center border-t border-b border-[#f5efe6]/40">
                      <span className="font-space-mono text-[11px] text-[#07080a] tracking-[0.3em] font-bold uppercase">
                        THE SEAL
                      </span>
                    </div>

                    {/* Embedded Recessed Cipher Panel */}
                    <div className="relative z-10 w-full max-w-md recessed-cipher-panel p-6 md:p-8 flex flex-col items-center text-center mx-auto">
                      <span className="font-space-mono text-xs text-[#cfbc8c] tracking-[0.22em] uppercase mb-1 font-bold">
                        FOUR-DIGIT SEAL
                      </span>
                      <p className="font-eb-garamond italic text-sm text-[#d6cbb8]/90 mb-5">
                        ALIGN THE TUMBLERS TO RELEASE THE CHEST
                      </p>

                      {/* 4 Mechanical Tumbler Dials */}
                      <div className="flex items-center justify-center gap-3 md:gap-4 my-2">
                        {digits.map((val, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => adjustDigit(idx, 1)}
                              aria-label={`Increment dial ${idx + 1}`}
                              className="w-9 h-7 bg-[#22150e] hover:bg-[#342217] text-[#cfbc8c] flex items-center justify-center rounded border border-[#baa36d]/35 transition-colors active:scale-95 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">expand_less</span>
                            </button>
                            <div className="tumbler-dial-digit">
                              {val}
                            </div>
                            <button
                              type="button"
                              onClick={() => adjustDigit(idx, -1)}
                              aria-label={`Decrement dial ${idx + 1}`}
                              className="w-9 h-7 bg-[#22150e] hover:bg-[#342217] text-[#cfbc8c] flex items-center justify-center rounded border border-[#baa36d]/35 transition-colors active:scale-95 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Cipher Feedback */}
                      <div className={`min-h-[22px] mt-3 mb-5 font-space-mono text-[11px] tracking-wider uppercase font-semibold transition-opacity ${cipherError?.includes('INCORRECT') ? 'text-red-400' : 'text-[#cfbc8c]'}`}>
                        {cipherError || 'PRESET COMBINATION [1984]'}
                      </div>

                      {/* Integrated Physical Action Button */}
                      <button
                        type="button"
                        onClick={attemptUnlock}
                        disabled={isReleasingPins}
                        className="w-full py-4 px-6 physical-unlock-btn font-space-mono font-bold text-xs tracking-[0.25em] uppercase rounded text-[#07080a] flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        {isReleasingPins ? (
                          <>
                            <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                            <span>RELEASING HASP...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-lg">key</span>
                            <span>OPEN THE CHEST</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    STATE: CHEST OPENING (GSAP Physical Animated Sequence)
                   ========================================================================= */}
                {chestStage === 'CHEST_OPENING' && (
                  <div className="relative w-full min-h-[380px] restricted-record-chest rounded-lg p-8 flex flex-col items-center justify-center border border-[#baa36d]/50 shadow-2xl overflow-hidden">
                    <div ref={chestLidRef} className="relative z-20 flex flex-col items-center text-center p-6 bg-[#160e0a] rounded border border-[#baa36d]/40 shadow-xl">
                      <span className="font-space-mono text-xs text-[#cfbc8c] tracking-widest uppercase mb-2 font-bold">
                        UNLATCHING LOCK HASP...
                      </span>
                      <h2 className="font-cormorant text-2xl text-[#f5efe6] font-bold">
                        Record Lid Opening
                      </h2>
                    </div>

                    <div ref={interiorChamberRef} className="absolute inset-0 bg-[#07080a] flex flex-col items-center justify-center p-8 z-10">
                      <div className="w-16 h-16 rounded-full bg-[#3a101f]/60 border border-[#baa36d]/60 flex items-center justify-center animate-pulse mb-3">
                        <span className="material-symbols-outlined text-3xl text-[#cfbc8c]">light_mode</span>
                      </div>
                      <span className="font-space-mono text-xs text-[#cfbc8c] tracking-widest uppercase font-bold">
                        REVEALING INNER ARCHIVAL CHAMBER
                      </span>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    RECORD I PRESENTATION (RECORD_1_READY) — PERSONAL ARCHIVE
                   ========================================================================= */}
                {chestStage === 'RECORD_1_READY' && (
                  <div ref={interiorChamberRef} className="relative w-full burgundy-velvet-chamber rounded-lg p-6 md:p-10 flex flex-col items-center">
                    <div
                      ref={recordCardRef}
                      onClick={startRecord1}
                      className="w-full max-w-xl mx-auto personal-record-card cursor-pointer group"
                    >
                      {/* Small Archival Label */}
                      <span className="font-space-mono text-xs text-[#cfbc8c] tracking-[0.25em] uppercase font-bold mb-1">
                        {record1Data.label}
                      </span>

                      {/* Large Record Title */}
                      <h2 className="font-cormorant text-3xl md:text-4xl text-[#f5efe6] font-bold tracking-tight">
                        {record1Data.title}
                      </h2>

                      {/* Short Personal Description */}
                      <p className="font-eb-garamond italic text-lg text-[#cbd5e1] max-w-md mx-auto mt-2 leading-relaxed">
                        "{record1Data.description}"
                      </p>

                      {/* Physical Record Spool Object */}
                      <div className="personal-record-spool-wrapper my-6">
                        <div className="personal-record-spool-circle flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-[#1c070e] border border-[#baa36d]/50 flex flex-col items-center justify-center p-3 shadow-inner">
                            <span className="material-symbols-outlined text-[54px] text-[#cfbc8c] group-hover:text-[#f5efe6] transition-colors">
                              album
                            </span>
                            {record1Data.identifier && (
                              <span className="font-space-mono text-[9px] text-[#cfbc8c]/80 tracking-widest mt-1 font-bold">
                                {record1Data.identifier}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Primary Play Action Button */}
                      <div className="w-full max-w-sm mt-2 flex items-center justify-center">
                        <button
                          type="button"
                          className="w-full py-3.5 px-6 bg-[#baa36d] group-hover:bg-[#cfbc8c] text-[#07080a] font-space-mono font-bold text-xs tracking-[0.22em] uppercase rounded shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">play_circle</span>
                          <span>PLAY RECORD I</span>
                        </button>
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between pt-6 mt-6 border-t border-[#baa36d]/20 text-[#cbd5e1]">
                      <span className="font-space-mono text-[10px] text-[#cfbc8c]/80 font-bold">
                        RECORD I // PERSONAL ARCHIVE
                      </span>
                      <button
                        type="button"
                        onClick={handleLockAgain}
                        className="font-space-mono text-xs text-[#cbd5e1] hover:text-[#cfbc8c] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span>Re-lock Record</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    RECORD II PRESENTATION (RECORD_2_READY) — PERSONAL ARCHIVE
                   ========================================================================= */}
                {chestStage === 'RECORD_2_READY' && (
                  <div className="relative w-full burgundy-velvet-chamber rounded-lg p-6 md:p-10 flex flex-col items-center">
                    <div
                      ref={recordCardRef}
                      onClick={startRecord2}
                      className="w-full max-w-xl mx-auto personal-record-card cursor-pointer group"
                    >
                      {/* Small Archival Label */}
                      <span className="font-space-mono text-xs text-[#cfbc8c] tracking-[0.25em] uppercase font-bold mb-1">
                        {record2Data.label}
                      </span>

                      {/* Large Record Title */}
                      <h2 className="font-cormorant text-3xl md:text-4xl text-[#f5efe6] font-bold tracking-tight">
                        {record2Data.title}
                      </h2>

                      {/* Short Personal Description */}
                      <p className="font-eb-garamond italic text-lg text-[#cbd5e1] max-w-md mx-auto mt-2 leading-relaxed">
                        "{record2Data.description}"
                      </p>

                      {/* Physical Record Spool Object */}
                      <div className="personal-record-spool-wrapper my-6">
                        <div className="personal-record-spool-circle flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-[#1c070e] border border-[#baa36d]/50 flex flex-col items-center justify-center p-3 shadow-inner">
                            <span className="material-symbols-outlined text-[54px] text-[#cfbc8c] group-hover:text-[#f5efe6] transition-colors">
                              nightlight
                            </span>
                            {record2Data.identifier && (
                              <span className="font-space-mono text-[9px] text-[#cfbc8c]/80 tracking-widest mt-1 font-bold">
                                {record2Data.identifier}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Primary Play Action Button */}
                      <div className="w-full max-w-sm mt-2 flex items-center justify-center">
                        <button
                          type="button"
                          className="w-full py-3.5 px-6 bg-[#baa36d] group-hover:bg-[#cfbc8c] text-[#07080a] font-space-mono font-bold text-xs tracking-[0.22em] uppercase rounded shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">play_circle</span>
                          <span>PLAY RECORD II</span>
                        </button>
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between pt-6 mt-6 border-t border-[#baa36d]/20 text-[#cbd5e1]">
                      <span className="font-space-mono text-[10px] text-[#cfbc8c]/80 font-bold">
                        RECORD II // PERSONAL ARCHIVE
                      </span>
                      <button
                        type="button"
                        onClick={handleLockAgain}
                        className="font-space-mono text-xs text-[#cbd5e1] hover:text-[#cfbc8c] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span>Re-lock Record</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    KEY REVEAL (KEY_REVEAL)
                   ========================================================================= */}
                {chestStage === 'KEY_REVEAL' && (
                  <div ref={keyCompartmentRef} className="relative w-full burgundy-velvet-chamber rounded-lg p-6 md:p-8 flex flex-col gap-6">
                    {/* Top Metadata */}
                    <div className="w-full flex items-center justify-between pb-3 border-b border-[#baa36d]/30">
                      <span className="font-space-mono text-xs text-[#cfbc8c] uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">workspace_premium</span> ARCHIVE RECOVERY // FINAL ARTIFACT
                      </span>
                      <span className="font-space-mono text-[10px] text-[#cbd5e1] tracking-wider uppercase font-semibold">
                        DESK DRAWER ACCESS
                      </span>
                    </div>

                    {/* Main Presentation Area */}
                    <div className="w-full max-w-xl mx-auto key-sanctum-pedestal rounded-lg p-6 md:p-8 flex flex-col items-center text-center shadow-2xl">
                      {/* Key Presentation with Warm Brass Illumination */}
                      <div className="relative w-full py-6 flex flex-col items-center justify-center min-h-[200px]">
                        <div className="absolute w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(207,188,140,0.22)_0%,rgba(186,163,109,0.06)_50%,transparent_75%)] pointer-events-none blur-xl animate-pulse" />
                        <div className="relative z-10 flex items-center justify-center">
                          <div
                            ref={keyPedestalRef}
                            className="key-levitate p-5 rounded-full bg-gradient-to-b from-[#cfbc8c] via-[#baa36d] to-[#7a6438] shadow-[0_10px_35px_rgba(0,0,0,0.95),0_0_30px_rgba(207,188,140,0.45)] border border-[#f5efe6]/60 cursor-pointer transition-transform hover:scale-105"
                            onClick={acquireMasterKey}
                            title="The Sanctum Brass Key"
                            aria-label="Acquire The Sanctum Brass Key"
                          >
                            <span
                              className="material-symbols-outlined text-[60px] text-[#07080a] block select-none"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              vpn_key
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content Hierarchy */}
                      <div className="mt-2 space-y-1.5">
                        <span className="font-space-mono text-[10px] text-[#cfbc8c] tracking-[0.25em] uppercase font-bold block">
                          KEY RECOVERY // DESK DRAWER
                        </span>
                        <h1 className="font-cormorant text-4xl md:text-5xl text-[#f5efe6] font-bold tracking-tight leading-tight">
                          THE DESK DRAWER KEY
                        </h1>
                        <h2 className="font-cormorant text-2xl text-[#cfbc8c] italic font-medium">
                          THE SANCTUM BRASS KEY
                        </h2>
                        <p className="font-eb-garamond text-lg md:text-xl text-[#e8e1d5]/95 italic max-w-md mx-auto pt-3 leading-relaxed">
                          "Some doors are meant to remain closed. This one has been waiting for you."
                        </p>
                        <p className="font-eb-garamond text-sm text-[#cbd5e1]/80 max-w-md mx-auto pt-1">
                          "Recovered from the sealed archive. Its purpose is known."
                        </p>
                      </div>

                      {/* Primary CTA */}
                      <div className="w-full mt-8 pt-5 border-t border-[#baa36d]/30">
                        <button
                          type="button"
                          onClick={acquireMasterKey}
                          className="w-full py-4 px-6 bg-gradient-to-r from-[#8c7643] via-[#baa36d] to-[#8c7643] hover:brightness-110 text-[#07080a] font-space-mono font-bold text-xs tracking-[0.22em] uppercase rounded shadow-[0_6px_30px_rgba(186,163,109,0.35)] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            vpn_key
                          </span>
                          <span>ACQUIRE DESK DRAWER KEY</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    KEY ACQUIRED (KEY_ACQUIRED)
                   ========================================================================= */}
                {chestStage === 'KEY_ACQUIRED' && (
                  <div className="relative w-full burgundy-velvet-chamber rounded-lg p-6 md:p-8 flex flex-col gap-6">
                    {/* Top Metadata */}
                    <div className="w-full flex items-center justify-between pb-3 border-b border-[#baa36d]/30">
                      <span className="font-space-mono text-xs text-[#cfbc8c] uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">verified</span> ARCHIVE RECOVERY // FINAL ARTIFACT
                      </span>
                      <span className="font-space-mono text-[10px] text-[#34d399] tracking-wider uppercase font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span> DESK DRAWER ACCESS
                      </span>
                    </div>

                    {/* Main Presentation Area */}
                    <div className="w-full max-w-xl mx-auto key-sanctum-pedestal rounded-lg p-6 md:p-8 flex flex-col items-center text-center shadow-2xl">
                      <div className="relative my-3 flex items-center justify-center">
                        <div className="absolute w-36 h-36 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.15)_0%,rgba(186,163,109,0.1)_50%,transparent_75%)] pointer-events-none blur-lg" />
                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#cfbc8c] to-[#8c7643] p-0.5 shadow-xl flex items-center justify-center relative z-10">
                          <div className="w-full h-full rounded-full bg-[#07080a] flex items-center justify-center text-[#cfbc8c]">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              vpn_key
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-space-mono text-[10px] text-[#cfbc8c] tracking-[0.25em] uppercase font-bold block">
                          KEY RECOVERY // DESK DRAWER
                        </span>
                        <h1 className="font-cormorant text-4xl md:text-5xl text-[#f5efe6] font-bold tracking-tight leading-tight">
                          THE DESK DRAWER KEY
                        </h1>
                        <h2 className="font-cormorant text-2xl text-[#cfbc8c] italic font-medium">
                          THE SANCTUM BRASS KEY
                        </h2>
                        <p className="font-eb-garamond text-lg md:text-xl text-[#e8e1d5]/95 italic max-w-md mx-auto pt-3 leading-relaxed">
                          "Some doors are meant to remain closed. This one has been waiting for you."
                        </p>
                        <p className="font-eb-garamond text-sm text-[#cbd5e1]/80 max-w-md mx-auto pt-1">
                          "Recovered from the sealed archive. Its purpose is known."
                        </p>
                      </div>

                      {/* Post Acquisition Navigation Actions */}
                      <div className="w-full mt-8 pt-5 border-t border-[#baa36d]/30 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigate('/drawer')}
                          className="w-full sm:flex-1 py-3.5 px-6 bg-[#18080f] hover:bg-[#260c16] text-[#cfbc8c] hover:text-[#f5efe6] font-space-mono font-bold text-xs tracking-widest uppercase rounded border border-[#baa36d]/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <span>CONTINUE TO DESK DRAWER</span>
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/case')}
                          className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-[#8c7643] via-[#baa36d] to-[#8c7643] hover:brightness-110 text-[#07080a] font-space-mono font-bold text-xs tracking-widest uppercase rounded shadow-[0_4px_25px_rgba(186,163,109,0.35)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-lg">arrow_back</span>
                          <span>RETURN TO ARCHIVE</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#baa36d]/20 text-[#cbd5e1]">
                      <span className="font-space-mono text-[10px] text-[#cfbc8c] font-bold">NLUJA-ARCH-1984-L3</span>
                      <button
                        type="button"
                        onClick={handleLockAgain}
                        className="font-space-mono text-xs text-[#cbd5e1] hover:text-[#cfbc8c] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span>Re-engage Record Lid & Cipher</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Archival Bottom Footer Metadata */}
          <div className="relative z-10 mt-8 text-center">
            <span className="font-space-mono text-[10px] text-[#cfbc8c]/60 tracking-[0.25em] uppercase font-bold">
              NLUJA ASSAM • RESTRICTED ARCHIVE
            </span>
          </div>
        </div>
      </main>

      {/* =========================================================================
          MODAL: ARCHIVAL VIDEO THEATER (WITH FINISH VIDEO OPTION)
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#07080a]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto theater-overlay">
          <div className="relative w-full max-w-3xl theater-content rounded-lg p-5 md:p-8 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#baa36d]/30">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#cfbc8c] animate-pulse"></span>
                  <span className="font-space-mono text-xs text-[#cfbc8c] tracking-widest uppercase font-bold">
                    {currentRecordData.label} // {currentRecordData.identifier || 'ARCHIVE'}
                  </span>
                </div>
                <h2 className="font-cormorant text-2xl text-[#f5efe6] font-bold mt-0.5">
                  {currentRecordData.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeVideoPlayerModal}
                aria-label="Close Archival Theater"
                className="w-9 h-9 rounded bg-[#260c16] hover:bg-[#3a101f] text-[#cbd5e1] hover:text-[#f5efe6] flex items-center justify-center border border-[#baa36d]/35 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Video Player Container */}
            <div className="relative w-full min-h-[320px] max-h-[68vh] bg-black rounded overflow-hidden flex items-center justify-center shadow-inner border border-[#baa36d]/40">
              <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                onEnded={() => handleVideoEnded(currentRecordNum)}
                src={currentRecordData.videoPath}
                className="w-full h-full max-h-[68vh] object-contain bg-black archival-video-element"
              >
                Your browser does not support judicial video archival playback.
              </video>
            </div>

            {/* Modal Controls / User-Controlled Progression Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#baa36d]/30 text-[#cbd5e1]">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${chestStage.endsWith('_COMPLETE') ? 'bg-emerald-400' : 'bg-[#cfbc8c] animate-pulse'}`}></span>
                <span className="font-space-mono text-xs text-[#cfbc8c] uppercase tracking-wider font-bold">
                  {chestStage === 'RECORD_1_PLAYING' && 'Record I Playing...'}
                  {chestStage === 'RECORD_1_COMPLETE' && 'Record I Playback Complete'}
                  {chestStage === 'RECORD_2_PLAYING' && 'Record II Playing...'}
                  {chestStage === 'RECORD_2_COMPLETE' && 'Record II Playback Complete'}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap justify-end">
                {/* FINISH VIDEO SECONDARY CONTROL */}
                {isActivelyPlaying && (
                  <button
                    type="button"
                    onClick={finishVideoEarly}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#260c16] hover:bg-[#3a101f] text-[#cfbc8c] hover:text-[#f5efe6] font-space-mono text-xs font-bold tracking-wider uppercase rounded border border-[#baa36d]/45 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <span className="material-symbols-outlined text-base">task_alt</span>
                    <span>FINISH VIDEO</span>
                  </button>
                )}

                {/* RECORD I COMPLETE ACTION */}
                {chestStage === 'RECORD_1_COMPLETE' && (
                  <button
                    type="button"
                    onClick={continueToRecord2}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#8c7643] via-[#baa36d] to-[#8c7643] hover:brightness-110 text-[#07080a] font-space-mono font-bold text-xs tracking-widest uppercase rounded shadow-[0_4px_20px_rgba(186,163,109,0.35)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                  >
                    <span>CONTINUE TO RECORD II</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                )}

                {/* RECORD II COMPLETE ACTION */}
                {chestStage === 'RECORD_2_COMPLETE' && (
                  <button
                    type="button"
                    onClick={continueToKeyReveal}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#8c7643] via-[#baa36d] to-[#8c7643] hover:brightness-110 text-[#07080a] font-space-mono font-bold text-xs tracking-widest uppercase rounded shadow-[0_4px_20px_rgba(186,163,109,0.35)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                  >
                    <span>REVEAL THE DESK DRAWER KEY</span>
                    <span className="material-symbols-outlined text-base">vpn_key</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeVideoPlayerModal}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#160e0a] hover:bg-[#22150e] text-[#cbd5e1] hover:text-[#f5efe6] font-space-mono text-xs tracking-wider uppercase rounded transition-colors cursor-pointer border border-[#baa36d]/20"
                >
                  Close Theater
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forbidden;
