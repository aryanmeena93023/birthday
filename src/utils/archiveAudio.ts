// Web Audio API synthesizer utilities for The Archive
let audioCtx: AudioContext | null = null;
let droneOsc1: OscillatorNode | null = null;
let droneOsc2: OscillatorNode | null = null;
let droneFilter: BiquadFilterNode | null = null;
let droneGain: GainNode | null = null;
let isAmbiencePlaying = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
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
          } catch {}
        }, 900);
      }
    } catch {}
    isAmbiencePlaying = false;
    onStateChange?.(false);
    return false;
  }
}

export function isAmbienceActive(): boolean {
  return isAmbiencePlaying;
}
