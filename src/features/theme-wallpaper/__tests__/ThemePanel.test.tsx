import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EffectsLayer, ThemeCustomizerModal, WallpaperLayer } from '../index';
import { useThemeLibraryStore } from '../store/useThemeLibraryStore';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useUiStore } from '@/core/ui/useUiStore';
import { useToastStore } from '@/core/ui/useToastStore';
import { getLocalRepository } from '@/core/data/useDataRepository';
import { OBSIDIAN_MINIMAL_CONFIG } from '@/core/theme/presets';

beforeEach(() => {
  localStorage.clear();
  URL.createObjectURL = vi.fn(() => 'blob:wallpaper');
  URL.revokeObjectURL = vi.fn();
  useAuthStore.setState({ user: null, isGuest: true, isLoading: false });
  useThemeStore.getState().resetTheme();
  useThemeLibraryStore.setState({ customWallpapers: [], savedThemes: [], isUploading: false });
  useUiStore.setState({ isThemeCustomizerOpen: true, isWallpaperPickerOpen: false, isZen: false });
  useToastStore.setState({ toasts: [] } as never);
});
afterEach(() => {
  vi.restoreAllMocks();
});

async function openPanel() {
  render(<ThemeCustomizerModal />);
  return screen.findByTestId('theme-panel');
}

const savedSettings = () => getLocalRepository().getSettings();

describe('Themes panel — Library', () => {
  it('AC-27.1: a preset swaps the whole theme at once and is saved', async () => {
    await openPanel();
    fireEvent.click(screen.getByTestId('preset-tokyo-fog'));

    const { config, tokens } = useThemeStore.getState();
    expect(config.presetId).toBe('tokyo-fog');
    expect(config.wallpaperRef).toEqual({ type: 'preset', idOrColor: 'gradient-fog' });
    expect(tokens.fontClock).toContain('Space Mono');
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#f5f5f4');
    await waitFor(async () => expect((await savedSettings()).activeTheme.presetId).toBe('tokyo-fog'));
    expect((await savedSettings()).activeWallpaperId).toBe('gradient-fog');
    expect(screen.getByTestId('preset-tokyo-fog')).toHaveAttribute('aria-pressed', 'true');
  });

  it('AC-13.1: a wallpaper changes only the background and gets the white ring', async () => {
    await openPanel();
    fireEvent.click(screen.getByTestId('wallpaper-gradient-thermal'));
    expect(useThemeStore.getState().config.wallpaperRef).toEqual({ type: 'preset', idOrColor: 'gradient-thermal' });
    expect(useThemeStore.getState().tokens.colorAccent).toBe('#ffffff');
    expect(screen.getByTestId('wallpaper-gradient-thermal').className).toContain('ring-2 ring-white');
    await waitFor(async () => expect((await savedSettings()).activeWallpaperId).toBe('gradient-thermal'));
  });

  it('filters the library by category', async () => {
    await openPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Animated' }));
    expect(screen.getByTestId('wallpaper-animated-aurora')).toBeInTheDocument();
    expect(screen.queryByTestId('preset-tokyo-fog')).not.toBeInTheDocument();
  });

  it('AC-14.1: refuses files over 5 MB or in another format', async () => {
    await openPanel();
    const big = new File(['x'], 'huge.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 });
    fireEvent.change(screen.getByTestId('wallpaper-file-input'), { target: { files: [big] } });
    await waitFor(() =>
      expect(JSON.stringify(useToastStore.getState())).toContain('File size exceeds 5MB or format unsupported'),
    );
    expect(useThemeLibraryStore.getState().customWallpapers).toHaveLength(0);
  });

  it('AC-14.2: a guest upload is stored locally and becomes the wallpaper', async () => {
    const store = new Map<string, unknown>();
    const repo = getLocalRepository();
    vi.spyOn(repo, 'uploadCustomWallpaper').mockImplementation(async (file, luminance) => {
      const meta = { id: 'w1', name: file.name, type: 'custom' as const, url: 'blob:w1', luminance };
      store.set('w1', meta);
      return meta;
    });
    await openPanel();
    const gif = new File(['gif'], 'cozy.gif', { type: 'image/gif' });
    fireEvent.change(screen.getByTestId('wallpaper-file-input'), { target: { files: [gif] } });
    await waitFor(() => expect(useThemeStore.getState().config.wallpaperRef).toEqual({ type: 'custom', idOrColor: 'w1' }));
    expect(screen.getByTestId('custom-w1')).toBeInTheDocument();
    expect(store.size).toBe(1);
  });
});

describe('Themes panel — Customize (FR-25)', () => {
  it('AC-25.1: live preview, Revert restores and nothing is saved', async () => {
    await openPanel();
    fireEvent.click(screen.getByRole('tab', { name: 'Customize' }));
    fireEvent.change(screen.getByLabelText('Corner radius'), { target: { value: '40' } });
    expect(document.documentElement.style.getPropertyValue('--capsule-radius')).toBe('40px');

    fireEvent.click(screen.getByTestId('revert-btn'));
    expect(document.documentElement.style.getPropertyValue('--capsule-radius')).toBe('24px');
    expect(useThemeStore.getState().tokens.capsuleRadius).toBe(24);
  });

  it('closing without Apply also reverts; Apply saves', async () => {
    await openPanel();
    fireEvent.click(screen.getByRole('tab', { name: 'Customize' }));
    fireEvent.change(screen.getByLabelText('Corner radius'), { target: { value: '40' } });
    fireEvent.click(screen.getByLabelText('Close Themes'));
    expect(useThemeStore.getState().tokens.capsuleRadius).toBe(24);

    act(() => useUiStore.setState({ isThemeCustomizerOpen: true }));
    fireEvent.click(await screen.findByRole('tab', { name: 'Customize' }));
    fireEvent.change(screen.getByLabelText('Corner radius'), { target: { value: '12' } });
    fireEvent.click(screen.getByTestId('apply-btn'));
    await waitFor(async () => expect((await savedSettings()).activeTheme.tokens.capsuleRadius).toBe(12));
    fireEvent.click(screen.getByLabelText('Close Themes'));
    expect(useThemeStore.getState().tokens.capsuleRadius).toBe(12);
  });

  it('AC-25.2: a low-contrast accent is corrected with a note', async () => {
    await openPanel();
    fireEvent.click(screen.getByRole('tab', { name: 'Customize' }));
    fireEvent.change(screen.getByLabelText('Accent color'), { target: { value: '#111111' } });
    expect(screen.getByText('Contrast adjusted to 4.5:1 for readability')).toBeInTheDocument();
    expect(useThemeStore.getState().tokens.colorAccent).not.toBe('#111111');
  });

  it('AC-25.3: on a bright wallpaper the opacity slider is locked at 50 %', async () => {
    useThemeStore.getState().setConfig({
      ...OBSIDIAN_MINIMAL_CONFIG,
      tokens: { ...OBSIDIAN_MINIMAL_CONFIG.tokens, bgDim: 0 },
      wallpaperRef: { type: 'preset', idOrColor: 'gradient-cotton' },
    });
    await openPanel();
    fireEvent.click(screen.getByRole('tab', { name: 'Customize' }));
    expect(screen.getByLabelText('Opacity')).toHaveAttribute('min', '50');
    expect(screen.getByText('Locked at min 50% on bright background')).toBeInTheDocument();
  });

  it('AC-25.5: a solid color hides the image sliders', async () => {
    await openPanel();
    fireEvent.click(screen.getByRole('tab', { name: 'Customize' }));
    fireEvent.change(screen.getByLabelText('Solid color'), { target: { value: '#121214' } });
    expect(useThemeStore.getState().config.wallpaperRef).toEqual({ type: 'solid', idOrColor: '#121214' });
    expect(screen.queryByLabelText('Dim')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Brightness')).not.toBeInTheDocument();
  });

  it('changes the clock font and effects in the preview', async () => {
    await openPanel();
    fireEvent.click(screen.getByRole('tab', { name: 'Customize' }));
    fireEvent.change(screen.getByLabelText('Font'), { target: { value: 'silkscreen' } });
    expect(useThemeStore.getState().tokens.fontClock).toContain('Silkscreen');
    fireEvent.change(screen.getByLabelText('Snow'), { target: { value: '30' } });
    expect(useThemeStore.getState().config.effects.snow).toBe(30);
  });
});

describe('Themes panel — My Themes (FR-27)', () => {
  it('saves, renames, applies and deletes themes; AC-27.2 blocks the 4th guest theme', async () => {
    await openPanel();
    fireEvent.click(screen.getByRole('tab', { name: 'Customize' }));
    for (const name of ['One', 'Two', 'Three', 'Four']) {
      fireEvent.change(screen.getByLabelText('Theme name'), { target: { value: name } });
      fireEvent.click(screen.getByTestId('save-theme-btn'));
      if (name !== 'Four') await waitFor(() => expect(screen.getByLabelText('Theme name')).toHaveValue(''));
    }
    await waitFor(() =>
      expect(JSON.stringify(useToastStore.getState())).toContain('Limit reached (3 themes). Please delete an existing theme to save.'),
    );
    expect(useThemeLibraryStore.getState().savedThemes).toHaveLength(3);

    fireEvent.click(screen.getByRole('tab', { name: 'My Themes' }));
    expect(screen.getAllByTestId('saved-theme')).toHaveLength(3);
    fireEvent.click(screen.getByLabelText('Rename One'));
    fireEvent.change(screen.getByLabelText('New name for One'), { target: { value: 'Morning' } });
    fireEvent.click(screen.getByText('OK'));
    await waitFor(() => expect(screen.getByText('Morning')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Delete Two'));
    await waitFor(() => expect(screen.getAllByTestId('saved-theme')).toHaveLength(2));
    expect(await getLocalRepository().getSavedThemes()).toHaveLength(2);
  });
});

describe('WallpaperLayer and EffectsLayer', () => {
  it('renders solid, preset and custom backgrounds with dim and brightness', async () => {
    const { rerender } = await act(async () => render(<WallpaperLayer />));
    expect(screen.getByTestId('wallpaper-layer')).toHaveAttribute('data-wallpaper', 'solid:#09090b');
    expect(screen.queryByTestId('wallpaper-dim')).not.toBeInTheDocument();

    act(() => useThemeStore.getState().setWallpaper({ type: 'preset', idOrColor: 'animated-aurora' }));
    rerender(<WallpaperLayer />);
    const image = screen.getByTestId('wallpaper-image');
    expect(screen.getByTestId('wallpaper-art').className).toContain('ff-wallpaper-drift');
    expect(image.style.filter).toBe('brightness(100%) blur(0px)');
    expect(screen.getByTestId('wallpaper-dim').style.opacity).toBe('0.2');

    act(() => {
      useThemeLibraryStore.setState({
        customWallpapers: [{ id: 'c1', name: 'mine', type: 'custom', url: 'blob:c1', luminance: 0.2 }],
      });
      useThemeStore.getState().setWallpaper({ type: 'custom', idOrColor: 'c1' });
    });
    rerender(<WallpaperLayer />);
    expect(screen.getByTestId('wallpaper-art').style.backgroundImage).toContain('blob:c1');
  });

  it('AC-15.1: raises the capsule opacity to 50 % behind a bright wallpaper', async () => {
    useThemeStore.getState().setConfig({
      ...OBSIDIAN_MINIMAL_CONFIG,
      tokens: { ...OBSIDIAN_MINIMAL_CONFIG.tokens, capsuleOpacity: 0.3, bgDim: 0 },
      wallpaperRef: { type: 'preset', idOrColor: 'gradient-mint' },
    });
    await act(async () => render(<WallpaperLayer />));
    expect(useThemeStore.getState().tokens.capsuleOpacity).toBe(0.5);
  });

  it('draws grain and vignette as static layers and nothing when all effects are off', () => {
    const { container, rerender } = render(<EffectsLayer />);
    expect(container).toBeEmptyDOMElement();
    act(() => useThemeStore.getState().setEffects({ grain: 40, vignette: 60 }));
    rerender(<EffectsLayer />);
    expect(screen.getByTestId('grain-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('vignette-overlay')).toBeInTheDocument();
    expect(screen.queryByTestId('particle-canvas')).not.toBeInTheDocument();
  });

  it('AC-26.4: no particles with reduced motion', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    act(() => useThemeStore.getState().setEffects({ fireflies: 50 }));
    const { container } = render(<EffectsLayer />);
    expect(container).toBeEmptyDOMElement();
    delete (window as unknown as { matchMedia?: unknown }).matchMedia;
  });
});

describe('settings', () => {
  it('loading saved settings restores the whole theme', async () => {
    await getLocalRepository().saveSettings({
      activeTheme: { ...OBSIDIAN_MINIMAL_CONFIG, presetId: 'x', wallpaperRef: { type: 'preset', idOrColor: 'gradient-ocean' } },
    });
    await useSettingsStore.getState().load();
    expect(useThemeStore.getState().config.wallpaperRef).toEqual({ type: 'preset', idOrColor: 'gradient-ocean' });
  });
});
