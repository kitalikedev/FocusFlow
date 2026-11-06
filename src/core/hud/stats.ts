import type { FocusSessionRecord } from '@/shared/types/contracts';

/** Calendar day in the browser's local timezone (AC-21.2), e.g. "2026-11-6". */
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function sessionDayKeys(sessions: FocusSessionRecord[]): Set<string> {
  const keys = new Set<string>();
  for (const session of sessions) {
    const date = new Date(session.completedAt);
    if (!Number.isNaN(date.getTime())) keys.add(dayKey(date));
  }
  return keys;
}

/** Focus sessions completed on the local day of `now` (FR-30 session counter). */
export function countToday(sessions: FocusSessionRecord[], now: Date = new Date()): number {
  const today = dayKey(now);
  return sessions.filter((session) => {
    const date = new Date(session.completedAt);
    return !Number.isNaN(date.getTime()) && dayKey(date) === today;
  }).length;
}

/**
 * Consecutive local days with at least one session. The streak is still alive when today has no session
 * yet but yesterday had one. Only the sessions that were loaded count (the data layer returns 90 days).
 */
export function computeStreak(sessions: FocusSessionRecord[], now: Date = new Date()): number {
  const days = sessionDayKeys(sessions);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
