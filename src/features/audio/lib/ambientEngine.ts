import type { AmbientSoundType } from '@/shared/types/contracts';
import { getAudioContext, getMasterGain } from '@/shared/lib/web-audio';
import { createBuffer, fillCrackle, fillNoise } from './noise';

export const AMBIENT_CHANNELS: AmbientSoundType[] = ['rain', 'brownNoise', 'campfire'];

interface Channel {
  gain: GainNode;
  nodes: AudioScheduledSourceNode[];
}

const LOOP_SECONDS = 4;

/** Builds one channel graph; every channel ends in its own GainNode connected to the master gain. */
function buildChannel(type: AmbientSoundType, ctx: AudioContext, master: GainNode): Channel {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  const nodes: AudioScheduledSourceNode[] = [];

  const loop = (buffer: AudioBuffer): AudioBufferSourceNode => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    nodes.push(source);
    return source;
  };

  if (type === 'rain') {
    // White noise through a band-pass and a low-pass whose cutoff drifts like falling drops (AC-16.1).
    const source = loop(createBuffer(ctx, LOOP_SECONDS, (data) => fillNoise(data, 'white')));
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1200;
    bandpass.Q.value = 0.5;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3000;
    for (const [rate, depth] of [
      [0.13, 1200],
      [0.37, 600],
    ] as const) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = rate;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = depth;
      lfo.connect(lfoDepth);
      lfoDepth.connect(lowpass.frequency);
      nodes.push(lfo);
    }
    source.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gain);
  } else if (type === 'brownNoise') {
    const source = loop(createBuffer(ctx, LOOP_SECONDS, (data) => fillNoise(data, 'brown')));
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 700;
    source.connect(lowpass);
    lowpass.connect(gain);
  } else {
    // Warm brown-noise bed plus sparse high-pass crackles (AC-16.4).
    const bed = loop(createBuffer(ctx, LOOP_SECONDS, (data) => fillNoise(data, 'brown')));
    const bedFilter = ctx.createBiquadFilter();
    bedFilter.type = 'lowpass';
    bedFilter.frequency.value = 350;
    const bedGain = ctx.createGain();
    bedGain.gain.value = 0.6;
    bed.connect(bedFilter);
    bedFilter.connect(bedGain);
    bedGain.connect(gain);

    const crackle = loop(createBuffer(ctx, 6, (data, rate) => fillCrackle(data, rate)));
    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = 'highpass';
    crackleFilter.frequency.value = 1200;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.8;
    crackle.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(gain);
  }

  nodes.forEach((node) => node.start());
  return { gain, nodes };
}

const channels = new Map<AmbientSoundType, Channel>();
const volumes: Record<AmbientSoundType, number> = { rain: 0, brownNoise: 0, campfire: 0 };
let paused = false;

function clamp(volume: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0));
}

function release(type: AmbientSoundType): void {
  const channel = channels.get(type);
  if (!channel) return;
  channel.nodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      // already stopped
    }
    node.disconnect();
  });
  channel.gain.disconnect();
  channels.delete(type);
}

/** Creates the graph only while the channel is audible, and frees it again at 0 (no idle CPU). */
function sync(type: AmbientSoundType): void {
  const effective = paused ? 0 : volumes[type];
  if (effective <= 0) {
    release(type);
    return;
  }
  let channel = channels.get(type);
  if (!channel) {
    const ctx = getAudioContext();
    const master = getMasterGain();
    if (!ctx || !master) return;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    channel = buildChannel(type, ctx, master);
    channels.set(type, channel);
  }
  // AC-16.2: only this channel's gain changes, the other channels keep playing untouched.
  channel.gain.gain.value = effective;
}

export function setChannelVolume(type: AmbientSoundType, volume: number): void {
  volumes[type] = clamp(volume);
  sync(type);
}

export function setAmbientPaused(isPaused: boolean): void {
  paused = isPaused;
  AMBIENT_CHANNELS.forEach(sync);
}

export function isChannelActive(type: AmbientSoundType): boolean {
  return channels.has(type);
}

/** Test helper: drops every channel and resets the state. */
export function resetAmbientEngine(): void {
  AMBIENT_CHANNELS.forEach(release);
  AMBIENT_CHANNELS.forEach((type) => {
    volumes[type] = 0;
  });
  paused = false;
}
