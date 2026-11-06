import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/shared/lib/web-audio', () => ({
  initAudioContext: vi.fn().mockResolvedValue(undefined),
  setMasterVolume: vi.fn(),
  playChime: vi.fn(),
}));
vi.mock('../completion', () => ({
  onSessionCompleted: vi.fn(),
  requestNotificationPermission: vi.fn(),
}));

import { setMasterVolume } from '@/shared/lib/web-audio';
import { createDefaultSettings } from '@/core/data/defaults';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { initializeTimer } from '../initializeTimer';
import { createInitialTimerState, useTimerStore } from '../useTimerStore';

const update = vi.fn().mockResolvedValue(undefined);
let cleanup: (() => void) | null = null;

function settingsWith(patch: Record<string, unknown>) {
  return { ...createDefaultSettings(), ...patch };
}

beforeEach(() => {
  vi.clearAllMocks();
  useTimerStore.getState().reset();
  useTimerStore.setState(createInitialTimerState());
  useSettingsStore.setState({ settings: createDefaultSettings(), status: 'ready', update });
});
afterEach(() => {
  cleanup?.();
  cleanup = null;
  useTimerStore.getState().reset();
});

describe('initializeTimer', () => {
  it('applies the saved settings and master volume at startup (FR-09)', () => {
    useSettingsStore.setState({
      settings: settingsWith({
        timerDurations: { focus: 3120, shortBreak: 1020, longBreak: 600 },
        longBreakInterval: 3,
        autoStartBreaks: true,
        ambientVolumes: { rain: 0, brownNoise: 0, campfire: 0, master: 0.4 },
      }),
    });
    cleanup = initializeTimer();

    expect(useTimerStore.getState()).toMatchObject({
      mode: '52_17',
      remainingSeconds: 3120,
      longBreakInterval: 3,
      autoStartBreaks: true,
    });
    expect(setMasterVolume).toHaveBeenCalledWith(0.4);
  });

  it('follows later settings changes such as a login', () => {
    cleanup = initializeTimer();
    useSettingsStore.setState({
      settings: settingsWith({ timerDurations: { focus: 5400, shortBreak: 900, longBreak: 900 } }),
    });
    expect(useTimerStore.getState().mode).toBe('deep_work');
  });

  it('does not touch the timer when the settings already match', () => {
    cleanup = initializeTimer();
    const before = useTimerStore.getState().durations;
    useSettingsStore.setState({ settings: createDefaultSettings() });
    expect(useTimerStore.getState().durations).toBe(before);
    expect(update).not.toHaveBeenCalled();
  });

  it('saves timer changes made by the user', () => {
    cleanup = initializeTimer();
    useTimerStore.getState().setMode('deep_work');
    expect(update).toHaveBeenCalledWith({
      timerDurations: { focus: 5400, shortBreak: 900, longBreak: 900 },
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartFocus: false,
    });
  });

  it('does not save before settings are loaded, nor unrelated state changes', () => {
    useSettingsStore.setState({ status: 'loading' });
    cleanup = initializeTimer();
    useTimerStore.getState().setMode('deep_work');
    expect(update).not.toHaveBeenCalled();

    useSettingsStore.setState({ status: 'ready' });
    useTimerStore.getState().start();
    expect(update).not.toHaveBeenCalled();
  });

  it('does not save when the change came from the saved settings', () => {
    cleanup = initializeTimer();
    useSettingsStore.setState({
      settings: settingsWith({ timerDurations: { focus: 3120, shortBreak: 1020, longBreak: 900 } }),
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('recomputes the time on visibilitychange and focus (FR-06)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    cleanup = initializeTimer();
    useTimerStore.getState().start();

    vi.setSystemTime(60_000);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(useTimerStore.getState().remainingSeconds).toBe(1440);

    vi.setSystemTime(120_000);
    window.dispatchEvent(new Event('focus'));
    expect(useTimerStore.getState().remainingSeconds).toBe(1380);
    useTimerStore.getState().reset();
    vi.useRealTimers();
  });

  it('removes every listener on cleanup', () => {
    const stop = initializeTimer();
    stop();
    useTimerStore.getState().setMode('deep_work');
    expect(update).not.toHaveBeenCalled();

    const sync = vi.spyOn(useTimerStore.getState(), 'sync');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(sync).not.toHaveBeenCalled();
  });
});
