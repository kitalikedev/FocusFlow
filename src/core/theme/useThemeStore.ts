import { create } from 'zustand';
import { ThemeConfig, ThemeTokens } from '@/shared/types/contracts';
import { OBSIDIAN_MINIMAL_CONFIG, OBSIDIAN_MINIMAL_TOKENS } from './presets';
import { applyTheme } from './applyTheme';

export interface ThemeStoreState {
  tokens: ThemeTokens;
  config: ThemeConfig;
  setTokens: (partial: Partial<ThemeTokens>) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  tokens: OBSIDIAN_MINIMAL_TOKENS,
  config: OBSIDIAN_MINIMAL_CONFIG,

  setTokens: (partial: Partial<ThemeTokens>) => {
    const updatedTokens = { ...get().tokens, ...partial };
    applyTheme(updatedTokens);
    set((state) => ({
      tokens: updatedTokens,
      config: {
        ...state.config,
        tokens: updatedTokens,
      },
    }));
  },

  resetTheme: () => {
    applyTheme(OBSIDIAN_MINIMAL_TOKENS);
    set({
      tokens: OBSIDIAN_MINIMAL_TOKENS,
      config: OBSIDIAN_MINIMAL_CONFIG,
    });
  },
}));
