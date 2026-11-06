import { createBoundaryLoop } from './boundaryLoop';
import type { WorkerCommand } from './timer.worker';

export interface Ticker {
  /** Ticks after every whole second counted from `anchor` (target end time or stopwatch start). */
  start: (anchor: number) => void;
  stop: () => void;
}

/** Web Worker heartbeat with a main-thread fallback when workers are unavailable or blocked. */
export function createTicker(onTick: () => void): Ticker {
  const fallback = createBoundaryLoop(onTick);
  let worker: Worker | null = null;
  let anchor: number | null = null;

  if (typeof Worker !== 'undefined') {
    try {
      const created = new Worker(new URL('./timer.worker.ts', import.meta.url), { type: 'module' });
      created.onmessage = () => onTick();
      created.onerror = () => {
        created.terminate();
        worker = null;
        if (anchor !== null) fallback.start(anchor);
      };
      worker = created;
    } catch {
      worker = null;
    }
  }

  const send = (command: WorkerCommand) => worker?.postMessage(command);

  return {
    start: (nextAnchor) => {
      anchor = nextAnchor;
      if (worker) send({ type: 'START', anchor: nextAnchor });
      else fallback.start(nextAnchor);
    },
    stop: () => {
      anchor = null;
      send({ type: 'STOP' });
      fallback.stop();
    },
  };
}
