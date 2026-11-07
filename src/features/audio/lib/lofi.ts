import type { ChannelGraph } from './channelDefs';
import { createBuffer, fillCrackle, fillNoise } from './noise';

/**
 * Generated lofi music (Web Audio only, no file is downloaded, no copyright question): a four-chord loop
 * played by a soft electric piano with a bass, lazy swung drums and a little vinyl noise.
 */

export const LOFI_BPM = 75;
export const STEPS_PER_BAR = 16; // sixteenth notes
export const LOOP_BARS = 4;
export const LOOP_STEPS = STEPS_PER_BAR * LOOP_BARS;
/** Every odd sixteenth is pushed back by this fraction of a step: the "lazy" lofi groove. */
export const SWING = 0.22;

/** Cmaj7 → Am7 → Dm7 → G7, as MIDI notes of the right-hand voicing and the bass root. */
export const PROGRESSION: { chord: number[]; bass: number }[] = [
  { chord: [52, 55, 59, 60], bass: 36 }, // Cmaj7: E3 G3 B3 C4, root C2
  { chord: [48, 52, 55, 57], bass: 33 }, // Am7:   C3 E3 G3 A3, root A1
  { chord: [50, 53, 57, 60], bass: 38 }, // Dm7:   D3 F3 A3 C4, root D2
  { chord: [53, 55, 59, 62], bass: 31 }, // G7:    F3 G3 B3 D4, root G1
];

export type LofiKind = 'chord' | 'bass' | 'kick' | 'snare' | 'hat';

export interface LofiEvent {
  kind: LofiKind;
  /** MIDI notes for chord and bass events. */
  notes?: number[];
  /** 0..1 */
  velocity: number;
}

export function midiToFrequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

/** Seconds per sixteenth note. */
export function stepSeconds(bpm: number = LOFI_BPM): number {
  return 60 / bpm / 4;
}

/** Start time of a step inside the loop, with swing on the odd sixteenths. */
export function stepTime(step: number, bpm: number = LOFI_BPM): number {
  const base = step * stepSeconds(bpm);
  return step % 2 === 1 ? base + SWING * stepSeconds(bpm) : base;
}

const KICK_STEPS = [0, 7, 10];
const SNARE_STEPS = [4, 12];
const CHORD_STEPS = [0, 10]; // stab on the downbeat, a lighter comp before the next beat
const BASS_STEPS = [0, 10];

/**
 * Everything that sounds at one step of the 64-step loop. Deterministic except for the optional
 * "dropped hit" and velocity variation taken from `random`, which keeps the loop from sounding mechanical.
 */
export function eventsAtStep(step: number, random: () => number = Math.random): LofiEvent[] {
  const position = ((step % LOOP_STEPS) + LOOP_STEPS) % LOOP_STEPS;
  const inBar = position % STEPS_PER_BAR;
  const bar = Math.floor(position / STEPS_PER_BAR);
  const { chord, bass } = PROGRESSION[bar];
  const events: LofiEvent[] = [];
  const velocity = (base: number) => Math.min(1, Math.max(0.05, base + (random() - 0.5) * 0.2));

  if (CHORD_STEPS.includes(inBar)) {
    // The second comp of a bar is sometimes left out, like a player who does not repeat the same pattern.
    if (inBar === 0 || random() < 0.7) events.push({ kind: 'chord', notes: chord, velocity: velocity(inBar === 0 ? 0.7 : 0.45) });
  }
  if (BASS_STEPS.includes(inBar)) events.push({ kind: 'bass', notes: [bass], velocity: velocity(0.8) });
  if (KICK_STEPS.includes(inBar) && (inBar === 0 || random() < 0.85)) events.push({ kind: 'kick', velocity: velocity(0.9) });
  if (SNARE_STEPS.includes(inBar)) events.push({ kind: 'snare', velocity: velocity(0.7) });
  if (inBar % 2 === 0) events.push({ kind: 'hat', velocity: velocity(inBar % 4 === 0 ? 0.45 : 0.28) });
  return events;
}

// ------------------------------------------------------------------------------ sound design

type Destinations = { piano: AudioNode; bass: AudioNode; drums: AudioNode };

function envelope(ctx: AudioContext, dest: AudioNode, time: number, peak: number, attack: number, decay: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);
  gain.connect(dest);
  return gain;
}

function oscillator(ctx: AudioContext, type: OscillatorType, frequency: number, time: number, stop: number, out: AudioNode): void {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = frequency;
  osc.connect(out);
  osc.start(time);
  osc.stop(stop);
  osc.onended = () => osc.disconnect();
}

/** Electric piano: a sine and a slightly detuned triangle per note, soft attack, long decay. */
function playChord(ctx: AudioContext, dest: AudioNode, time: number, notes: number[], velocity: number): void {
  const peak = (0.16 * velocity) / Math.sqrt(notes.length);
  notes.forEach((note, index) => {
    const start = time + index * 0.012; // a tiny strum
    const env = envelope(ctx, dest, start, peak, 0.012, 1.9);
    const frequency = midiToFrequency(note);
    oscillator(ctx, 'sine', frequency, start, start + 2.1, env);
    oscillator(ctx, 'triangle', frequency * 1.004, start, start + 2.1, env);
  });
}

function playBass(ctx: AudioContext, dest: AudioNode, time: number, note: number, velocity: number): void {
  const env = envelope(ctx, dest, time, 0.34 * velocity, 0.02, 0.7);
  oscillator(ctx, 'sine', midiToFrequency(note), time, time + 0.8, env);
}

function playKick(ctx: AudioContext, dest: AudioNode, time: number, velocity: number): void {
  const env = envelope(ctx, dest, time, 0.7 * velocity, 0.003, 0.32);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(130, time);
  osc.frequency.exponentialRampToValueAtTime(46, time + 0.12);
  osc.connect(env);
  osc.start(time);
  osc.stop(time + 0.4);
  osc.onended = () => osc.disconnect();
}

function noiseHit(
  ctx: AudioContext,
  noise: AudioBuffer,
  dest: AudioNode,
  time: number,
  options: { filter: BiquadFilterType; frequency: number; q: number; peak: number; decay: number },
): void {
  const source = ctx.createBufferSource();
  source.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = options.filter;
  filter.frequency.value = options.frequency;
  filter.Q.value = options.q;
  const env = envelope(ctx, dest, time, options.peak, 0.002, options.decay);
  source.connect(filter);
  filter.connect(env);
  source.start(time);
  source.stop(time + options.decay + 0.05);
  source.onended = () => source.disconnect();
}

function playEvent(ctx: AudioContext, noise: AudioBuffer, out: Destinations, time: number, event: LofiEvent): void {
  switch (event.kind) {
    case 'chord':
      playChord(ctx, out.piano, time, event.notes ?? [], event.velocity);
      break;
    case 'bass':
      playBass(ctx, out.bass, time, event.notes?.[0] ?? 36, event.velocity);
      break;
    case 'kick':
      playKick(ctx, out.drums, time, event.velocity);
      break;
    case 'snare':
      noiseHit(ctx, noise, out.drums, time, { filter: 'bandpass', frequency: 1900, q: 0.7, peak: 0.32 * event.velocity, decay: 0.17 });
      break;
    case 'hat':
      noiseHit(ctx, noise, out.drums, time, { filter: 'highpass', frequency: 7500, q: 0.5, peak: 0.16 * event.velocity, decay: 0.045 });
      break;
  }
}

const LOOKAHEAD_SECONDS = 0.25;
const TICK_MS = 25;
const HUMANIZE_SECONDS = 0.008;

/**
 * Builds the lofi channel. The scheduler wakes up every 25 ms and queues the sounds of the next quarter second
 * on the audio clock, so timing stays steady even when the page is busy. `dispose` stops it.
 */
export function buildLofiChannel(ctx: AudioContext, master: GainNode, random: () => number = Math.random): ChannelGraph {
  const bus = ctx.createGain();
  bus.gain.value = 0;
  bus.connect(master);

  // A warm, dull top end: everything goes through one low-pass.
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 3800;
  tone.connect(bus);

  const piano = ctx.createGain();
  piano.gain.value = 1;
  const bass = ctx.createGain();
  bass.gain.value = 1;
  const drums = ctx.createGain();
  drums.gain.value = 0.9;
  [piano, bass, drums].forEach((node) => node.connect(tone));

  const noise = createBuffer(ctx, 1, (data) => fillNoise(data, 'white'));

  // Vinyl: a faint hiss plus sparse pops, looping for as long as the channel lives.
  const nodes: AudioScheduledSourceNode[] = [];
  const hiss = ctx.createBufferSource();
  hiss.buffer = createBuffer(ctx, 4, (data) => fillNoise(data, 'pink'));
  hiss.loop = true;
  const hissFilter = ctx.createBiquadFilter();
  hissFilter.type = 'lowpass';
  hissFilter.frequency.value = 2500;
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0.035;
  hiss.connect(hissFilter);
  hissFilter.connect(hissGain);
  hissGain.connect(bus);
  const pops = ctx.createBufferSource();
  pops.buffer = createBuffer(ctx, 6, (data, rate) => fillCrackle(data, rate, random));
  pops.loop = true;
  const popsGain = ctx.createGain();
  popsGain.gain.value = 0.22;
  pops.connect(popsGain);
  popsGain.connect(bus);
  nodes.push(hiss, pops);
  nodes.forEach((node) => node.start());

  const out: Destinations = { piano, bass, drums };
  let step = 0;
  const loopStart = ctx.currentTime + 0.12;
  const timer = setInterval(() => {
    // Queue every step that starts before the end of the look-ahead window.
    for (;;) {
      const loopNumber = Math.floor(step / LOOP_STEPS);
      const time = loopStart + loopNumber * LOOP_STEPS * stepSeconds() + stepTime(step % LOOP_STEPS);
      if (time > ctx.currentTime + LOOKAHEAD_SECONDS) break;
      // Steps already in the past (the page was busy or in the background) are skipped, not played at once.
      if (time >= ctx.currentTime) {
        const humanized = Math.max(ctx.currentTime, time + (random() - 0.5) * 2 * HUMANIZE_SECONDS);
        eventsAtStep(step, random).forEach((event) => playEvent(ctx, noise, out, humanized, event));
      }
      step += 1;
    }
  }, TICK_MS);

  return {
    gain: bus,
    nodes,
    dispose: () => {
      clearInterval(timer);
      [piano, bass, drums, tone].forEach((node) => node.disconnect());
    },
  };
}
