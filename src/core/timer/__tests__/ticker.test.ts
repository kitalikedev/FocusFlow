import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBoundaryLoop } from '../boundaryLoop';
import { createTicker } from '../ticker';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('createBoundaryLoop', () => {
  it('ticks right after every whole second counted from the anchor', () => {
    const onTick = vi.fn();
    const loop = createBoundaryLoop(onTick);
    loop.start(0);

    vi.advanceTimersByTime(999);
    expect(onTick).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10);
    expect(onTick).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1_000);
    expect(onTick).toHaveBeenCalledTimes(2);
    loop.stop();
  });

  it('follows the anchor phase, not the moment start() was called', () => {
    const onTick = vi.fn();
    vi.setSystemTime(400);
    createBoundaryLoop(onTick).start(0);
    vi.advanceTimersByTime(590);
    expect(onTick).not.toHaveBeenCalled();
    vi.advanceTimersByTime(20);
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('stops ticking and survives stop() called from inside a tick', () => {
    const loop = createBoundaryLoop(() => loop.stop());
    loop.start(0);
    vi.advanceTimersByTime(5_000);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('restarting replaces the previous schedule', () => {
    const onTick = vi.fn();
    const loop = createBoundaryLoop(onTick);
    loop.start(0);
    loop.start(0);
    vi.advanceTimersByTime(1_010);
    expect(onTick).toHaveBeenCalledTimes(1);
    loop.stop();
    loop.stop();
  });
});

describe('createTicker without Worker support', () => {
  it('falls back to the main-thread loop', () => {
    const onTick = vi.fn();
    const ticker = createTicker(onTick);
    ticker.start(0);
    vi.advanceTimersByTime(1_010);
    expect(onTick).toHaveBeenCalledTimes(1);
    ticker.stop();
    vi.advanceTimersByTime(5_000);
    expect(onTick).toHaveBeenCalledTimes(1);
  });
});

describe('createTicker with a Worker', () => {
  class FakeWorker {
    static instances: FakeWorker[] = [];
    onmessage: (() => void) | null = null;
    onerror: (() => void) | null = null;
    postMessage = vi.fn();
    terminate = vi.fn();
    constructor() {
      FakeWorker.instances.push(this);
    }
  }

  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal('Worker', FakeWorker);
  });

  it('delegates to the worker and forwards its ticks', () => {
    const onTick = vi.fn();
    const ticker = createTicker(onTick);
    const [worker] = FakeWorker.instances;

    ticker.start(1234);
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'START', anchor: 1234 });
    worker.onmessage?.();
    expect(onTick).toHaveBeenCalledTimes(1);

    ticker.stop();
    expect(worker.postMessage).toHaveBeenLastCalledWith({ type: 'STOP' });
    vi.advanceTimersByTime(5_000);
    expect(onTick).toHaveBeenCalledTimes(1); // the fallback never ran
  });

  it('switches to the fallback when the worker fails (e.g. blocked by CSP)', () => {
    const onTick = vi.fn();
    const ticker = createTicker(onTick);
    const [worker] = FakeWorker.instances;

    ticker.start(0);
    worker.onerror?.();
    expect(worker.terminate).toHaveBeenCalled();
    vi.advanceTimersByTime(1_010);
    expect(onTick).toHaveBeenCalledTimes(1);

    ticker.stop();
    worker.onerror?.(); // late error after stop: nothing to restart
    vi.advanceTimersByTime(3_000);
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('uses the fallback when the Worker constructor throws', () => {
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw new Error('blocked');
        }
      },
    );
    const onTick = vi.fn();
    const ticker = createTicker(onTick);
    ticker.start(0);
    vi.advanceTimersByTime(1_010);
    expect(onTick).toHaveBeenCalledTimes(1);
    ticker.stop();
  });

  it('fallback is restarted from the same anchor after a failure before start', () => {
    const ticker = createTicker(vi.fn());
    FakeWorker.instances[0].onerror?.();
    ticker.start(0);
    expect(vi.getTimerCount()).toBe(1);
    ticker.stop();
  });
});

describe('timer.worker', () => {
  it('starts and stops the heartbeat on command', async () => {
    vi.resetModules();
    const posted: unknown[] = [];
    vi.spyOn(self, 'postMessage').mockImplementation((message: unknown) => {
      posted.push(message);
    });
    await import('../timer.worker');
    const scope = self as unknown as { onmessage: (event: { data: unknown }) => void };

    scope.onmessage({ data: { type: 'START', anchor: 0 } });
    vi.advanceTimersByTime(2_010);
    expect(posted).toEqual([{ type: 'TICK' }, { type: 'TICK' }]);

    scope.onmessage({ data: { type: 'STOP' } });
    vi.advanceTimersByTime(5_000);
    expect(posted).toHaveLength(2);
    vi.restoreAllMocks();
  });
});
