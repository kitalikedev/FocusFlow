import { create } from 'zustand';
import type { SessionType, TimerActions, TimerDurations, TimerMode, TimerState } from '@/shared/types/contracts';
import { initAudioContext } from '@/shared/lib/web-audio';
import { clampInt } from '@/core/data/defaults';
import { onSessionCompleted, requestNotificationPermission } from './completion';
import {
  DEFAULT_DURATIONS,
  PRESETS,
  computeElapsed,
  computeRemaining,
  deriveMode,
  isPresetMode,
  nextSession,
  sessionTotalSeconds,
} from './timer-engine';
import { Ticker, createTicker } from './ticker';

export interface TimerExtras {
  /**
   * Length in seconds of the session being counted. It stays fixed while the session runs, so recording
   * and progress rings are correct even if the durations are edited mid-session. 0 for the stopwatch.
   */
  sessionSeconds: number;
  /** Stopwatch only: timestamp the count started from (already shifted by the time elapsed before a pause). */
  startedAt: number | null;
  /** Recomputes the time left from `Date.now()`; called by every tick and by visibility / focus events. */
  sync: () => void;
}

export type TimerStore = TimerState & TimerActions & TimerExtras;

const DURATION_MIN = 60;
const DURATION_MAX = 10800;
const INTERVAL_MIN = 1;
const INTERVAL_MAX = 24;

function clampDurations(durations: TimerDurations): TimerDurations {
  return {
    focus: clampInt(durations.focus, DURATION_MIN, DURATION_MAX, DEFAULT_DURATIONS.focus),
    shortBreak: clampInt(durations.shortBreak, DURATION_MIN, DURATION_MAX, DEFAULT_DURATIONS.shortBreak),
    longBreak: clampInt(durations.longBreak, DURATION_MIN, DURATION_MAX, DEFAULT_DURATIONS.longBreak),
  };
}

let ticker: Ticker | null = null;
function getTicker(): Ticker {
  ticker ??= createTicker(() => useTimerStore.getState().sync());
  return ticker;
}

/** Plain data of a fresh timer (no actions), handy for resetting the store in tests. */
export function createInitialTimerState(): TimerState & Omit<TimerExtras, 'sync'> {
  return {
    mode: 'pomodoro',
    status: 'idle',
    sessionType: 'focus',
    remainingSeconds: DEFAULT_DURATIONS.focus,
    targetEndTime: null,
    durations: { ...DEFAULT_DURATIONS },
    cyclesCompleted: 0,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
    sessionSeconds: DEFAULT_DURATIONS.focus,
    startedAt: null,
  };
}

/** Fields that put the timer back to a stopped, full-length session of the given type. */
function idleSession(sessionType: SessionType, durations: TimerDurations) {
  const total = sessionTotalSeconds(sessionType, durations);
  return {
    status: 'idle' as const,
    sessionType,
    remainingSeconds: total,
    sessionSeconds: total,
    targetEndTime: null,
    startedAt: null,
  };
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  ...createInitialTimerState(),

  start: () => {
    const state = get();
    if (state.status === 'running') return;
    void initAudioContext();
    requestNotificationPermission();
    const now = Date.now();

    if (state.mode === 'stopwatch') {
      // remainingSeconds carries the elapsed seconds in stopwatch mode (plan Q8).
      const startedAt = now - state.remainingSeconds * 1000;
      set({ status: 'running', startedAt, targetEndTime: null });
      getTicker().start(startedAt);
      return;
    }

    if (state.remainingSeconds <= 0) return;
    const targetEndTime = now + state.remainingSeconds * 1000;
    set({ status: 'running', targetEndTime });
    getTicker().start(targetEndTime);
  },

  pause: () => {
    get().sync();
    const state = get();
    if (state.status !== 'running') return;
    getTicker().stop();
    set({ status: 'paused', targetEndTime: null, startedAt: null });
  },

  reset: () => {
    getTicker().stop();
    const state = get();
    if (state.mode === 'stopwatch') {
      set({ status: 'idle', remainingSeconds: 0, sessionSeconds: 0, targetEndTime: null, startedAt: null });
      return;
    }
    set(idleSession(state.sessionType, state.durations));
  },

  setMode: (mode: TimerMode, customDurations) => {
    getTicker().stop();
    const state = get();
    if (mode === 'stopwatch') {
      set({
        mode,
        cyclesCompleted: 0,
        status: 'idle',
        sessionType: 'stopwatch',
        remainingSeconds: 0,
        sessionSeconds: 0,
        targetEndTime: null,
        startedAt: null,
      });
      return;
    }
    const durations = clampDurations(
      isPresetMode(mode)
        ? { ...state.durations, ...PRESETS[mode] }
        : { ...state.durations, ...customDurations },
    );
    set({ mode, durations, cyclesCompleted: 0, ...idleSession('focus', durations) });
  },

  skipSession: () => {
    const state = get();
    if (state.mode === 'stopwatch') return;
    getTicker().stop();
    // Skipping neither records a session nor counts a cycle (plan Q5).
    const target: SessionType = state.sessionType === 'focus' ? 'short_break' : 'focus';
    set(idleSession(target, state.durations));
  },

  updateSettings: (settings) => {
    const state = get();
    const durations = settings.durations ? clampDurations({ ...state.durations, ...settings.durations }) : state.durations;
    const patch: Partial<TimerStore> = {
      durations,
      longBreakInterval: clampInt(
        settings.longBreakInterval,
        INTERVAL_MIN,
        INTERVAL_MAX,
        state.longBreakInterval,
      ),
      autoStartBreaks: settings.autoStartBreaks ?? state.autoStartBreaks,
      autoStartFocus: settings.autoStartFocus ?? state.autoStartFocus,
    };
    if (settings.durations && state.mode !== 'stopwatch') patch.mode = deriveMode(durations);
    // AC-12.1: an idle timer shows the new length at once; a running or paused session keeps its own.
    if (state.status === 'idle' && state.mode !== 'stopwatch') {
      Object.assign(patch, idleSession(state.sessionType, durations));
    }
    set(patch);
  },

  sync: () => {
    const state = get();
    if (state.status !== 'running') return;
    const now = Date.now();

    if (state.mode === 'stopwatch') {
      const elapsed = computeElapsed(state.startedAt ?? now, now);
      if (elapsed !== state.remainingSeconds) set({ remainingSeconds: elapsed });
      return;
    }
    if (state.targetEndTime === null) return;

    if (now >= state.targetEndTime) {
      completeCountdown();
      return;
    }
    const remaining = computeRemaining(state.targetEndTime, now);
    if (remaining !== state.remainingSeconds) set({ remainingSeconds: remaining });
  },
}));

/** Moves to the next session (ARCHITECTURE 6.2) then runs the side effects. Only one session per call (plan Q12). */
function completeCountdown(): void {
  const state = useTimerStore.getState();
  getTicker().stop();
  const next = nextSession(state);
  const targetEndTime = next.autoStart ? Date.now() + next.remainingSeconds * 1000 : null;
  useTimerStore.setState({
    status: next.autoStart ? 'running' : 'idle',
    sessionType: next.sessionType,
    cyclesCompleted: next.cyclesCompleted,
    remainingSeconds: next.remainingSeconds,
    sessionSeconds: next.remainingSeconds,
    targetEndTime,
    startedAt: null,
  });
  if (targetEndTime !== null) getTicker().start(targetEndTime);
  onSessionCompleted({ sessionType: state.sessionType, sessionSeconds: state.sessionSeconds });
}
