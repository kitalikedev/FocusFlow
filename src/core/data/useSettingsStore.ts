import { create } from 'zustand';
import { UserSettings } from '@/shared/types/contracts';
import { toAppError } from '@/shared/lib/errors';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { useToastStore } from '@/core/ui/useToastStore';
import { createDefaultSettings } from './defaults';
import { getDataRepository } from './useDataRepository';

export type SettingsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SettingsStoreState {
  settings: UserSettings;
  status: SettingsStatus;
  load: () => Promise<void>;
  update: (partial: Partial<UserSettings>) => Promise<void>;
}

// Drops responses of outdated load() calls (e.g. the user logged out while a request was in flight).
let loadSequence = 0;

function applyThemeFrom(settings: UserSettings): void {
  useThemeStore.getState().setTokens(settings.activeTheme.tokens);
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

  update: async (partial) => {
    try {
      const settings = await getDataRepository().saveSettings(partial);
      set({ settings, status: 'ready' });
      if (partial.activeTheme) applyThemeFrom(settings);
    } catch (error) {
      useToastStore.getState().showToast(toAppError(error).message, { variant: 'error' });
    }
  },
}));
