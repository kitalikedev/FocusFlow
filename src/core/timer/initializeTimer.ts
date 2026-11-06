import { UserSettings } from '@/shared/types/contracts';
import { setMasterVolume } from '@/shared/lib/web-audio';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { TimerStore, useTimerStore } from './useTimerStore';

function timerSettingsOf(state: TimerStore) {
  return {
    timerDurations: state.durations,
    longBreakInterval: state.longBreakInterval,
    autoStartBreaks: state.autoStartBreaks,
    autoStartFocus: state.autoStartFocus,
  };
}

function matchesSettings(timer: TimerStore, settings: UserSettings): boolean {
  const { durations } = timer;
  const saved = settings.timerDurations;
  return (
    durations.focus === saved.focus &&
    durations.shortBreak === saved.shortBreak &&
    durations.longBreak === saved.longBreak &&
    timer.longBreakInterval === settings.longBreakInterval &&
    timer.autoStartBreaks === settings.autoStartBreaks &&
    timer.autoStartFocus === settings.autoStartFocus
  );
}

/**
 * Wires the timer to the rest of the app and returns the cleanup function:
 * - saved settings (durations, auto-start, master volume) flow into the timer, and timer changes flow back (FR-09);
 * - visibilitychange / focus recompute the time left immediately, without waiting for the next tick (FR-06).
 */
export function initializeTimer(): () => void {
  const applySettings = (settings: UserSettings) => {
    setMasterVolume(settings.ambientVolumes.master);
    if (matchesSettings(useTimerStore.getState(), settings)) return;
    useTimerStore.getState().updateSettings({
      durations: settings.timerDurations,
      longBreakInterval: settings.longBreakInterval,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartFocus: settings.autoStartFocus,
    });
  };

  applySettings(useSettingsStore.getState().settings);
  const unsubscribeSettings = useSettingsStore.subscribe((state, previous) => {
    if (state.settings !== previous.settings) applySettings(state.settings);
  });

  // Only persist once settings were loaded, otherwise the defaults would overwrite the saved ones.
  const unsubscribeTimer = useTimerStore.subscribe((state, previous) => {
    const changed =
      state.durations !== previous.durations ||
      state.longBreakInterval !== previous.longBreakInterval ||
      state.autoStartBreaks !== previous.autoStartBreaks ||
      state.autoStartFocus !== previous.autoStartFocus;
    if (!changed) return;
    const settingsStore = useSettingsStore.getState();
    if (settingsStore.status !== 'ready' || matchesSettings(state, settingsStore.settings)) return;
    void settingsStore.update(timerSettingsOf(state));
  });

  const resync = () => useTimerStore.getState().sync();
  document.addEventListener('visibilitychange', resync);
  window.addEventListener('focus', resync);

  return () => {
    unsubscribeSettings();
    unsubscribeTimer();
    document.removeEventListener('visibilitychange', resync);
    window.removeEventListener('focus', resync);
  };
}
