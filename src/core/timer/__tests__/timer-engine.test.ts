import { describe, it, expect } from 'vitest';
import {
  DEFAULT_DURATIONS,
  PRESETS,
  computeElapsed,
  computeRemaining,
  deriveMode,
  filledCycleDots,
  isPresetMode,
  msUntilNextBoundary,
  nextSession,
  sessionTotalSeconds,
} from '../timer-engine';

describe('computeRemaining', () => {
  it('rounds up so the display reaches 00:00 exactly at the target time', () => {
    expect(computeRemaining(10_000, 0)).toBe(10);
    expect(computeRemaining(10_000, 1)).toBe(10);
    expect(computeRemaining(10_000, 999)).toBe(10);
    expect(computeRemaining(10_000, 1_000)).toBe(9);
    expect(computeRemaining(10_000, 9_999)).toBe(1);
    expect(computeRemaining(10_000, 10_000)).toBe(0);
  });

  it('never goes negative after the target', () => {
    expect(computeRemaining(10_000, 99_999)).toBe(0);
  });
});

describe('computeElapsed', () => {
  it('floors elapsed seconds and clamps negatives', () => {
    expect(computeElapsed(1_000, 1_999)).toBe(0);
    expect(computeElapsed(1_000, 2_000)).toBe(1);
    expect(computeElapsed(5_000, 1_000)).toBe(0);
  });
});

describe('msUntilNextBoundary', () => {
  it('returns the distance to the next whole second from the anchor', () => {
    expect(msUntilNextBoundary(0, 250)).toBe(750);
    expect(msUntilNextBoundary(0, 1_000)).toBe(1_000);
    expect(msUntilNextBoundary(300, 1_299)).toBe(1);
  });

  it('handles a now that is before the anchor', () => {
    expect(msUntilNextBoundary(5_000, 4_250)).toBe(750);
  });
});

describe('presets', () => {
  it('matches AC-04.1 and AC-04.2', () => {
    expect(PRESETS.pomodoro).toEqual({ focus: 1500, shortBreak: 300 });
    expect(PRESETS['52_17']).toEqual({ focus: 3120, shortBreak: 1020 });
    expect(PRESETS.deep_work).toEqual({ focus: 5400, shortBreak: 900 });
  });

  it('detects preset modes', () => {
    expect(isPresetMode('pomodoro')).toBe(true);
    expect(isPresetMode('custom')).toBe(false);
    expect(isPresetMode('stopwatch')).toBe(false);
  });

  it('derives the mode from saved durations, ignoring the long break', () => {
    expect(deriveMode(DEFAULT_DURATIONS)).toBe('pomodoro');
    expect(deriveMode({ focus: 3120, shortBreak: 1020, longBreak: 600 })).toBe('52_17');
    expect(deriveMode({ focus: 5400, shortBreak: 900, longBreak: 900 })).toBe('deep_work');
    expect(deriveMode({ focus: 2700, shortBreak: 300, longBreak: 900 })).toBe('custom');
  });
});

describe('sessionTotalSeconds', () => {
  it('maps every session type', () => {
    expect(sessionTotalSeconds('focus', DEFAULT_DURATIONS)).toBe(1500);
    expect(sessionTotalSeconds('short_break', DEFAULT_DURATIONS)).toBe(300);
    expect(sessionTotalSeconds('long_break', DEFAULT_DURATIONS)).toBe(900);
    expect(sessionTotalSeconds('stopwatch', DEFAULT_DURATIONS)).toBe(0);
  });
});

describe('nextSession (ARCHITECTURE 6.2)', () => {
  const base = {
    sessionType: 'focus' as const,
    cyclesCompleted: 0,
    longBreakInterval: 4,
    durations: DEFAULT_DURATIONS,
    autoStartBreaks: false,
    autoStartFocus: false,
  };

  it('goes to a short break after a focus session and counts the cycle', () => {
    expect(nextSession(base)).toEqual({
      sessionType: 'short_break',
      cyclesCompleted: 1,
      remainingSeconds: 300,
      autoStart: false,
    });
  });

  it('goes to the long break after the 4th focus session (AC-05.1)', () => {
    expect(nextSession({ ...base, cyclesCompleted: 3 })).toMatchObject({
      sessionType: 'long_break',
      cyclesCompleted: 4,
      remainingSeconds: 900,
    });
  });

  it('honours a custom interval', () => {
    expect(nextSession({ ...base, cyclesCompleted: 1, longBreakInterval: 2 }).sessionType).toBe('long_break');
  });

  it('auto-starts breaks only when enabled (AC-05.2)', () => {
    expect(nextSession({ ...base, autoStartBreaks: true }).autoStart).toBe(true);
    expect(nextSession({ ...base, autoStartFocus: true }).autoStart).toBe(false);
  });

  it('returns to focus after any break without counting a cycle', () => {
    for (const sessionType of ['short_break', 'long_break'] as const) {
      expect(nextSession({ ...base, sessionType, cyclesCompleted: 4, autoStartFocus: true })).toEqual({
        sessionType: 'focus',
        cyclesCompleted: 4,
        remainingSeconds: 1500,
        autoStart: true,
      });
    }
    expect(nextSession({ ...base, sessionType: 'short_break' }).autoStart).toBe(false);
  });
});

describe('filledCycleDots (AC-30.1)', () => {
  it('lights the dots of the current cycle', () => {
    expect(filledCycleDots(2, 4, 'focus')).toBe(2);
    expect(filledCycleDots(1, 4, 'short_break')).toBe(1);
  });

  it('keeps all dots lit during the long break and restarts afterwards', () => {
    expect(filledCycleDots(4, 4, 'long_break')).toBe(4);
    expect(filledCycleDots(4, 4, 'focus')).toBe(0);
  });
});
