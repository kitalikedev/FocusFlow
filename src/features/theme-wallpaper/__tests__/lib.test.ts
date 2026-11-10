import { describe, it, expect } from 'vitest';
import { parseColor, relativeLuminance, contrastRatio } from '@/core/theme/color';
import { OBSIDIAN_MINIMAL_TOKENS } from '@/core/theme/presets';
import {
  accentContrastColor,
  adjustAccent,
  CAPSULE_MAX_LUMINANCE,
  clampCapsuleColor,
  effectiveLuminance,
  enforceReadability,
} from '../lib/contrast';
import { averageLuminance, findWallpaper, solidLuminance, WALLPAPER_CATALOG } from '../lib/catalog';
import { FONT_OPTIONS, fontFromStack } from '../lib/fonts';
import { THEME_PRESETS } from '../lib/presets';
import { createFpsGuard } from '../hooks/useFpsGuard';
import { particleCount, spawn, step } from '../lib/particles';
import { averagePixelLuminance, isAcceptedWallpaper } from '../lib/sampleImage';

const luminanceOf = (color: string) => relativeLuminance(parseColor(color)!);

describe('readability rules (FR-15, FR-25)', () => {
  it('computes L_effective from brightness and dim', () => {
    expect(effectiveLuminance(0.8, 100, 0)).toBe(0.8);
    expect(effectiveLuminance(0.8, 50, 50)).toBeCloseTo(0.2);
    expect(effectiveLuminance(0.9, 120, 0)).toBe(1);
  });

  it('keeps the capsule color at luminance ≤ 0.20', () => {
    expect(clampCapsuleColor('#18181b')).toEqual({ color: '#18181b', clamped: false });
    const clamped = clampCapsuleColor('#f5f5f5');
    expect(clamped.clamped).toBe(true);
    expect(luminanceOf(clamped.color)).toBeLessThanOrEqual(CAPSULE_MAX_LUMINANCE);
    expect(clampCapsuleColor('not a color')).toEqual({ color: '#000000', clamped: true });
  });

  it('AC-25.2: lifts a dark accent to at least 4.5:1 against the capsule', () => {
    expect(adjustAccent('#ffffff', '#000000')).toEqual({ color: '#ffffff', adjusted: false });
    const fixed = adjustAccent('#1e3a8a', '#0f172a');
    expect(fixed.adjusted).toBe(true);
    expect(contrastRatio(luminanceOf(fixed.color), luminanceOf('#0f172a'))).toBeGreaterThanOrEqual(4.5);
  });

  it('picks black text on light accents and white on dark ones', () => {
    expect(accentContrastColor('#ffffff')).toBe('#000000');
    expect(accentContrastColor('#1e1b4b')).toBe('#ffffff');
  });

  it('AC-25.3: locks the opacity at 50 % only on a bright background', () => {
    const tokens = { ...OBSIDIAN_MINIMAL_TOKENS, capsuleOpacity: 0.3, bgDim: 0 };
    const bright = enforceReadability(tokens, 0.9);
    expect(bright.opacityLocked).toBe(true);
    expect(bright.tokens.capsuleOpacity).toBe(0.5);
    const dark = enforceReadability(tokens, 0.1);
    expect(dark.opacityLocked).toBe(false);
    expect(dark.tokens.capsuleOpacity).toBe(0.3);
    // Dimming a bright picture enough removes the lock.
    expect(enforceReadability({ ...tokens, bgDim: 50 }, 0.9).opacityLocked).toBe(false);
  });
});

describe('catalog, presets and fonts', () => {
  it('has unique ids and precomputed luminance for every wallpaper', () => {
    const ids = WALLPAPER_CATALOG.map((wallpaper) => wallpaper.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(WALLPAPER_CATALOG.length).toBeGreaterThanOrEqual(20);
    WALLPAPER_CATALOG.forEach((wallpaper) => {
      expect(wallpaper.luminance).toBeGreaterThanOrEqual(0);
      expect(wallpaper.luminance).toBeLessThanOrEqual(1);
    });
    expect(findWallpaper('gradient-cotton')!.luminance).toBeGreaterThan(0.6);
    expect(findWallpaper('gradient-midnight')!.luminance).toBeLessThan(0.1);
    expect(averageLuminance(['nope'])).toBe(0);
    expect(solidLuminance('#ffffff')).toBeCloseTo(1);
    expect(solidLuminance('bad')).toBe(0);
  });

  it('starts with the default Nebula theme, then the six PRD presets, each pointing to an existing wallpaper and font', () => {
    expect(THEME_PRESETS[0].name).toBe('Nebula');
    expect(THEME_PRESETS.slice(1, 7).map((preset) => preset.name)).toEqual([
      'Obsidian Minimal',
      'Tokyo Fog',
      'Midnight Indigo',
      'Matcha Slate',
      'Amber Wood',
      'Nordic Night',
    ]);
    THEME_PRESETS.forEach(({ config }) => {
      if (config.wallpaperRef.type === 'preset') expect(findWallpaper(config.wallpaperRef.idOrColor)).toBeDefined();
      expect(fontFromStack(config.tokens.fontClock)).toBeDefined();
      expect(luminanceOf(clampCapsuleColor(config.tokens.capsuleBg).color)).toBeLessThanOrEqual(0.2);
    });
  });

  it('maps a font stack back to its self-hosted file', () => {
    expect(FONT_OPTIONS).toHaveLength(6);
    expect(fontFromStack("'Space Mono', monospace")?.file).toBe('/fonts/space-mono.woff2');
    expect(fontFromStack('"Inter", sans-serif')?.id).toBe('inter');
    expect(fontFromStack('Comic Sans')).toBeUndefined();
  });
});

describe('effects', () => {
  it('AC-26.1: fireflies at 50 % draw 20 particles', () => {
    expect(particleCount('fireflies', 50)).toBe(20);
    expect(particleCount('rain', 100, 0.5)).toBe(80);
    expect(particleCount('snow', 150)).toBe(120);
    expect(particleCount('snow', -5)).toBe(0);
  });

  it('particles wrap around the screen', () => {
    const drop = spawn('rain', 100, 100, () => 0.5);
    drop.y = 130;
    step(drop, 100, 100, 1, 0);
    expect(drop.y).toBe(-20);
    const fly = spawn('fireflies', 100, 100, () => 0.5);
    fly.x = -30;
    step(fly, 100, 100, 1, 0);
    expect(fly.x).toBe(120);
  });

  it('AC-26.3: halves the particle budget after 3 s under the FPS threshold, never for one slow second', () => {
    const guard = createFpsGuard(55);
    let time = 0;
    const run = (seconds: number, fps: number) => {
      for (let i = 0; i < seconds * fps; i += 1) {
        time += 1000 / fps;
        guard.frame(time);
      }
    };
    guard.frame(time);
    run(1, 30);
    run(2, 60);
    expect(guard.multiplier).toBe(1);
    run(4.2, 30);
    expect(guard.multiplier).toBe(0.5);
    guard.reset();
    time += 60_000; // hidden tab: the pause is not a slow frame
    guard.frame(time);
    run(1, 60);
    expect(guard.multiplier).toBe(0.5);
  });
});

describe('uploads (FR-14)', () => {
  it('AC-14.1: accepts JPG, PNG, GIF, WebP up to 5 MB only', () => {
    const file = (type: string, size: number) => {
      const f = new File(['x'], 'a', { type });
      Object.defineProperty(f, 'size', { value: size });
      return f;
    };
    expect(isAcceptedWallpaper(file('image/gif', 5 * 1024 * 1024))).toBe(true);
    expect(isAcceptedWallpaper(file('image/gif', 5 * 1024 * 1024 + 1))).toBe(false);
    expect(isAcceptedWallpaper(file('image/svg+xml', 10))).toBe(false);
  });

  it('averages the luminance of the sampled pixels', () => {
    const white = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]);
    expect(averagePixelLuminance(white)).toBe(0.5);
    expect(averagePixelLuminance(new Uint8ClampedArray())).toBe(0.5);
  });
});
