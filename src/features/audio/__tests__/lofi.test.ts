import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  buildLofiChannel,
  eventsAtStep,
  LOFI_BPM,
  LOOP_STEPS,
  midiToFrequency,
  PROGRESSION,
  stepSeconds,
  stepTime,
} from '../lib/lofi';

const pitchClasses = (notes: number[]) => [...new Set(notes.map((note) => note % 12))].sort((a, b) => a - b);

describe('lofi music theory and groove', () => {
  it('converts MIDI notes to frequencies', () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(57)).toBeCloseTo(220);
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 1);
  });

  it('plays Cmaj7 → Am7 → Dm7 → G7 with the right notes and bass roots', () => {
    expect(PROGRESSION).toHaveLength(4);
    expect(pitchClasses(PROGRESSION[0].chord)).toEqual([0, 4, 7, 11]); // C E G B
    expect(pitchClasses(PROGRESSION[1].chord)).toEqual([0, 4, 7, 9]); // A C E G
    expect(pitchClasses(PROGRESSION[2].chord)).toEqual([0, 2, 5, 9]); // D F A C
    expect(pitchClasses(PROGRESSION[3].chord)).toEqual([2, 5, 7, 11]); // G B D F
    expect(PROGRESSION.map((entry) => entry.bass % 12)).toEqual([0, 9, 2, 7]);
  });

  it('runs at about 75 BPM with a lazy swing on the odd sixteenths', () => {
    expect(LOFI_BPM).toBe(75);
    expect(stepSeconds()).toBeCloseTo(0.2);
    expect(stepTime(0)).toBe(0);
    expect(stepTime(2)).toBeCloseTo(0.4);
    expect(stepTime(1)).toBeGreaterThan(stepSeconds()); // pushed back
    expect(stepTime(1)).toBeLessThan(2 * stepSeconds());
  });

  it('puts the kick on the downbeat, the snare on 2 and 4 and the chord on each bar', () => {
    const kinds = (step: number) => eventsAtStep(step, () => 0.5).map((event) => event.kind).sort();
    expect(kinds(0)).toEqual(['bass', 'chord', 'hat', 'kick']);
    expect(kinds(4)).toEqual(['hat', 'snare']);
    expect(kinds(12)).toEqual(['hat', 'snare']);
    expect(kinds(5)).toEqual([]);
    expect(eventsAtStep(16, () => 0.5).find((event) => event.kind === 'chord')?.notes).toEqual(PROGRESSION[1].chord);
    expect(eventsAtStep(48, () => 0.5).find((event) => event.kind === 'bass')?.notes).toEqual([PROGRESSION[3].bass]);
  });

  it('loops every 4 bars and keeps velocities in range', () => {
    for (let step = 0; step < LOOP_STEPS; step += 1) {
      const a = eventsAtStep(step, () => 0.5);
      const b = eventsAtStep(step + LOOP_STEPS, () => 0.5);
      expect(b).toEqual(a);
      a.forEach((event) => {
        expect(event.velocity).toBeGreaterThan(0);
        expect(event.velocity).toBeLessThanOrEqual(1);
      });
    }
  });

  it('sometimes leaves out the light comp and a kick, so the loop does not sound mechanical', () => {
    expect(eventsAtStep(10, () => 0.95).map((event) => event.kind)).toEqual(['bass', 'hat']);
    expect(eventsAtStep(10, () => 0.1).map((event) => event.kind)).toEqual(['chord', 'bass', 'kick', 'hat']);
  });
});

// A recording audio context: enough of the Web Audio API for the scheduler.
function makeContext() {
  const created = { oscillators: 0, sources: 0, filters: [] as string[] };
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  });
  const node = () => ({ connect: vi.fn(), disconnect: vi.fn() });
  const ctx = {
    currentTime: 0,
    sampleRate: 8000,
    createGain: () => ({ ...node(), gain: param() }),
    createOscillator: () => {
      created.oscillators += 1;
      return { ...node(), type: '', frequency: param(), start: vi.fn(), stop: vi.fn(), onended: null };
    },
    createBufferSource: () => {
      created.sources += 1;
      return { ...node(), buffer: null, loop: false, start: vi.fn(), stop: vi.fn(), onended: null };
    },
    createBiquadFilter: () => {
      const filter = { ...node(), type: '', frequency: param(), Q: param() };
      created.filters.push('filter');
      return filter;
    },
    createBuffer: (_channels: number, length: number) => ({ getChannelData: () => new Float32Array(length) }),
  };
  return { ctx: ctx as unknown as AudioContext, raw: ctx, created };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('buildLofiChannel', () => {
  it('starts silent on its own bus, loops the vinyl noise and queues the first beat', () => {
    vi.useFakeTimers();
    const { ctx, created } = makeContext();
    const master = { connect: vi.fn(), disconnect: vi.fn() } as unknown as GainNode;
    const channel = buildLofiChannel(ctx, master, () => 0.5);

    expect(channel.gain.gain.value).toBe(0); // the engine fades it in
    expect((channel.gain as unknown as { connect: ReturnType<typeof vi.fn> }).connect).toHaveBeenCalledWith(master);
    expect(channel.nodes).toHaveLength(2); // hiss + crackle
    channel.nodes.forEach((source) => expect(source.start).toHaveBeenCalled());

    vi.advanceTimersByTime(25);
    // first downbeat: 4 chord notes × 2 oscillators + bass + kick
    expect(created.oscillators).toBe(10);
    channel.dispose?.();
  });

  it('keeps scheduling ahead of the audio clock and stops completely when disposed', () => {
    vi.useFakeTimers();
    const { ctx, raw, created } = makeContext();
    const channel = buildLofiChannel(ctx, { connect: vi.fn() } as unknown as GainNode, () => 0.5);

    const run = (seconds: number) => {
      const end = raw.currentTime + seconds;
      while (raw.currentTime < end) {
        raw.currentTime += 0.025;
        vi.advanceTimersByTime(25);
      }
    };
    run(2);
    const oscillatorsAfterTwoSeconds = created.oscillators;
    const sourcesAfterTwoSeconds = created.sources;
    expect(oscillatorsAfterTwoSeconds).toBeGreaterThan(10); // more notes were queued
    expect(sourcesAfterTwoSeconds).toBeGreaterThan(2); // snare and hats are noise bursts

    channel.dispose?.();
    run(3);
    expect(created.oscillators).toBe(oscillatorsAfterTwoSeconds);
    expect(created.sources).toBe(sourcesAfterTwoSeconds);
  });

  it('does not play a backlog all at once when the page was frozen for a while', () => {
    vi.useFakeTimers();
    const { ctx, raw, created } = makeContext();
    const channel = buildLofiChannel(ctx, { connect: vi.fn() } as unknown as GainNode, () => 0.5);
    raw.currentTime = 600; // ten minutes later
    vi.advanceTimersByTime(25);
    expect(created.oscillators).toBeLessThan(40);
    channel.dispose?.();
  });
});
