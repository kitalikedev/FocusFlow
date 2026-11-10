import { ThemeConfig, ThemeTokens } from '@/shared/types/contracts';

export const OBSIDIAN_MINIMAL_TOKENS: ThemeTokens = {
  colorAccent: '#ffffff',
  colorAccentContrast: '#000000',
  capsuleBg: 'rgba(0, 0, 0, 0.35)',
  capsuleOpacity: 0.35,
  capsuleBlur: 24,
  capsuleRadius: 24,
  capsuleBorderWidth: 1,
  capsuleBorderColor: 'rgba(255, 255, 255, 0.1)',
  fontClock: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  clockScale: 1.0,
  clockWeight: 600,
  bgDim: 20,
  bgBlur: 0,
  bgBrightness: 100,
  bgSolidColor: '#09090b',
};

export const OBSIDIAN_MINIMAL_CONFIG: ThemeConfig = {
  presetId: 'obsidian-minimal',
  tokens: OBSIDIAN_MINIMAL_TOKENS,
  effects: {
    rain: 0,
    snow: 0,
    fireflies: 0,
    grain: 0,
    vignette: 0,
    scanlines: 0,
    glow: 0,
  },
  wallpaperRef: {
    type: 'solid',
    idOrColor: '#09090b',
  },
};

/** Nebula: deep violet space, the theme every new visitor and new account starts with. */
export const NEBULA_TOKENS: ThemeTokens = {
  colorAccent: '#c4b5fd',
  colorAccentContrast: '#000000',
  capsuleBg: '#0b0618',
  capsuleOpacity: 0.55,
  capsuleBlur: 24,
  capsuleRadius: 24,
  capsuleBorderWidth: 1,
  capsuleBorderColor: 'rgba(196, 181, 253, 0.25)',
  fontClock: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  clockScale: 1.0,
  clockWeight: 600,
  bgDim: 10,
  bgBlur: 0,
  bgBrightness: 100,
  bgSolidColor: '#05030f',
};

export const NEBULA_CONFIG: ThemeConfig = {
  presetId: 'nebula',
  tokens: NEBULA_TOKENS,
  // Only cheap static effects by default (no animated particles on a fresh install).
  effects: {
    rain: 0,
    snow: 0,
    fireflies: 0,
    grain: 12,
    vignette: 0,
    scanlines: 0,
    glow: 25,
  },
  wallpaperRef: {
    type: 'preset',
    idOrColor: 'abstract-nebula',
  },
};

/** The theme used for a new visitor, a new account and "Reset to Default". */
export const DEFAULT_THEME_TOKENS = NEBULA_TOKENS;
export const DEFAULT_THEME_CONFIG = NEBULA_CONFIG;
