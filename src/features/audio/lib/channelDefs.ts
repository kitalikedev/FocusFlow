import { CloudRain, Flame, Waves, type LucideIcon } from 'lucide-react';
import { createBuffer, fillCrackle, fillNoise } from './noise';

/** A running channel: its own GainNode (connected to the master) plus every source that must be stopped. */
export interface ChannelGraph {
  gain: GainNode;
  nodes: AudioScheduledSourceNode[];
}

export interface ChannelDef {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Slider 100 % maps to this gain, so every channel feels equally loud (rain is the harshest). */
  scale: number;
  /** `settings` volumes are saved with the account (database columns); `device` volumes only on this device. */
  persist: 'settings' | 'device';
  build: (ctx: AudioContext, master: GainNode) => ChannelGraph;
}

const LOOP_SECONDS = 4;

function startGraph(gain: GainNode, nodes: AudioScheduledSourceNode[]): ChannelGraph {
  nodes.forEach((node) => node.start());
  return { gain, nodes };
}

function loopingSource(ctx: AudioContext, nodes: AudioScheduledSourceNode[], buffer: AudioBuffer): AudioBufferSourceNode {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  nodes.push(source);
  return source;
}

function newGain(ctx: AudioContext, master: GainNode): GainNode {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  return gain;
}

/** Soft rain: pink noise (warmer than white) through a band-pass and a slowly drifting low-pass (AC-16.1). */
function buildRain(ctx: AudioContext, master: GainNode): ChannelGraph {
  const gain = newGain(ctx, master);
  const nodes: AudioScheduledSourceNode[] = [];
  const source = loopingSource(ctx, nodes, createBuffer(ctx, LOOP_SECONDS, (data) => fillNoise(data, 'pink')));
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 900;
  bandpass.Q.value = 0.4;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 1800;
  // Two very slow oscillators move the cutoff, like the sound of drops changing over time.
  for (const [rate, depth] of [
    [0.07, 450],
    [0.19, 220],
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
  return startGraph(gain, nodes);
}

function buildBrownNoise(ctx: AudioContext, master: GainNode): ChannelGraph {
  const gain = newGain(ctx, master);
  const nodes: AudioScheduledSourceNode[] = [];
  const source = loopingSource(ctx, nodes, createBuffer(ctx, LOOP_SECONDS, (data) => fillNoise(data, 'brown')));
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 700;
  source.connect(lowpass);
  lowpass.connect(gain);
  return startGraph(gain, nodes);
}

/** Warm brown-noise bed plus sparse high-pass crackles (AC-16.4). */
function buildCampfire(ctx: AudioContext, master: GainNode): ChannelGraph {
  const gain = newGain(ctx, master);
  const nodes: AudioScheduledSourceNode[] = [];
  const bed = loopingSource(ctx, nodes, createBuffer(ctx, LOOP_SECONDS, (data) => fillNoise(data, 'brown')));
  const bedFilter = ctx.createBiquadFilter();
  bedFilter.type = 'lowpass';
  bedFilter.frequency.value = 350;
  const bedGain = ctx.createGain();
  bedGain.gain.value = 0.6;
  bed.connect(bedFilter);
  bedFilter.connect(bedGain);
  bedGain.connect(gain);

  const crackle = loopingSource(ctx, nodes, createBuffer(ctx, 6, (data, rate) => fillCrackle(data, rate)));
  const crackleFilter = ctx.createBiquadFilter();
  crackleFilter.type = 'highpass';
  crackleFilter.frequency.value = 1200;
  const crackleGain = ctx.createGain();
  crackleGain.gain.value = 0.7;
  crackle.connect(crackleFilter);
  crackleFilter.connect(crackleGain);
  crackleGain.connect(gain);
  return startGraph(gain, nodes);
}

/**
 * Every ambient channel the mixer shows, in display order. A new channel (for example the generated lofi
 * music) is one more entry here plus its builder in its own file.
 */
export const CHANNEL_DEFS: ChannelDef[] = [
  { id: 'rain', label: 'Rain', icon: CloudRain, scale: 0.55, persist: 'settings', build: buildRain },
  { id: 'brownNoise', label: 'Brown Noise', icon: Waves, scale: 0.9, persist: 'settings', build: buildBrownNoise },
  { id: 'campfire', label: 'Campfire', icon: Flame, scale: 0.9, persist: 'settings', build: buildCampfire },
];

export function findChannelDef(id: string): ChannelDef | undefined {
  return CHANNEL_DEFS.find((def) => def.id === id);
}
