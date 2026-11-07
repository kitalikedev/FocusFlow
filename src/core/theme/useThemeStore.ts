import { create } from 'zustand';
import { EffectsConfig, ThemeConfig, ThemeTokens } from '@/shared/types/contracts';
import { OBSIDIAN_MINIMAL_CONFIG, OBSIDIAN_MINIMAL_TOKENS } from './presets';
import { applyTheme } from './applyTheme';

export interface ThemeStoreState {
  tokens: ThemeTokens;
  config: ThemeConfig;
  setTokens: (partial: Partial<ThemeTokens>) => void;
  /** Replaces the whole theme (tokens, effects, wallpaper) in one step (FR-24, AC-27.1). */
  setConfig: (config: ThemeConfig) => void;
  setEffects: (partial: Partial<EffectsConfig>) => void;
  setWallpaper: (wallpaperRef: ThemeConfig['wallpaperRef']) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  tokens: OBSIDIAN_MINIMAL_TOKENS,
  config: OBSIDIAN_MINIMAL_CONFIG,

  setTokens: (partial: Partial<ThemeTokens>) => {
    const updatedTokens = { ...get().tokens, ...partial };
    applyTheme(updatedTokens, get().config.effects);
    set((state) => ({
      tokens: updatedTokens,
      config: {
        ...state.config,
        tokens: updatedTokens,
      },
    }));
  },

  setConfig: (config: ThemeConfig) => {
    applyTheme(config.tokens, config.effects);
    set({ tokens: config.tokens, config });
  },

  setEffects: (partial: Partial<EffectsConfig>) => {
    const effects = { ...get().config.effects, ...partial };
    applyTheme(get().tokens, effects);
    set((state) => ({ config: { ...state.config, effects } }));
  },

  setWallpaper: (wallpaperRef: ThemeConfig['wallpaperRef']) =>
    set((state) => ({ config: { ...state.config, wallpaperRef } })),

  resetTheme: () => {
    applyTheme(OBSIDIAN_MINIMAL_TOKENS, OBSIDIAN_MINIMAL_CONFIG.effects);
    set({
      tokens: OBSIDIAN_MINIMAL_TOKENS,
      config: OBSIDIAN_MINIMAL_CONFIG,
    });
  },
}));
