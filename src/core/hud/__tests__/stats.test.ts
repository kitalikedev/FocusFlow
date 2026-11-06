import { describe, it, expect } from 'vitest';
import type { FocusSessionRecord } from '@/shared/types/contracts';
import { computeStreak, countToday } from '../stats';

// Local-time constructors keep the tests independent of the machine timezone (AC-21.2).
const NOW = new Date(2026, 10, 6, 15, 0, 0);

function session(date: Date): FocusSessionRecord {
  return { id: crypto.randomUUID(), durationMinutes: 25, completedAt: date.toISOString() };
}
const at = (day: number, hour = 12) => session(new Date(2026, 10, day, hour, 0, 0));

describe('countToday', () => {
  it('counts only sessions of the current local day', () => {
    expect(countToday([at(6, 0), at(6, 23), at(5, 23), at(7, 0)], NOW)).toBe(2);
  });

  it('ignores invalid dates', () => {
    expect(countToday([{ id: 'x', durationMinutes: 1, completedAt: 'nope' }], NOW)).toBe(0);
  });

  it('is 0 without sessions', () => {
    expect(countToday([], NOW)).toBe(0);
  });
});

describe('computeStreak (AC-21.2)', () => {
  it('counts consecutive local days ending today', () => {
    expect(computeStreak([at(6), at(5), at(4)], NOW)).toBe(3);
  });

  it('counts several sessions on one day once', () => {
    expect(computeStreak([at(6, 9), at(6, 10), at(5)], NOW)).toBe(2);
  });

  it('stays alive when only yesterday has a session', () => {
    expect(computeStreak([at(5), at(4)], NOW)).toBe(2);
  });

  it('breaks when a day is missing', () => {
    expect(computeStreak([at(6), at(4), at(3)], NOW)).toBe(1);
  });

  it('is 0 when neither today nor yesterday has a session', () => {
    expect(computeStreak([at(3), at(2)], NOW)).toBe(0);
    expect(computeStreak([], NOW)).toBe(0);
  });

  it('crosses month and year boundaries', () => {
    const jan2 = new Date(2027, 0, 2, 10);
    const sessions = [
      session(new Date(2027, 0, 2, 9)),
      session(new Date(2027, 0, 1, 9)),
      session(new Date(2026, 11, 31, 23, 59)),
    ];
    expect(computeStreak(sessions, jan2)).toBe(3);
  });

  it('treats 23:59 and 00:00 as different days', () => {
    expect(computeStreak([at(6, 0), at(5, 23)], NOW)).toBe(2);
  });

  it('ignores invalid dates', () => {
    expect(computeStreak([{ id: 'x', durationMinutes: 1, completedAt: 'nope' }, at(6)], NOW)).toBe(1);
  });
});
