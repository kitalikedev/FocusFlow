import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../completion', () => ({
  onSessionCompleted: vi.fn(),
  requestNotificationPermission: vi.fn(),
}));
vi.mock('@/shared/lib/web-audio', () => ({
  initAudioContext: vi.fn().mockResolvedValue(undefined),
  setMasterVolume: vi.fn(),
}));

import { onSessionCompleted, requestNotificationPermission } from '../completion';
import { initAudioContext } from '@/shared/lib/web-audio';
import { createInitialTimerState, useTimerStore } from '../useTimerStore';
import { initializeTimer } from '../initializeTimer';

const START = new Date('2026-11-06T10:00:00.000Z').getTime();

function api() {
  return useTimerStore.getState();
}
function reset() {
  api().reset();
  useTimerStore.setState(createInitialTimerState());
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(START);
  vi.clearAllMocks();
  reset();
});
afterEach(() => {
  api().reset();
  vi.useRealTimers();
});

describe('presets (FR-04)', () => {
  it('AC-04.1: Pomodoro shows 25:00 as Focus with a 5 minute short break', () => {
    api().setMode('pomodoro');
    expect(api()).toMatchObject({ remainingSeconds: 1500, sessionType: 'focus', status: 'idle' });
    expect(api().durations.shortBreak).toBe(300);
  });

  it('AC-04.2: 52/17 and Deep Work', () => {
    api().setMode('52_17');
    expect(api()).toMatchObject({ remainingSeconds: 3120, mode: '52_17' });
    expect(api().durations.shortBreak).toBe(1020);

    api().setMode('deep_work');
    expect(api()).toMatchObject({ remainingSeconds: 5400, mode: 'deep_work' });
    expect(api().durations.shortBreak).toBe(900);
  });

  it('keeps the user long break when a preset is chosen (plan Q2)', () => {
    api().updateSettings({ durations: { focus: 1500, shortBreak: 300, longBreak: 1200 } });
    api().setMode('52_17');
    expect(api().durations.longBreak).toBe(1200);
  });

  it('custom mode merges and clamps the given durations', () => {
    api().setMode('custom', { focus: 2700, shortBreak: 5 });
    expect(api().durations).toMatchObject({ focus: 2700, shortBreak: 60 });
    expect(api().remainingSeconds).toBe(2700);
    api().setMode('custom');
    expect(api().durations.focus).toBe(2700);
  });

  it('switching mode stops a running timer and resets the cycles', () => {
    api().start();
    useTimerStore.setState({ cyclesCompleted: 3 });
    api().setMode('deep_work');
    expect(api()).toMatchObject({ status: 'idle', cyclesCompleted: 0, targetEndTime: null });
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('countdown (FR-06)', () => {
  it('start sets targetEndTime and unlocks audio / notifications on the first gesture', () => {
    api().start();
    expect(api()).toMatchObject({ status: 'running', targetEndTime: START + 1_500_000 });
    expect(initAudioContext).toHaveBeenCalled();
    expect(requestNotificationPermission).toHaveBeenCalled();
  });

  it('start while running or with nothing left is a no-op', () => {
    api().start();
    const target = api().targetEndTime;
    vi.advanceTimersByTime(3_000);
    api().start();
    expect(api().targetEndTime).toBe(target);

    reset();
    useTimerStore.setState({ remainingSeconds: 0 });
    api().start();
    expect(api().status).toBe('idle');
  });

  it('ticks the display down once per second', () => {
    api().start();
    vi.advanceTimersByTime(1_010);
    expect(api().remainingSeconds).toBe(1499);
    vi.advanceTimersByTime(4_000);
    expect(api().remainingSeconds).toBe(1495);
  });

  it('AC-06.1: shows 10:00 after 10 minutes in a background tab with no ticks', () => {
    useTimerStore.setState({ remainingSeconds: 1200 }); // 20:00 left of 25:00
    const cleanup = initializeTimer();
    api().start();
    expect(api().targetEndTime).toBe(START + 1_200_000);

    // Throttled tab: the clock moves 600 000 ms but no timer callback ran.
    vi.setSystemTime(START + 600_000);
    document.dispatchEvent(new Event('visibilitychange'));

    expect(api().remainingSeconds).toBe(600);
    cleanup();
  });

  it('AC-06.2: completes immediately after sleep and wake, once, with the chime', () => {
    useTimerStore.setState({ remainingSeconds: 900 });
    const cleanup = initializeTimer();
    api().start();

    vi.setSystemTime(START + 20 * 60_000);
    window.dispatchEvent(new Event('focus'));
    window.dispatchEvent(new Event('focus'));

    expect(onSessionCompleted).toHaveBeenCalledTimes(1);
    expect(api()).toMatchObject({ status: 'idle', sessionType: 'short_break', remainingSeconds: 300 });
    cleanup();
  });

  it('completes within 100 ms of the target time (NFR-5.2)', () => {
    useTimerStore.setState({ remainingSeconds: 5 });
    api().start();
    const target = api().targetEndTime as number;
    let completedAt = 0;
    vi.mocked(onSessionCompleted).mockImplementationOnce(() => {
      completedAt = Date.now();
    });

    vi.advanceTimersByTime(5_100);
    expect(completedAt).toBeGreaterThanOrEqual(target);
    expect(completedAt - target).toBeLessThanOrEqual(100);
  });

  it('pause keeps the remaining time and resume recomputes the target', () => {
    api().start();
    vi.advanceTimersByTime(10_500);
    api().pause();
    expect(api()).toMatchObject({ status: 'paused', targetEndTime: null, remainingSeconds: 1490 });
    expect(vi.getTimerCount()).toBe(0);

    vi.advanceTimersByTime(60_000);
    expect(api().remainingSeconds).toBe(1490);

    api().start();
    expect(api().targetEndTime).toBe(Date.now() + 1_490_000);
  });

  it('pause outside a running session does nothing', () => {
    api().pause();
    expect(api().status).toBe('idle');
  });

  it('pause right after the deadline completes instead of pausing', () => {
    useTimerStore.setState({ remainingSeconds: 2 });
    api().start();
    vi.setSystemTime(START + 5_000);
    api().pause();
    expect(onSessionCompleted).toHaveBeenCalledTimes(1);
    expect(api().status).toBe('idle');
  });

  it('reset restores the full length of the current session', () => {
    api().start();
    vi.advanceTimersByTime(30_000);
    api().reset();
    expect(api()).toMatchObject({ status: 'idle', remainingSeconds: 1500, targetEndTime: null });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('sync ignores a timer that is not running', () => {
    api().sync();
    expect(api().remainingSeconds).toBe(1500);
  });

  it('sync ignores a running countdown without a target', () => {
    useTimerStore.setState({ status: 'running', targetEndTime: null });
    api().sync();
    expect(api().status).toBe('running');
  });
});

describe('long break and auto start (FR-05)', () => {
  function finishCurrentSession() {
    vi.setSystemTime(Date.now() + (api().remainingSeconds + 1) * 1000);
    api().sync();
  }

  it('AC-05.1: the 4th focus session leads to a 15 minute long break', () => {
    for (let i = 0; i < 3; i += 1) {
      api().start();
      finishCurrentSession(); // focus -> short break
      api().start();
      finishCurrentSession(); // short break -> focus
    }
    api().start();
    finishCurrentSession();

    expect(api()).toMatchObject({ sessionType: 'long_break', remainingSeconds: 900, cyclesCompleted: 4 });
  });

  it('AC-05.2: auto-starts the break and keeps the clock running', () => {
    api().updateSettings({ autoStartBreaks: true });
    api().start();
    finishCurrentSession();

    expect(api()).toMatchObject({ status: 'running', sessionType: 'short_break', remainingSeconds: 300 });
    expect(api().targetEndTime).toBe(Date.now() + 300_000);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('does not auto-start focus after a break unless enabled', () => {
    useTimerStore.setState({ sessionType: 'short_break', remainingSeconds: 300, sessionSeconds: 300 });
    api().start();
    finishCurrentSession();
    expect(api()).toMatchObject({ status: 'idle', sessionType: 'focus', remainingSeconds: 1500 });

    api().updateSettings({ autoStartFocus: true });
    useTimerStore.setState({ sessionType: 'short_break', remainingSeconds: 300, sessionSeconds: 300 });
    api().start();
    finishCurrentSession();
    expect(api().status).toBe('running');
  });

  it('plan Q12: sleeping through several sessions completes only one', () => {
    api().updateSettings({ autoStartBreaks: true, autoStartFocus: true });
    api().start();
    vi.setSystemTime(START + 3 * 3600_000);
    api().sync();

    expect(onSessionCompleted).toHaveBeenCalledTimes(1);
    expect(api()).toMatchObject({ status: 'running', sessionType: 'short_break', remainingSeconds: 300 });
  });

  it('reports the length of the session that finished, even if durations changed mid-session', () => {
    api().start();
    api().updateSettings({ durations: { focus: 600, shortBreak: 300, longBreak: 900 } });
    finishCurrentSession();
    expect(onSessionCompleted).toHaveBeenCalledWith({ sessionType: 'focus', sessionSeconds: 1500 });
  });
});

describe('skip (plan Q5)', () => {
  it('moves focus to a short break and back without recording or counting', () => {
    api().start();
    api().skipSession();
    expect(api()).toMatchObject({ status: 'idle', sessionType: 'short_break', remainingSeconds: 300, cyclesCompleted: 0 });

    api().skipSession();
    expect(api()).toMatchObject({ sessionType: 'focus', remainingSeconds: 1500 });
    expect(onSessionCompleted).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('is ignored for the stopwatch', () => {
    api().setMode('stopwatch');
    api().skipSession();
    expect(api().sessionType).toBe('stopwatch');
  });
});

describe('stopwatch (AC-04.3, plan Q8)', () => {
  it('counts up from 00:00 and never completes', () => {
    api().setMode('stopwatch');
    expect(api()).toMatchObject({ sessionType: 'stopwatch', remainingSeconds: 0 });

    api().start();
    expect(api().targetEndTime).toBeNull();
    vi.advanceTimersByTime(3_010);
    expect(api().remainingSeconds).toBe(3);
    vi.advanceTimersByTime(4 * 3600_000);
    expect(api().status).toBe('running');
    expect(onSessionCompleted).not.toHaveBeenCalled();
  });

  it('pause and resume continue from the elapsed time', () => {
    api().setMode('stopwatch');
    api().start();
    vi.advanceTimersByTime(5_010);
    api().pause();
    expect(api().remainingSeconds).toBe(5);

    vi.advanceTimersByTime(60_000);
    api().start();
    vi.advanceTimersByTime(2_010);
    expect(api().remainingSeconds).toBe(7);
  });

  it('reset goes back to 00:00', () => {
    api().setMode('stopwatch');
    api().start();
    vi.advanceTimersByTime(5_010);
    api().reset();
    expect(api()).toMatchObject({ status: 'idle', remainingSeconds: 0 });
  });

  it('sync leaves the display untouched when nothing changed', () => {
    api().setMode('stopwatch');
    api().start();
    const before = api().remainingSeconds;
    api().sync();
    expect(api().remainingSeconds).toBe(before);
  });

  it('keeps counting from zero when started state has no anchor', () => {
    api().setMode('stopwatch');
    useTimerStore.setState({ status: 'running', startedAt: null });
    api().sync();
    expect(api().remainingSeconds).toBe(0);
  });
});

describe('updateSettings (AC-12.1)', () => {
  it('shows the new length at once when idle and derives the mode', () => {
    api().updateSettings({ durations: { focus: 2700, shortBreak: 300, longBreak: 900 } });
    expect(api()).toMatchObject({ remainingSeconds: 2700, mode: 'custom' });

    api().updateSettings({ durations: { focus: 1500, shortBreak: 300, longBreak: 900 } });
    expect(api().mode).toBe('pomodoro');
  });

  it('leaves a running or paused session alone', () => {
    api().start();
    api().updateSettings({ durations: { focus: 600, shortBreak: 300, longBreak: 900 } });
    expect(api().remainingSeconds).toBe(1500);
    api().pause();
    api().updateSettings({ durations: { focus: 700, shortBreak: 300, longBreak: 900 } });
    expect(api().remainingSeconds).toBe(1500);
  });

  it('clamps durations and the long break interval', () => {
    api().updateSettings({
      durations: { focus: 99999, shortBreak: 1, longBreak: 900 },
      longBreakInterval: 99,
    });
    expect(api().durations).toMatchObject({ focus: 10800, shortBreak: 60 });
    expect(api().longBreakInterval).toBe(24);
    api().updateSettings({ longBreakInterval: 0 });
    expect(api().longBreakInterval).toBe(1);
  });

  it('keeps stopwatch mode and ignores the idle refresh', () => {
    api().setMode('stopwatch');
    api().updateSettings({ durations: { focus: 2700, shortBreak: 300, longBreak: 900 } });
    expect(api()).toMatchObject({ mode: 'stopwatch', remainingSeconds: 0 });
  });

  it('keeps unrelated values when only a flag changes', () => {
    api().updateSettings({ autoStartFocus: true });
    expect(api()).toMatchObject({ autoStartFocus: true, autoStartBreaks: false, longBreakInterval: 4 });
  });
});
