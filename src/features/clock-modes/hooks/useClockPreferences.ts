import { useCallback } from 'react';
import type { UserSettings } from '@/shared/types/contracts';
import { useSettingsStore } from '@/core/data/useSettingsStore';

export type ClockVisualMode = UserSettings['clockVisualMode'];
/** Zen is driven by `useUiStore.isZen` (key F); the stored value `'zen'` is shown as Center (plan A3). */
export type ClockPosition = 'center' | 'mini_corner';

export interface ClockPreferences {
  visualMode: ClockVisualMode;
  position: ClockPosition;
  setVisualMode: (mode: ClockVisualMode) => void;
  setPosition: (position: ClockPosition) => void;
}

/**
 * Applies the change at once, then persists it to `user_settings` / localStorage (FR-09).
 * Both clock preferences are always sent together: two quick clicks start two saves in parallel,
 * and the later one must not bring back the old value of the other preference.
 */
function savePreference(patch: Partial<Pick<UserSettings, 'clockVisualMode' | 'clockPosition'>>): void {
  useSettingsStore.setState((state) => ({ settings: { ...state.settings, ...patch } }));
  const { clockVisualMode, clockPosition } = useSettingsStore.getState().settings;
  void useSettingsStore.getState().update({ clockVisualMode, clockPosition });
}

export function useClockPreferences(): ClockPreferences {
  const visualMode = useSettingsStore((state) => state.settings.clockVisualMode);
  const storedPosition = useSettingsStore((state) => state.settings.clockPosition);

  const setVisualMode = useCallback((mode: ClockVisualMode) => savePreference({ clockVisualMode: mode }), []);
  const setPosition = useCallback((position: ClockPosition) => savePreference({ clockPosition: position }), []);

  return {
    visualMode,
    position: storedPosition === 'mini_corner' ? 'mini_corner' : 'center',
    setVisualMode,
    setPosition,
  };
}
