import { create } from 'zustand';
import { UserSettings } from '@/shared/types/contracts';
import { toAppError } from '@/shared/lib/errors';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { useToastStore } from '@/core/ui/useToastStore';
import { createDefaultSettings } from './defaults';
import { getDataRepository } from './useDataRepository';
import { trackWrite } from './useSyncStatusStore';

export type SettingsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SettingsStoreState {
  settings: UserSettings;
  status: SettingsStatus;
  load: () => Promise<void>;
  update: (partial: Partial<UserSettings>) => Promise<void>;
}

// Drops responses of outdated load() calls (e.g. the user logged out while a request was in flight).
let loadSequence = 0;

// Saves run one after another: the repository reads then writes the whole settings object,
// so two overlapping saves would let the later write drop the earlier patch.
let saveQueue: Promise<void> = Promise.resolve();

/** Loads the whole saved theme (tokens, effects and wallpaper), not only its tokens. */
function applyThemeFrom(settings: UserSettings): void {
  useThemeStore.getState().setConfig(settings.activeTheme);
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  settings: createDefaultSettings(),
  status: 'idle',

  load: async () => {
    const sequence = ++loadSequence;
    set({ status: 'loading' });
    try {
      const settings = await getDataRepository().getSettings();
      if (sequence !== loadSequence) return;
      set({ settings, status: 'ready' });
      applyThemeFrom(settings);
    } catch (error) {
      if (sequence !== loadSequence) return;
      set({ status: 'error' });
      useToastStore.getState().showToast(toAppError(error).message, { variant: 'error' });
    }
  },

  update: (partial) => {
    const run = async (): Promise<void> => {
      try {
        const settings = await trackWrite(() => getDataRepository().saveSettings(partial));
        set({ settings, status: 'ready' });
        if (partial.activeTheme) applyThemeFrom(settings);
      } catch (error) {
        useToastStore.getState().showToast(toAppError(error).message, { variant: 'error' });
      }
    };
    // run() never rejects, so a failed save does not block the next one.
    saveQueue = saveQueue.then(run);
    return saveQueue;
  },
}));
