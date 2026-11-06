import type { SessionType, TimerDurations, TimerMode } from '@/shared/types/contracts';

/** Presets only define focus and short break; the long break stays the user's own value (plan Q2). */
export const PRESETS = {
  pomodoro: { focus: 25 * 60, shortBreak: 5 * 60 },
  '52_17': { focus: 52 * 60, shortBreak: 17 * 60 },
  deep_work: { focus: 90 * 60, shortBreak: 15 * 60 },
} as const;

export type PresetMode = keyof typeof PRESETS;

export const DEFAULT_DURATIONS: TimerDurations = { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };

export function isPresetMode(mode: TimerMode): mode is PresetMode {
  return mode in PRESETS;
}

/** Whole seconds left, rounded up so `00:00` appears exactly when the target time is reached (plan Q1). */
export function computeRemaining(targetEndTime: number, now: number): number {
  return Math.max(0, Math.ceil((targetEndTime - now) / 1000));
}

/** Whole seconds elapsed since `startedAt` (stopwatch). */
export function computeElapsed(startedAt: number, now: number): number {
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

/** Milliseconds until the next whole-second boundary measured from `anchor` (always 1..1000). */
export function msUntilNextBoundary(anchor: number, now: number): number {
  const phase = (((now - anchor) % 1000) + 1000) % 1000;
  return 1000 - phase;
}

export function sessionTotalSeconds(sessionType: SessionType, durations: TimerDurations): number {
  switch (sessionType) {
    case 'focus':
      return durations.focus;
    case 'short_break':
      return durations.shortBreak;
    case 'long_break':
      return durations.longBreak;
    default:
      return 0;
  }
}

/** Mode is not stored in the database: it is derived from the saved focus / short break pair. */
export function deriveMode(durations: TimerDurations): TimerMode {
  const match = (Object.keys(PRESETS) as PresetMode[]).find(
    (key) => PRESETS[key].focus === durations.focus && PRESETS[key].shortBreak === durations.shortBreak,
  );
  return match ?? 'custom';
}

export interface CompletionInput {
  sessionType: SessionType;
  cyclesCompleted: number;
  longBreakInterval: number;
  durations: TimerDurations;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export interface NextSession {
  sessionType: SessionType;
  cyclesCompleted: number;
  remainingSeconds: number;
  autoStart: boolean;
}

/** State machine of ARCHITECTURE 6.2 after a countdown session reaches zero. */
export function nextSession(input: CompletionInput): NextSession {
  if (input.sessionType === 'focus') {
    const cyclesCompleted = input.cyclesCompleted + 1;
    const isLongBreak = cyclesCompleted % input.longBreakInterval === 0;
    const sessionType: SessionType = isLongBreak ? 'long_break' : 'short_break';
    return {
      sessionType,
      cyclesCompleted,
      remainingSeconds: sessionTotalSeconds(sessionType, input.durations),
      autoStart: input.autoStartBreaks,
    };
  }
  return {
    sessionType: 'focus',
    cyclesCompleted: input.cyclesCompleted,
    remainingSeconds: input.durations.focus,
    autoStart: input.autoStartFocus,
  };
}

/** Number of lit cycle dots (AC-30.1); the dots stay full during the long break. */
export function filledCycleDots(cyclesCompleted: number, interval: number, sessionType: SessionType): number {
  return sessionType === 'long_break' ? interval : cyclesCompleted % interval;
}
