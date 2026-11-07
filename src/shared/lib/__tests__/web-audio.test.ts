import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

interface FakeNode {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

let oscillators: Array<FakeNode & {
  type: string;
  frequency: { value: number };
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
}>;
let gains: Array<FakeNode & {
  gain: {
    value: number;
    setValueAtTime: ReturnType<typeof vi.fn>;
    linearRampToValueAtTime: ReturnType<typeof vi.fn>;
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  };
}>;
let contexts: FakeAudioContext[];

class FakeAudioContext {
  static initialState: 'running' | 'suspended' = 'running';
  state: 'running' | 'suspended' = FakeAudioContext.initialState;
  currentTime = 10;
  destination = {};
  resume = vi.fn(() => {
    this.state = 'running';
    return Promise.resolve();
  });
  constructor() {
    contexts.push(this);
  }
  createGain() {
    const node = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };
    gains.push(node);
    return node;
  }
  createOscillator() {
    const node = {
      type: '',
      frequency: { value: 0 },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as (() => void) | null,
    };
    oscillators.push(node);
    return node;
  }
}

async function loadModule() {
  vi.resetModules();
  return import('../web-audio');
}

beforeEach(() => {
  oscillators = [];
  gains = [];
  contexts = [];
  FakeAudioContext.initialState = 'running';
  vi.stubGlobal('AudioContext', FakeAudioContext);
  (window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete (window as unknown as { AudioContext?: unknown }).AudioContext;
});

describe('playChime (AC-07.2)', () => {
  it('synthesizes D5 and A5 sine tones through a decaying envelope into the master gain', async () => {
    const audio = await loadModule();
    audio.playChime();

    expect(oscillators.map((o) => o.frequency.value)).toEqual([587.33, 880]);
    expect(oscillators.every((o) => o.type === 'sine')).toBe(true);
    expect(oscillators.every((o) => o.start.mock.calls[0][0] === 10)).toBe(true);

    const [master, envelope] = gains;
    expect(master.connect).toHaveBeenCalledWith(contexts[0].destination);
    expect(envelope.connect).toHaveBeenCalledWith(master);
    expect(envelope.gain.exponentialRampToValueAtTime).toHaveBeenCalled();
    oscillators.forEach((o) => expect(o.connect).toHaveBeenCalledWith(envelope));
  });

  it('releases the envelope when both tones have ended', async () => {
    const audio = await loadModule();
    audio.playChime();
    const envelope = gains[1];

    oscillators[0].onended?.();
    expect(envelope.disconnect).not.toHaveBeenCalled();
    oscillators[1].onended?.();
    expect(envelope.disconnect).toHaveBeenCalledTimes(1);
  });

  it('stays silent when muted or when the master volume is 0', async () => {
    const audio = await loadModule();
    audio.toggleMasterMute();
    audio.playChime();
    expect(oscillators).toHaveLength(0);

    audio.toggleMasterMute();
    audio.setMasterVolume(0);
    audio.playChime();
    expect(oscillators).toHaveLength(0);
  });

  it('does nothing when Web Audio is unavailable', async () => {
    vi.unstubAllGlobals();
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
    const audio = await loadModule();
    expect(() => audio.playChime()).not.toThrow();
    await expect(audio.initAudioContext()).resolves.toBeUndefined();
  });

  it('does nothing when the context cannot be created', async () => {
    (window as unknown as { AudioContext: unknown }).AudioContext = class {
      constructor() {
        throw new Error('blocked');
      }
    };
    const audio = await loadModule();
    expect(() => audio.playChime()).not.toThrow();
  });

  it('falls back to the prefixed constructor', async () => {
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
    (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext = FakeAudioContext;
    const audio = await loadModule();
    audio.playChime();
    expect(oscillators).toHaveLength(2);
    delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;
  });
});

describe('autoplay recovery', () => {
  it('resumes a suspended context on the first user gesture', async () => {
    FakeAudioContext.initialState = 'suspended';
    const audio = await loadModule();
    audio.setMasterVolume(0.5);
    audio.playChime(); // creates the context and tries to resume it

    window.dispatchEvent(new Event('pointerdown'));
    expect(contexts[0].resume).toHaveBeenCalled();
    contexts[0].resume.mockClear();
    window.dispatchEvent(new Event('keydown'));
    expect(contexts[0].resume).not.toHaveBeenCalled(); // listeners were removed
  });

  it('initAudioContext resumes a suspended context', async () => {
    FakeAudioContext.initialState = 'suspended';
    const audio = await loadModule();
    await audio.initAudioContext();
    expect(contexts[0].state).toBe('running');
  });

  it('swallows a rejected resume', async () => {
    FakeAudioContext.initialState = 'suspended';
    const audio = await loadModule();
    await audio.initAudioContext();
    contexts[0].state = 'suspended';
    contexts[0].resume.mockRejectedValueOnce(new Error('denied'));
    await expect(audio.initAudioContext()).resolves.toBeUndefined();
  });
});

describe('master volume and mute (AC-08.1, AC-18.1)', () => {
  it('applies the volume to the master gain, clamped to 0..1', async () => {
    const audio = await loadModule();
    await audio.initAudioContext();
    const master = gains[0];

    audio.setMasterVolume(0.3);
    expect(master.gain.value).toBe(0.3);
    audio.setMasterVolume(7);
    expect(master.gain.value).toBe(1);
    audio.setMasterVolume(-1);
    expect(master.gain.value).toBe(0);
    audio.setMasterVolume(Number.NaN);
    expect(audio.getMasterVolume()).toBe(0);
  });

  it('mutes to 0 and restores the previous volume', async () => {
    const audio = await loadModule();
    await audio.initAudioContext();
    const master = gains[0];
    audio.setMasterVolume(0.6);

    expect(audio.toggleMasterMute()).toBe(true);
    expect(audio.isMuted()).toBe(true);
    expect(master.gain.value).toBe(0);

    expect(audio.toggleMasterMute()).toBe(false);
    expect(master.gain.value).toBe(0.6);
  });

  it('notifies subscribers until they unsubscribe', async () => {
    const audio = await loadModule();
    const listener = vi.fn();
    const unsubscribe = audio.subscribeMute(listener);

    audio.toggleMasterMute();
    expect(listener).toHaveBeenCalledWith(true);
    unsubscribe();
    audio.toggleMasterMute();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('getAudioContext / getMasterGain', () => {
  it('returns the single shared context and its master gain', async () => {
    const audio = await loadModule();
    const context = audio.getAudioContext();
    const master = audio.getMasterGain();
    expect(context).toBe(contexts[0]);
    expect(audio.getAudioContext()).toBe(context);
    expect(contexts).toHaveLength(1);
    expect(master).toBe(gains[0]);
    expect(master?.connect).toHaveBeenCalledWith(contexts[0].destination);
  });

  it('returns null when Web Audio is unavailable', async () => {
    vi.unstubAllGlobals();
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
    const audio = await loadModule();
    expect(audio.getAudioContext()).toBeNull();
    expect(audio.getMasterGain()).toBeNull();
  });
});
