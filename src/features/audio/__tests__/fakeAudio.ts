import { vi } from 'vitest';

export interface FakeNode {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  start?: ReturnType<typeof vi.fn>;
  stop?: ReturnType<typeof vi.fn>;
}

/** AudioParam double: a plain value plus the scheduling methods the synthesizers call. */
function fakeParam(value = 0) {
  return {
    value,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

export interface FakeGain extends FakeNode {
  gain: { value: number };
}

/** Records every node so tests can inspect the audio graph without a real AudioContext. */
export class FakeContext {
  state: 'running' | 'suspended' = 'running';
  sampleRate = 8000;
  currentTime = 0;
  gains: FakeGain[] = [];
  sources: FakeNode[] = [];
  oscillators: FakeNode[] = [];
  filters: (FakeNode & { type: string })[] = [];
  resume = vi.fn(() => Promise.resolve());

  private node(): FakeNode {
    return { connect: vi.fn(), disconnect: vi.fn() };
  }

  createGain(): FakeGain {
    const gain = { ...this.node(), gain: fakeParam(1) };
    this.gains.push(gain);
    return gain;
  }

  createBufferSource() {
    const source = { ...this.node(), buffer: null, loop: false, start: vi.fn(), stop: vi.fn(), onended: null };
    this.sources.push(source);
    return source;
  }

  createOscillator() {
    const oscillator = { ...this.node(), frequency: fakeParam(), type: '', start: vi.fn(), stop: vi.fn(), onended: null };
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createBiquadFilter() {
    const filter = { ...this.node(), type: '', frequency: fakeParam(), Q: fakeParam() };
    this.filters.push(filter);
    return filter;
  }

  createBuffer(_channels: number, length: number) {
    const data = new Float32Array(length);
    return { getChannelData: () => data };
  }
}
