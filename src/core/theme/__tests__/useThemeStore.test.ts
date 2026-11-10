import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../useThemeStore';
import { DEFAULT_THEME_TOKENS, NEBULA_CONFIG, OBSIDIAN_MINIMAL_TOKENS } from '../presets';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.getState().resetTheme();
  });

  it('initializes with the Nebula theme', () => {
    const { tokens, config } = useThemeStore.getState();
    expect(tokens.colorAccent).toBe('#c4b5fd');
    expect(tokens.bgSolidColor).toBe('#05030f');
    expect(config.presetId).toBe('nebula');
    expect(config.wallpaperRef).toEqual({ type: 'preset', idOrColor: 'abstract-nebula' });
  });

  it('updates tokens and syncs with CSS variables when setTokens is called', () => {
    useThemeStore.getState().setTokens({
      colorAccent: '#3b82f6',
      capsuleRadius: 16,
    });

    const updatedTokens = useThemeStore.getState().tokens;
    expect(updatedTokens.colorAccent).toBe('#3b82f6');
    expect(updatedTokens.capsuleRadius).toBe(16);
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#3b82f6');
    expect(document.documentElement.style.getPropertyValue('--capsule-radius')).toBe('16px');
  });

  it('resets back to the default Nebula theme when resetTheme is called', () => {
    useThemeStore.getState().setTokens({
      colorAccent: '#ef4444',
      bgSolidColor: '#18181b',
    });

    expect(useThemeStore.getState().tokens.colorAccent).toBe('#ef4444');

    useThemeStore.getState().resetTheme();

    const currentTokens = useThemeStore.getState().tokens;
    expect(currentTokens).toEqual(DEFAULT_THEME_TOKENS);
    expect(useThemeStore.getState().config).toEqual(NEBULA_CONFIG);
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#c4b5fd');
    expect(document.documentElement.style.getPropertyValue('--bg-solid-color')).toBe('#05030f');
    const obsoleteToken = ['--', 'color', '-', 'bg'].join('');
    expect(document.documentElement.style.getPropertyValue(obsoleteToken)).toBe('');
  });
});

describe('useThemeStore whole-theme actions', () => {
  beforeEach(() => {
    useThemeStore.getState().resetTheme();
  });

  it('setConfig swaps tokens, effects and wallpaper at once and applies the CSS variables', () => {
    const config = {
      presetId: 'tokyo-fog',
      tokens: { ...OBSIDIAN_MINIMAL_TOKENS, colorAccent: '#f5f5f4', capsuleBg: '#18181b', capsuleOpacity: 0.6 },
      effects: { rain: 40, snow: 0, fireflies: 0, grain: 10, vignette: 0, scanlines: 0, glow: 0 },
      wallpaperRef: { type: 'preset' as const, idOrColor: 'gradient-thermal' },
    };
    useThemeStore.getState().setConfig(config);

    const state = useThemeStore.getState();
    expect(state.config).toEqual(config);
    expect(state.tokens).toEqual(config.tokens);
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#f5f5f4');
    expect(document.documentElement.style.getPropertyValue('--capsule-bg')).toBe('rgba(24, 24, 27, 0.6)');
  });

  it('setEffects and setWallpaper only touch their own part of the config', () => {
    useThemeStore.getState().setEffects({ snow: 30 });
    useThemeStore.getState().setWallpaper({ type: 'solid', idOrColor: '#121214' });

    const { config, tokens } = useThemeStore.getState();
    expect(config.effects).toEqual({ rain: 0, snow: 30, fireflies: 0, grain: 12, vignette: 0, scanlines: 0, glow: 25 });
    expect(config.wallpaperRef).toEqual({ type: 'solid', idOrColor: '#121214' });
    expect(tokens).toEqual(DEFAULT_THEME_TOKENS);
  });
});

describe('Obsidian Minimal stays available', () => {
  it('is still a valid token set that differs from the default', () => {
    expect(OBSIDIAN_MINIMAL_TOKENS.colorAccent).toBe('#ffffff');
    expect(OBSIDIAN_MINIMAL_TOKENS.bgSolidColor).toBe('#09090b');
    expect(OBSIDIAN_MINIMAL_TOKENS).not.toEqual(DEFAULT_THEME_TOKENS);
  });
});

describe('clock glow', () => {
  it('follows the Glow effect and the accent color', () => {
    useThemeStore.getState().resetTheme();
    // Nebula has a soft glow by default; Obsidian Minimal has none.
    expect(document.documentElement.style.getPropertyValue('--clock-glow')).toBe('0 0 3.5px #c4b5fd, 0 0 9.0px #c4b5fd');
    useThemeStore.getState().setEffects({ glow: 0 });
    expect(document.documentElement.style.getPropertyValue('--clock-glow')).toBe('none');
    useThemeStore.getState().setEffects({ glow: 50 });
    expect(document.documentElement.style.getPropertyValue('--clock-glow')).toBe('0 0 7.0px #c4b5fd, 0 0 18.0px #c4b5fd');
    useThemeStore.getState().setTokens({ colorAccent: '#ff2d95' });
    expect(document.documentElement.style.getPropertyValue('--clock-glow')).toContain('#ff2d95');
  });
});
