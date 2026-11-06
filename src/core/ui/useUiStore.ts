import { create } from 'zustand';
import { DrawerTab, UiActions, UiState } from '@/shared/types/contracts';

export type UiStore = UiState & UiActions;

const initialState: UiState = {
  isZen: false,
  isFullscreen: false,
  isMixerOpen: false,
  isWallpaperPickerOpen: false,
  isThemeCustomizerOpen: false,
  isClockSettingsOpen: false,
  isAnalyticsOpen: false,
  isMobileDrawerOpen: false,
  activeDrawerTab: 'timer',
};

export const useUiStore = create<UiStore>((set) => ({
  ...initialState,

  toggleZen: () => set((state) => ({ isZen: !state.isZen })),

  toggleFullscreen: () => {
    set((state) => {
      const nextFullscreen = !state.isFullscreen;
      if (typeof document !== 'undefined') {
        if (nextFullscreen) {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
          }
        } else {
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          }
        }
      }
      return { isFullscreen: nextFullscreen };
    });
  },

  setMixerOpen: (isOpen: boolean) => set({ isMixerOpen: isOpen }),
  setWallpaperPickerOpen: (isOpen: boolean) => set({ isWallpaperPickerOpen: isOpen }),
  setThemeCustomizerOpen: (isOpen: boolean) => set({ isThemeCustomizerOpen: isOpen }),
  setClockSettingsOpen: (isOpen: boolean) => set({ isClockSettingsOpen: isOpen }),
  setAnalyticsOpen: (isOpen: boolean) => set({ isAnalyticsOpen: isOpen }),
  setMobileDrawerOpen: (isOpen: boolean) => set({ isMobileDrawerOpen: isOpen }),
  setActiveDrawerTab: (tab: DrawerTab) => set({ activeDrawerTab: tab }),

  closeAllModals: () =>
    set({
      isMixerOpen: false,
      isWallpaperPickerOpen: false,
      isThemeCustomizerOpen: false,
      isClockSettingsOpen: false,
      isAnalyticsOpen: false,
    }),
}));
