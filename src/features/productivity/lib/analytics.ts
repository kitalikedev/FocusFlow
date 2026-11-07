import type { FocusSessionRecord } from '@/shared/types/contracts';

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Local midnight of the Monday that starts the week of `now` (AC-21.3). */
export function startOfWeek(now: Date): Date {
  const day = (now.getDay() + 6) % 7; // Monday = 0
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
}

/** Focus minutes for Monday..Sunday of the current local week. */
export function weekMinutes(sessions: FocusSessionRecord[], now: Date = new Date()): number[] {
  const start = startOfWeek(now).getTime();
  const totals = [0, 0, 0, 0, 0, 0, 0];
  for (const session of sessions) {
    const date = new Date(session.completedAt);
    if (Number.isNaN(date.getTime()) || date.getTime() < start) continue;
    const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const index = Math.round((local.getTime() - start) / 86_400_000);
    if (index >= 0 && index < 7) totals[index] += session.durationMinutes;
  }
  return totals;
}

export interface IntentTotal {
  title: string;
  minutes: number;
}

export const NO_INTENT_LABEL = 'No intent';

/** Minutes per focus intent (AC-29.2), largest first; sessions without intent are grouped together. */
export function minutesByIntent(sessions: FocusSessionRecord[], limit = 5): IntentTotal[] {
  const totals = new Map<string, IntentTotal>();
  for (const session of sessions) {
    const title = session.intentTitle?.trim() || NO_INTENT_LABEL;
    const key = title.toLocaleLowerCase();
    const entry = totals.get(key) ?? { title, minutes: 0 };
    entry.minutes += session.durationMinutes;
    totals.set(key, entry);
  }
  return [...totals.values()].sort((a, b) => b.minutes - a.minutes).slice(0, limit);
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
