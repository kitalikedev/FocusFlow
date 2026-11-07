import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FakeContext, type FakeGain } from './fakeAudio';

let ctx: FakeContext;
let master: FakeGain;

vi.mock('@/shared/lib/web-audio', () => ({
  getAudioContext: () => ctx,
  getMasterGain: () => master,
}));

import {
  isChannelActive,
  resetAmbientEngine,
  setAmbientPaused,
  setChannelVolume,
} from '../lib/ambientEngine';
import { fillCrackle, fillNoise } from '../lib/noise';

/** The channel gain is the first gain created for a channel and is connected to the master. */
function channelGains(): FakeGain[] {
  return ctx.gains.filter((gain) => gain.connect.mock.calls.some(([target]) => target === master));
}

beforeEach(() => {
  ctx = new FakeContext();
  master = ctx.createGain();
  ctx.gains = [];
  resetAmbientEngine();
});

describe('ambient engine (FR-16)', () => {
  it('AC-16.1: rain is white noise through band-pass and low-pass filters, gain 0.5 at 50 %', () => {
    setChannelVolume('rain', 0.5);
    expect(isChannelActive('rain')).toBe(true);
    expect(ctx.filters.map((filter) => filter.type)).toEqual(['bandpass', 'lowpass']);
    expect(ctx.oscillators).toHaveLength(2); // cutoff drift
    const [gain] = channelGains();
    expect(gain.gain.value).toBe(0.5);
    expect(ctx.sources[0].start).toHaveBeenCalled();
  });

  it('AC-16.2: changing one channel never touches the gain of the others', () => {
    setChannelVolume('rain', 0.4);
    setChannelVolume('brownNoise', 0.6);
    setChannelVolume('campfire', 0.3);
    const [rain, brown, fire] = channelGains();

    setChannelVolume('brownNoise', 0.9);
    expect(brown.gain.value).toBe(0.9);
    expect(rain.gain.value).toBe(0.4);
    expect(fire.gain.value).toBe(0.3);
  });

  it('AC-16.4: campfire mixes a brown-noise bed with high-passed crackles', () => {
    setChannelVolume('campfire', 1);
    expect(ctx.sources).toHaveLength(2);
    expect(ctx.filters.map((filter) => filter.type)).toEqual(['lowpass', 'highpass']);
  });

  it('frees the graph at volume 0 and while paused, and rebuilds it afterwards', () => {
    setChannelVolume('brownNoise', 0.5);
    const source = ctx.sources[0];
    setChannelVolume('brownNoise', 0);
    expect(isChannelActive('brownNoise')).toBe(false);
    expect(source.stop).toHaveBeenCalled();
    expect(source.disconnect).toHaveBeenCalled();

    setChannelVolume('brownNoise', 0.5);
    setAmbientPaused(true);
    expect(isChannelActive('brownNoise')).toBe(false);
    setAmbientPaused(false);
    expect(isChannelActive('brownNoise')).toBe(true);
    expect(channelGains().at(-1)?.gain.value).toBe(0.5);
  });

  it('clamps volumes and resumes a suspended context', () => {
    ctx.state = 'suspended';
    setChannelVolume('rain', 7);
    expect(ctx.resume).toHaveBeenCalled();
    expect(channelGains()[0].gain.value).toBe(1);
    setChannelVolume('rain', Number.NaN);
    expect(isChannelActive('rain')).toBe(false);
  });
});

describe('noise generators', () => {
  const sequence = (values: number[]) => {
    let i = 0;
    return () => values[i++ % values.length];
  };

  it('white noise spans -1..1 and brown noise stays bounded', () => {
    const white = new Float32Array(4);
    fillNoise(white, 'white', sequence([0, 1, 0.5, 0.25]));
    expect(Array.from(white)).toEqual([-1, 1, 0, -0.5]);

    const brown = new Float32Array(5000);
    fillNoise(brown, 'brown');
    expect(Math.max(...Array.from(brown).map(Math.abs))).toBeLessThan(2);
  });

  it('crackles are short bursts separated by silence', () => {
    const data = new Float32Array(8000);
    fillCrackle(data, 8000, sequence([0.5, 0.3, 0.9, 0.2, 0.7]));
    const nonZero = Array.from(data).filter((value) => value !== 0).length;
    expect(nonZero).toBeGreaterThan(0);
    expect(nonZero).toBeLessThan(data.length * 0.2);
  });
});
