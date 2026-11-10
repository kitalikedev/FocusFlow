/** Timing of the "end credits" quotes (FR-31). All values in milliseconds unless noted. */

/** How long one quote takes to roll from the bottom to the top of the screen (see credits.css). */
export const ROLL_SECONDS = 22;
/** Quiet time between two quotes: random, so the screen does not feel scheduled. */
export const MIN_GAP_MS = 20_000;
export const MAX_GAP_MS = 45_000;
/** With reduced motion the quote does not move: it stays in place this long, then disappears. */
export const STATIC_VISIBLE_MS = 9_000;

/** Random pause before the next quote; `random` returns a number in [0, 1) and is injectable for tests. */
export function nextGapMs(random: () => number = Math.random): number {
  return Math.round(MIN_GAP_MS + random() * (MAX_GAP_MS - MIN_GAP_MS));
}
