/**
 * FPS guard for the particle canvas (AC-26.2, AC-26.3). Pure logic, driven by frame timestamps, so it can be
 * unit-tested without a browser: below the threshold for 3 seconds in a row → halve the particle budget.
 */
export const DESKTOP_MIN_FPS = 55;
export const MOBILE_MIN_FPS = 50;
export const LOW_FPS_WINDOW_MS = 3000;

export interface FpsGuard {
  /** Feeds one frame timestamp (ms); returns the current particle multiplier (1, 0.5, 0.25…). */
  frame: (timestamp: number) => number;
  /** Forgets timing after a pause (tab hidden), so the gap is not counted as a slow frame. */
  reset: () => void;
  readonly multiplier: number;
}

export function createFpsGuard(minFps: number, minMultiplier = 0.125): FpsGuard {
  let multiplier = 1;
  let windowStart: number | null = null;
  let frames = 0;
  let lowSince: number | null = null;

  return {
    frame(timestamp) {
      if (windowStart === null) {
        windowStart = timestamp;
        frames = 0;
        return multiplier;
      }
      frames += 1;
      const elapsed = timestamp - windowStart;
      if (elapsed >= 1000) {
        const fps = (frames * 1000) / elapsed;
        if (fps < minFps) {
          lowSince ??= windowStart;
          if (timestamp - lowSince >= LOW_FPS_WINDOW_MS && multiplier > minMultiplier) {
            multiplier /= 2;
            lowSince = null;
          }
        } else {
          lowSince = null;
        }
        windowStart = timestamp;
        frames = 0;
      }
      return multiplier;
    },
    reset() {
      windowStart = null;
      frames = 0;
      lowSince = null;
    },
    get multiplier() {
      return multiplier;
    },
  };
}
