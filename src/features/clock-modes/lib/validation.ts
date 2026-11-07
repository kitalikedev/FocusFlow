export const MINUTES_MIN = 1;
export const MINUTES_MAX = 180;
export const INTERVAL_MIN = 1;
export const INTERVAL_MAX = 24;

export const MINUTES_ERROR = `Must be between ${MINUTES_MIN} and ${MINUTES_MAX} mins`;
export const INTERVAL_ERROR = `Must be between ${INTERVAL_MIN} and ${INTERVAL_MAX} sessions`;

/** Whole number within [min, max], otherwise null (rejects "", "4.5", "-10", "1e2"). */
export function parseWholeNumber(value: string, min: number, max: number): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return parsed >= min && parsed <= max ? parsed : null;
}
