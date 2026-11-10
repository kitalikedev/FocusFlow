import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { relativeLuminance, parseColor } from '@/core/theme/color';
import { CATEGORY_LABELS, findWallpaper, WALLPAPER_CATALOG } from '../lib/catalog';
import { THEME_PRESETS } from '../lib/presets';
import { enforceReadability } from '../lib/contrast';
import { fontFromStack } from '../lib/fonts';
import { createRandom, PIXEL_CYBERPUNK_WALLPAPERS, pixelNight, toDataUri } from '../lib/pixelCyberpunk';
import { EffectsLayer, ThemeCustomizerModal } from '../index';
import { backgroundFor } from '../components/WallpaperLayer';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { useThemeLibraryStore } from '../store/useThemeLibraryStore';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useUiStore } from '@/core/ui/useUiStore';
import { OBSIDIAN_MINIMAL_CONFIG } from '@/core/theme/presets';

const NEW_PRESETS = ['cyberpunk-neon', 'synthwave', 'pixel-night', 'retro-terminal', 'vaporwave'];

describe('pixel and cyberpunk wallpapers', () => {
  it('adds 4 pixel and 4 cyberpunk wallpapers to the catalog with new category labels', () => {
    expect(PIXEL_CYBERPUNK_WALLPAPERS).toHaveLength(8);
    expect(CATEGORY_LABELS.pixel).toBe('Pixel');
    expect(CATEGORY_LABELS.cyberpunk).toBe('Cyberpunk');
    expect(WALLPAPER_CATALOG.filter((item) => item.category === 'pixel')).toHaveLength(4);
    expect(WALLPAPER_CATALOG.filter((item) => item.category === 'cyberpunk')).toHaveLength(4);
    const ids = WALLPAPER_CATALOG.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each scene is a small crisp SVG data URI with a precomputed luminance', () => {
    PIXEL_CYBERPUNK_WALLPAPERS.forEach((wallpaper) => {
      expect(wallpaper.imageUrl?.startsWith('data:image/svg+xml;utf8,')).toBe(true);
      const markup = decodeURIComponent((wallpaper.imageUrl ?? '').replace('data:image/svg+xml;utf8,', ''));
      expect(markup).toContain('shape-rendering="crispEdges"');
      expect(markup).toContain('viewBox="0 0 96 54"');
      expect(markup.length).toBeLessThan(40_000); // a few KB, not a picture file
      expect(markup).not.toMatch(/<script|http:\/\/(?!www\.w3\.org)|javascript:/i);
      expect(wallpaper.luminance).toBeGreaterThanOrEqual(0);
      expect(wallpaper.luminance).toBeLessThanOrEqual(1);
      expect(wallpaper.pixelated).toBe(wallpaper.category === 'pixel');
    });
    expect(findWallpaper('cyber-vaporwave')!.luminance).toBeGreaterThan(findWallpaper('pixel-night')!.luminance);
  });

  it('scenes are reproducible: the same seed always gives the same picture', () => {
    expect(pixelNight()).toBe(pixelNight());
    const a = createRandom(5);
    const b = createRandom(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(createRandom(1)()).not.toBe(createRandom(2)());
    expect(toDataUri('<svg a="b"/>')).toBe('data:image/svg+xml;utf8,%3Csvg%20a%3D%22b%22%2F%3E');
  });

  it('draws pixel art with hard edges and other art smoothly', () => {
    const pixel = backgroundFor({ type: 'preset', idOrColor: 'pixel-night' }, [], '#000');
    expect(pixel.style.imageRendering).toBe('pixelated');
    expect(String(pixel.style.backgroundImage)).toContain('data:image/svg+xml');
    expect(backgroundFor({ type: 'preset', idOrColor: 'cyber-neon-city' }, [], '#000').style.imageRendering).toBeUndefined();
  });
});

describe('new theme presets', () => {
  it('ships 12 presets: Nebula, the original six and five new ones', () => {
    expect(THEME_PRESETS).toHaveLength(12);
    expect(THEME_PRESETS.slice(7).map((preset) => preset.id)).toEqual(NEW_PRESETS);
    expect(THEME_PRESETS.slice(7).map((preset) => preset.name)).toEqual([
      'Cyberpunk Neon',
      'Synthwave',
      'Pixel Night',
      'Retro Terminal',
      'Vaporwave',
    ]);
  });

  it('every new preset points to an existing wallpaper and font and passes the readability rules', () => {
    THEME_PRESETS.slice(7).forEach(({ config }) => {
      if (config.wallpaperRef.type === 'preset') expect(findWallpaper(config.wallpaperRef.idOrColor)).toBeDefined();
      expect(fontFromStack(config.tokens.fontClock)).toBeDefined();
      expect(relativeLuminance(parseColor(config.tokens.capsuleBg)!)).toBeLessThanOrEqual(0.2);
      const base = config.wallpaperRef.type === 'preset' ? (findWallpaper(config.wallpaperRef.idOrColor)?.luminance ?? 0) : 0;
      const result = enforceReadability(config.tokens, base);
      expect(result.accentAdjusted).toBe(false);
      expect(result.opacityLocked).toBe(false);
    });
  });

  it('the neon themes turn on glow and scanlines, the pixel theme uses fireflies', () => {
    const byId = (id: string) => THEME_PRESETS.find((preset) => preset.id === id)!.config.effects;
    expect(byId('cyberpunk-neon')).toMatchObject({ rain: 30, glow: 60, scanlines: 20 });
    expect(byId('retro-terminal')).toMatchObject({ scanlines: 45, glow: 60, grain: 25 });
    expect(byId('pixel-night').fireflies).toBe(35);
  });
});

describe('Scanlines and Glow', () => {
  beforeEach(() => {
    localStorage.clear();
    URL.createObjectURL = vi.fn(() => 'blob:x');
    useAuthStore.setState({ user: null, isGuest: true, isLoading: false });
    useThemeStore.getState().resetTheme();
    useThemeStore.getState().setEffects({ grain: 0 }); // Nebula starts with a little grain
    useThemeLibraryStore.setState({ customWallpapers: [], savedThemes: [], isUploading: false });
    useUiStore.setState({ isThemeCustomizerOpen: false, isWallpaperPickerOpen: false });
  });

  it('draws static scanlines whose strength follows the slider and nothing when off', () => {
    const { container, rerender } = render(<EffectsLayer />);
    expect(container).toBeEmptyDOMElement();
    act(() => useThemeStore.getState().setEffects({ scanlines: 50 }));
    rerender(<EffectsLayer />);
    const overlay = screen.getByTestId('scanlines-overlay');
    expect(overlay.style.opacity).toBe('0.2');
    expect(overlay.style.backgroundImage).toContain('repeating-linear-gradient');
    expect(screen.queryByTestId('particle-canvas')).not.toBeInTheDocument();
  });

  it('keeps scanlines under reduced motion because they are a static filter', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    act(() => useThemeStore.getState().setEffects({ scanlines: 30, rain: 40 }));
    render(<EffectsLayer />);
    expect(screen.getByTestId('scanlines-overlay')).toBeInTheDocument();
    expect(screen.queryByTestId('particle-canvas')).not.toBeInTheDocument();
    delete (window as unknown as { matchMedia?: unknown }).matchMedia;
  });

  it('the Customize tab has Scanlines and Clock glow sliders that update the live preview', async () => {
    act(() => useUiStore.setState({ isThemeCustomizerOpen: true }));
    render(<ThemeCustomizerModal />);
    fireEvent.click(await screen.findByRole('tab', { name: 'Customize' }));
    fireEvent.change(screen.getByLabelText('Scanlines'), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText('Clock glow'), { target: { value: '70' } });
    expect(useThemeStore.getState().config.effects).toMatchObject({ scanlines: 40, glow: 70 });
    expect(document.documentElement.style.getPropertyValue('--clock-glow')).toContain('0 0 9.8px');
  });

  it('applies a new preset in one step (theme, wallpaper, glow variable)', async () => {
    act(() => useUiStore.setState({ isThemeCustomizerOpen: true }));
    render(<ThemeCustomizerModal />);
    fireEvent.click(await screen.findByTestId('preset-cyberpunk-neon'));
    const { config } = useThemeStore.getState();
    expect(config.presetId).toBe('cyberpunk-neon');
    expect(config.wallpaperRef).toEqual({ type: 'preset', idOrColor: 'cyber-neon-city' });
    expect(document.documentElement.style.getPropertyValue('--clock-glow')).not.toBe('none');
    expect(OBSIDIAN_MINIMAL_CONFIG.effects.scanlines).toBe(0);
  });
});
