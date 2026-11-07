import { vi } from 'vitest';
import { createDefaultSettings } from '@/core/data/defaults';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { createInitialTimerState, useTimerStore } from '@/core/timer/useTimerStore';
import { useUiStore } from '@/core/ui/useUiStore';

/** Fresh stores for every test: idle Pomodoro timer, default settings, no Zen, popover closed. */
export function resetStores(): void {
  useTimerStore.getState().reset();
  useTimerStore.setState(createInitialTimerState());
  useSettingsStore.setState({ settings: createDefaultSettings(), status: 'ready' });
  useUiStore.setState({ isZen: false, isClockSettingsOpen: false });
  localStorage.clear();
}

/** Makes `window.matchMedia` answer true for the given queries only. */
export function mockMediaQueries(matching: string[]): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: matching.includes(query),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}
