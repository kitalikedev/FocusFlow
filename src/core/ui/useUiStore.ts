import { create } from 'zustand';
import { ToolPanel, UiActions, UiState } from '@/shared/types/contracts';

export type UiStore = UiState & UiActions;

const initialState: UiState = {
  isZen: false,
  isFullscreen: false,
  isMixerOpen: false,
  isWallpaperPickerOpen: false,
  isThemeCustomizerOpen: false,
  isClockSettingsOpen: false,
  isAnalyticsOpen: false,
  isTasksOpen: false,
  isNoteOpen: false,
};

const PANEL_FLAGS: Record<ToolPanel, 'isTasksOpen' | 'isNoteOpen' | 'isMixerOpen'> = {
  tasks: 'isTasksOpen',
  note: 'isNoteOpen',
  mixer: 'isMixerOpen',
};

export const useUiStore = create<UiStore>((set) => ({
  ...initialState,

  toggleZen: () => set((state) => ({ isZen: !state.isZen })),

  // The state follows the browser's `fullscreenchange` event (see watchFullscreen), so pressing Esc or
  // a rejected request can never leave `isFullscreen` out of sync.
  toggleFullscreen: () => {
    if (document.fullscreenElement) {
      void Promise.resolve(document.exitFullscreen?.()).catch(() => {});
    } else {
      void Promise.resolve(document.documentElement.requestFullscreen?.()).catch(() => {});
    }
  },

  setMixerOpen: (isOpen: boolean) => set({ isMixerOpen: isOpen }),
  setWallpaperPickerOpen: (isOpen: boolean) => set({ isWallpaperPickerOpen: isOpen }),
  setThemeCustomizerOpen: (isOpen: boolean) => set({ isThemeCustomizerOpen: isOpen }),
  setClockSettingsOpen: (isOpen: boolean) => set({ isClockSettingsOpen: isOpen }),
  setAnalyticsOpen: (isOpen: boolean) => set({ isAnalyticsOpen: isOpen }),

  togglePanel: (panel: ToolPanel, exclusive = false) =>
    set((state) => {
      const flag = PANEL_FLAGS[panel];
      const next = !state[flag];
      if (!exclusive) return { [flag]: next };
      return { isTasksOpen: false, isNoteOpen: false, isMixerOpen: false, [flag]: next };
    }),
}));

/** Whether the browser can enter fullscreen at all (not the case on iPhone Safari). */
export function isFullscreenSupported(): boolean {
  return document.fullscreenEnabled !== false && typeof document.documentElement.requestFullscreen === 'function';
}

/** Mirrors the browser fullscreen state into the store; returns the cleanup function. */
export function watchFullscreen(): () => void {
  const sync = () => useUiStore.setState({ isFullscreen: Boolean(document.fullscreenElement) });
  document.addEventListener('fullscreenchange', sync);
  sync();
  return () => document.removeEventListener('fullscreenchange', sync);
}
