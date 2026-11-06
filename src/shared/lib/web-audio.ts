/**
 * Shared Web Audio context: master gain, mute and the end-of-session chime (FR-07, FR-08).
 * Everything is synthesized locally, no audio file is ever downloaded.
 */

const CHIME_FREQUENCIES = [587.33, 880.0] as const; // D5 and A5
const CHIME_PEAK_GAIN = 0.5;
const CHIME_ATTACK_SECONDS = 0.02;
const CHIME_DECAY_SECONDS = 1.2;
const SILENT_GAIN = 0.0001; // exponential ramps cannot reach 0

type AudioContextConstructor = typeof AudioContext;

let context: AudioContext | null = null;
let masterGain: GainNode | null = null;
let masterVolume = 0.8;
let muted = false;
const muteListeners = new Set<(isMuted: boolean) => void>();

function resolveConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null;
  const legacy = window as unknown as { webkitAudioContext?: AudioContextConstructor };
  return window.AudioContext ?? legacy.webkitAudioContext ?? null;
}

function applyMasterGain(): void {
  if (masterGain) masterGain.gain.value = muted ? 0 : masterVolume;
}

/** Autoplay policy: a suspended context is resumed by the first user gesture (ARCHITECTURE 14.2). */
function resumeOnFirstGesture(target: AudioContext): void {
  const resume = () => {
    void target.resume().catch(() => {});
    window.removeEventListener('pointerdown', resume);
    window.removeEventListener('keydown', resume);
  };
  window.addEventListener('pointerdown', resume);
  window.addEventListener('keydown', resume);
}

function getContext(): AudioContext | null {
  if (context) return context;
  const Constructor = resolveConstructor();
  if (!Constructor) return null;
  try {
    context = new Constructor();
  } catch {
    return null;
  }
  masterGain = context.createGain();
  applyMasterGain();
  masterGain.connect(context.destination);
  if (context.state === 'suspended') resumeOnFirstGesture(context);
  return context;
}

/** Creates (or resumes) the context; call it from a user gesture such as pressing Start. */
export async function initAudioContext(): Promise<void> {
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') await ctx.resume().catch(() => {});
}

export function setMasterVolume(volume: number): void {
  masterVolume = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0));
  applyMasterGain();
}

export function getMasterVolume(): number {
  return masterVolume;
}

export function isMuted(): boolean {
  return muted;
}

/** Toggles the global mute (key M) and returns the new state. */
export function toggleMasterMute(): boolean {
  muted = !muted;
  applyMasterGain();
  muteListeners.forEach((listener) => listener(muted));
  return muted;
}

export function subscribeMute(listener: (isMuted: boolean) => void): () => void {
  muteListeners.add(listener);
  return () => {
    muteListeners.delete(listener);
  };
}

/** Plays the two-tone chime (AC-07.2). Silent when muted or when the master volume is 0. */
export function playChime(): void {
  if (muted || masterVolume <= 0) return;
  const ctx = getContext();
  if (!ctx || !masterGain) return;
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});

  const start = ctx.currentTime;
  const stop = start + CHIME_DECAY_SECONDS + 0.1;
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(SILENT_GAIN, start);
  envelope.gain.linearRampToValueAtTime(CHIME_PEAK_GAIN, start + CHIME_ATTACK_SECONDS);
  envelope.gain.exponentialRampToValueAtTime(SILENT_GAIN, start + CHIME_DECAY_SECONDS);
  envelope.connect(masterGain);

  let remaining = CHIME_FREQUENCIES.length;
  CHIME_FREQUENCIES.forEach((frequency) => {
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(envelope);
    oscillator.onended = () => {
      remaining -= 1;
      if (remaining === 0) envelope.disconnect();
    };
    oscillator.start(start);
    oscillator.stop(stop);
  });
}
