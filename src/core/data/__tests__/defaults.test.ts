import { describe, it, expect } from 'vitest';
import {
  clampInt,
  clampVolume,
  createDefaultSettings,
  mergeSettings,
  normalizeSettings,
  parseThemeConfig,
} from '../defaults';
import { OBSIDIAN_MINIMAL_CONFIG } from '@/core/theme/presets';

describe('clamp helpers', () => {
  it('clampInt rounds, clamps and falls back', () => {
    expect(clampInt(1500.4, 60, 10800, 1)).toBe(1500);
    expect(clampInt(5, 60, 10800, 1)).toBe(60);
    expect(clampInt(99999, 60, 10800, 1)).toBe(10800);
    expect(clampInt('120', 60, 10800, 1)).toBe(120);
    expect(clampInt('abc', 60, 10800, 77)).toBe(77);
    expect(clampInt(Number.NaN, 60, 10800, 77)).toBe(77);
  });

  it('clampVolume keeps two decimals within 0..1', () => {
    expect(clampVolume(0.456, 0)).toBe(0.46);
    expect(clampVolume(2, 0)).toBe(1);
    expect(clampVolume(-1, 0.5)).toBe(0);
    expect(clampVolume(undefined, 0.8)).toBe(0.8);
  });
});

describe('parseThemeConfig', () => {
  it('falls back to Obsidian Minimal for non-objects', () => {
    expect(parseThemeConfig(null)).toBe(OBSIDIAN_MINIMAL_CONFIG);
    expect(parseThemeConfig('nope')).toBe(OBSIDIAN_MINIMAL_CONFIG);
    expect(parseThemeConfig([])).toBe(OBSIDIAN_MINIMAL_CONFIG);
    expect(parseThemeConfig({})).toBe(OBSIDIAN_MINIMAL_CONFIG);
  });

  it('merges valid tokens and ignores unknown or wrongly typed ones', () => {
    const config = parseThemeConfig({
      presetId: 'custom',
      tokens: { colorAccent: '#ff0000', capsuleBlur: 'wide', capsuleRadius: Infinity, evil: 'x' },
      effects: { rain: 150, snow: 'a', fireflies: 40 },
      wallpaperRef: { type: 'preset', idOrColor: 'preset-a' },
    });
    expect(config.presetId).toBe('custom');
    expect(config.tokens.colorAccent).toBe('#ff0000');
    expect(config.tokens.capsuleBlur).toBe(OBSIDIAN_MINIMAL_CONFIG.tokens.capsuleBlur);
    expect(config.tokens.capsuleRadius).toBe(OBSIDIAN_MINIMAL_CONFIG.tokens.capsuleRadius);
    expect('evil' in config.tokens).toBe(false);
    expect(config.effects.rain).toBe(100);
    expect(config.effects.snow).toBe(0);
    expect(config.effects.fireflies).toBe(40);
    expect(config.wallpaperRef).toEqual({ type: 'preset', idOrColor: 'preset-a' });
  });

  it('uses defaults when tokens, effects and wallpaperRef are missing or invalid', () => {
    const config = parseThemeConfig({ tokens: 5, effects: 5, wallpaperRef: { type: 'video', idOrColor: '' } });
    expect(config.tokens).toEqual(OBSIDIAN_MINIMAL_CONFIG.tokens);
    expect(config.wallpaperRef).toEqual(OBSIDIAN_MINIMAL_CONFIG.wallpaperRef);
    expect(config.presetId).toBeUndefined();
  });
});

describe('normalizeSettings', () => {
  it('returns defaults for invalid input', () => {
    const settings = normalizeSettings(undefined);
    expect(settings.timerDurations).toEqual({ focus: 1500, shortBreak: 300, longBreak: 900 });
    expect(settings.activeWallpaperId).toBe('preset-lofi-cafe');
    expect(settings.activeTheme).toBe(OBSIDIAN_MINIMAL_CONFIG);
  });

  it('clamps out-of-range values and rejects invalid enums', () => {
    const settings = normalizeSettings({
      userId: 'u1',
      timerDurations: { focus: 1, shortBreak: 99999, longBreak: 600 },
      clockVisualMode: 'weird',
      clockPosition: 'zen',
      activeWallpaperId: '',
      ambientVolumes: { rain: 5, brownNoise: -2, campfire: 0.255, master: 'x' },
      autoStartBreaks: 'yes',
      autoStartFocus: true,
      longBreakInterval: 100,
      isMigrated: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(settings.userId).toBe('u1');
    expect(settings.timerDurations).toEqual({ focus: 60, shortBreak: 10800, longBreak: 600 });
    expect(settings.clockVisualMode).toBe('minimal');
    expect(settings.clockPosition).toBe('zen');
    expect(settings.activeWallpaperId).toBe('preset-lofi-cafe');
    expect(settings.ambientVolumes).toEqual({ rain: 1, brownNoise: 0, campfire: 0.26, master: 0.8 });
    expect(settings.autoStartBreaks).toBe(false);
    expect(settings.autoStartFocus).toBe(true);
    expect(settings.longBreakInterval).toBe(24);
    expect(settings.isMigrated).toBe(true);
    expect(settings.updatedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('mergeSettings', () => {
  it('deep merges nested durations and volumes', () => {
    const base = createDefaultSettings();
    const merged = mergeSettings(base, {
      timerDurations: { focus: 3000 } as never,
      ambientVolumes: { master: 0.1 } as never,
      autoStartFocus: true,
    });
    expect(merged.timerDurations).toEqual({ focus: 3000, shortBreak: 300, longBreak: 900 });
    expect(merged.ambientVolumes.master).toBe(0.1);
    expect(merged.ambientVolumes.rain).toBe(0.5);
    expect(merged.autoStartFocus).toBe(true);
  });
});
