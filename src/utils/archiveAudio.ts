// Web Audio API synthesizer utilities for The Archive
let audioCtx: AudioContext | null = null;
let droneOsc1: OscillatorNode | null = null;
let droneOsc2: OscillatorNode | null = null;
let droneFilter: BiquadFilterNode | null = null;
let droneGain: GainNode | null = null;
let isAmbiencePlaying = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => { });
  }
  return audioCtx;
}

export function playArtifactChime(pitch = 440): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.25);
  } catch {
    // Graceful fallback
  }
}

export function playDialClick(pitch = 340): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Graceful fallback
  }
}

export function playUnlockChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0.06, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.85);
    });
  } catch {
    // Graceful fallback
  }
}

export function toggleAmbienceDrone(onStateChange?: (playing: boolean) => void): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (!isAmbiencePlaying) {
    try {
      droneOsc1 = ctx.createOscillator();
      droneOsc2 = ctx.createOscillator();
      droneFilter = ctx.createBiquadFilter();
      droneGain = ctx.createGain();

      droneOsc1.type = 'triangle';
      droneOsc1.frequency.setValueAtTime(55, ctx.currentTime); // Low A

      droneOsc2.type = 'sine';
      droneOsc2.frequency.setValueAtTime(82.4, ctx.currentTime); // E

      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(260, ctx.currentTime);

      droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
      droneGain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 1.5);

      droneOsc1.connect(droneFilter);
      droneOsc2.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(ctx.destination);

      droneOsc1.start();
      droneOsc2.start();

      isAmbiencePlaying = true;
      onStateChange?.(true);
      return true;
    } catch {
      return false;
    }
  } else {
    try {
      if (droneGain) {
        droneGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        setTimeout(() => {
          try {
            droneOsc1?.stop();
            droneOsc2?.stop();
          } catch { }
        }, 900);
      }
    } catch { }
    isAmbiencePlaying = false;
    onStateChange?.(false);
    return false;
  }
}

export function stopAmbienceDrone(): void {
  if (!isAmbiencePlaying) return;
  const ctx = getAudioContext();
  if (ctx && droneGain) {
    try {
      droneGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      droneOsc1?.stop();
      droneOsc2?.stop();
    } catch { }
  }
  isAmbiencePlaying = false;
}

export function isAmbienceActive(): boolean {
  return isAmbiencePlaying;
}

// Dedicated single soundtrack manager for Page 2 Archive Desk
let archiveSoundtrackAudio: HTMLAudioElement | null = null;
let isArchiveManuallyMuted = false;

export function getArchiveSoundtrack(): HTMLAudioElement {
  if (!archiveSoundtrackAudio && typeof window !== 'undefined') {
    archiveSoundtrackAudio = new Audio('/media/audio/archive-ambience.mpeg');
    archiveSoundtrackAudio.loop = true;
    archiveSoundtrackAudio.volume = 0.28;
    archiveSoundtrackAudio.preload = 'auto';
  }
  return archiveSoundtrackAudio!;
}

export function playArchiveSoundtrack(): Promise<void> | undefined {
  const audio = getArchiveSoundtrack();
  if (!audio) return;
  isArchiveManuallyMuted = false;
  audio.muted = false;
  return audio.play();
}

export function pauseAndResetArchiveSoundtrack(): void {
  if (archiveSoundtrackAudio) {
    archiveSoundtrackAudio.pause();
    archiveSoundtrackAudio.currentTime = 0;
  }
}

export function setArchiveManuallyMuted(muted: boolean): void {
  isArchiveManuallyMuted = muted;
}

export function isArchiveManuallyMutedState(): boolean {
  return isArchiveManuallyMuted;
}

let letterOpeningAudio: HTMLAudioElement | null = null;

export function playLetterOpeningSound(): void {
  try {
    if (typeof window === 'undefined') return;
    if (isArchiveManuallyMutedState()) return;
    if (!letterOpeningAudio) {
      letterOpeningAudio = new Audio('/audio/letter-opening.mp3');
      letterOpeningAudio.volume = 1.0;
      letterOpeningAudio.preload = 'auto';
    } else {
      letterOpeningAudio.volume = 1.0;
    }
    letterOpeningAudio.currentTime = 0;
    const playPromise = letterOpeningAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Safe catch so playback errors do not disrupt the UI or navigation
      });
    }
  } catch {
    // Fallback safe catch
  }
}

export function stopLetterOpeningSound(): void {
  if (letterOpeningAudio) {
    try {
      letterOpeningAudio.pause();
      letterOpeningAudio.currentTime = 0;
    } catch { }
  }
}

// Dedicated looping audio manager for the Academy Gate Entry Page
let academyGateAudio: HTMLAudioElement | null = null;
let isGateAmbienceUserMuted = false;
let isGateEntering = false;
let gateFadeTimer: number | null = null;
let gateFadeInterval: number | null = null;
const GATE_TARGET_VOLUME = 1.0;

export function getAcademyGateAmbience(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!academyGateAudio) {
    academyGateAudio = new Audio('/audio/academy-gate-ambience.mp3');
    academyGateAudio.loop = true;
    academyGateAudio.volume = GATE_TARGET_VOLUME;
    academyGateAudio.preload = 'auto';
  }
  return academyGateAudio;
}

export function cancelGateAmbienceFade(): void {
  if (typeof window !== 'undefined') {
    if (gateFadeTimer !== null) {
      window.clearTimeout(gateFadeTimer);
      gateFadeTimer = null;
    }
    if (gateFadeInterval !== null) {
      window.clearInterval(gateFadeInterval);
      gateFadeInterval = null;
    }
  }
}

export function playAcademyGateAmbience(fadeIn = false): Promise<void> | undefined {
  try {
    if (typeof window === 'undefined') return;
    if (isGateAmbienceUserMuted || isGateEntering) return;
    const audio = getAcademyGateAmbience();
    if (!audio) return;
    audio.loop = true;

    if (!fadeIn) {
      cancelGateAmbienceFade();
      audio.volume = GATE_TARGET_VOLUME;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { });
      }
      return playPromise;
    }

    // Cancel any previous fade operations before scheduling a new one
    cancelGateAmbienceFade();

    // 0.5s pause before starting the fade-in
    gateFadeTimer = window.setTimeout(() => {
      gateFadeTimer = null;
      if (isGateAmbienceUserMuted || isGateEntering) return;

      audio.volume = 0.01;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { });
      }

      // Smooth fade-in over 1.5 seconds (1500ms) in 30 steps of 50ms
      const fadeDuration = 1500;
      const stepInterval = 50;
      const totalSteps = fadeDuration / stepInterval;
      const volumeStep = (GATE_TARGET_VOLUME - 0.01) / totalSteps;
      let currentStep = 0;

      gateFadeInterval = window.setInterval(() => {
        if (isGateAmbienceUserMuted || isGateEntering || !audio) {
          cancelGateAmbienceFade();
          return;
        }

        currentStep++;
        const nextVolume = Math.min(GATE_TARGET_VOLUME, 0.01 + volumeStep * currentStep);
        audio.volume = nextVolume;

        if (currentStep >= totalSteps || nextVolume >= GATE_TARGET_VOLUME) {
          audio.volume = GATE_TARGET_VOLUME;
          cancelGateAmbienceFade();
        }
      }, stepInterval);
    }, 500);
  } catch {
    // Safe fallback
  }
}

export function stopAcademyGateAmbience(permanent = false): void {
  if (permanent) {
    isGateEntering = true;
  }
  cancelGateAmbienceFade();
  if (academyGateAudio) {
    try {
      academyGateAudio.pause();
      academyGateAudio.currentTime = 0;
      academyGateAudio.volume = GATE_TARGET_VOLUME;
    } catch { }
  }
}

export function resetGateEnteringState(): void {
  isGateEntering = false;
}

export function setGateAmbienceMuted(muted: boolean): void {
  isGateAmbienceUserMuted = muted;
  if (muted) {
    cancelGateAmbienceFade();
    if (academyGateAudio) {
      academyGateAudio.pause();
    }
  } else {
    playAcademyGateAmbience(false);
  }
}

export function isGateAmbienceActive(): boolean {
  return !isGateAmbienceUserMuted && !isGateEntering && (
    gateFadeTimer !== null ||
    gateFadeInterval !== null ||
    (!!academyGateAudio && !academyGateAudio.paused)
  );
}

// File No. 03 (Hedwig) Background Ambience Music
let hedwigAudio: HTMLAudioElement | null = null;
let hedwigFadeTimer: number | null = null;
let hedwigFadeInterval: number | null = null;
export const HEDWIG_TARGET_VOLUME = 0.45;

function cancelHedwigFade(): void {
  if (hedwigFadeTimer !== null) {
    clearTimeout(hedwigFadeTimer);
    hedwigFadeTimer = null;
  }
  if (hedwigFadeInterval !== null) {
    clearInterval(hedwigFadeInterval);
    hedwigFadeInterval = null;
  }
}

function getHedwigAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!hedwigAudio) {
    try {
      hedwigAudio = new Audio('/audio/hedwig/friendship-to-be.mp3');
      hedwigAudio.loop = true;
      hedwigAudio.preload = 'auto';
      hedwigAudio.volume = 0.0;
      hedwigAudio.style.display = 'none';
      if (document.body) {
        document.body.appendChild(hedwigAudio);
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          if (hedwigAudio && !document.body.contains(hedwigAudio)) {
            document.body.appendChild(hedwigAudio);
          }
        });
      }
      (window as any).__hedwigAudio = hedwigAudio;
    } catch {
      hedwigAudio = null;
    }
  } else if (document.body && !document.body.contains(hedwigAudio)) {
    document.body.appendChild(hedwigAudio);
  }
  return hedwigAudio;
}

export function isHedwigAmbiencePlaying(): boolean {
  return !!hedwigAudio && !hedwigAudio.paused;
}

export function playHedwigAmbience(fadeIn = true, forceRestart = false): void {
  try {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/raven')) {
      return;
    }

    const audio = getHedwigAudio();
    if (!audio) return;

    if (forceRestart) {
      try {
        audio.currentTime = 0;
      } catch { }
    } else {
      // If it's already playing, do NOT restart or modify playback position
      if (!audio.paused) {
        return;
      }
    }

    cancelHedwigFade();

    if (!fadeIn) {
      audio.volume = HEDWIG_TARGET_VOLUME;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/raven')) {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0.0;
          }
        }).catch(() => { });
      }
      return;
    }

    // Start with volume ramp from 0.0 or current volume
    audio.volume = 0.0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/raven')) {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0.0;
        }
      }).catch(() => { });
    }

    // Smooth linear fade-in over 4 seconds (4000ms) in 80 steps of 50ms
    const fadeDuration = 4000;
    const stepInterval = 50;
    const totalSteps = fadeDuration / stepInterval;
    const volumeStep = HEDWIG_TARGET_VOLUME / totalSteps;
    let currentStep = 0;

    hedwigFadeInterval = window.setInterval(() => {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/raven')) {
        cancelHedwigFade();
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0.0;
        }
        return;
      }

      if (!audio || audio.paused) {
        cancelHedwigFade();
        return;
      }

      currentStep++;
      const nextVolume = Math.min(HEDWIG_TARGET_VOLUME, volumeStep * currentStep);
      audio.volume = nextVolume;

      if (currentStep >= totalSteps || nextVolume >= HEDWIG_TARGET_VOLUME) {
        audio.volume = HEDWIG_TARGET_VOLUME;
        cancelHedwigFade();
      }
    }, stepInterval);
  } catch {
    // Safe fallback
  }
}

export function stopHedwigAmbience(): void {
  cancelHedwigFade();
  if (hedwigAudio) {
    try {
      hedwigAudio.pause();
      hedwigAudio.currentTime = 0;
      hedwigAudio.volume = 0.0;
    } catch { }
  }
}
