import { vi } from 'vitest';

export interface FakeNode {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  start?: ReturnType<typeof vi.fn>;
  stop?: ReturnType<typeof vi.fn>;
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
    const gain = { ...this.node(), gain: { value: 1 } };
    this.gains.push(gain);
    return gain;
  }

  createBufferSource() {
    const source = { ...this.node(), buffer: null, loop: false, start: vi.fn(), stop: vi.fn() };
    this.sources.push(source);
    return source;
  }

  createOscillator() {
    const oscillator = { ...this.node(), frequency: { value: 0 }, start: vi.fn(), stop: vi.fn() };
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createBiquadFilter() {
    const filter = { ...this.node(), type: '', frequency: { value: 0 }, Q: { value: 0 } };
    this.filters.push(filter);
    return filter;
  }

  createBuffer(_channels: number, length: number) {
    const data = new Float32Array(length);
    return { getChannelData: () => data };
  }
}
