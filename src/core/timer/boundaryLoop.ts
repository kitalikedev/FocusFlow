import { msUntilNextBoundary } from './timer-engine';

/** Fires slightly after each boundary so a timer that wakes marginally early never lands before it. */
export const BOUNDARY_GUARD_MS = 2;

export interface BoundaryLoop {
  start: (anchor: number) => void;
  stop: () => void;
}

/** Calls `onTick` right after every whole second counted from `anchor` (shared by the worker and the fallback). */
export function createBoundaryLoop(onTick: () => void): BoundaryLoop {
  let handle: ReturnType<typeof setTimeout> | null = null;
  let running = false;

  const clear = () => {
    if (handle !== null) clearTimeout(handle);
    handle = null;
  };

  const schedule = (anchor: number) => {
    handle = setTimeout(() => {
      handle = null;
      onTick();
      if (running) schedule(anchor);
    }, msUntilNextBoundary(anchor, Date.now()) + BOUNDARY_GUARD_MS);
  };

  return {
    start: (anchor) => {
      clear();
      running = true;
      schedule(anchor);
    },
    stop: () => {
      running = false;
      clear();
    },
  };
}
