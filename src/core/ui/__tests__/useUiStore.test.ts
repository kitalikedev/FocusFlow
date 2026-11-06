import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUiStore } from '../useUiStore';

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      isZen: false,
      isFullscreen: false,
      isMixerOpen: false,
      isWallpaperPickerOpen: false,
      isThemeCustomizerOpen: false,
      isClockSettingsOpen: false,
      isAnalyticsOpen: false,
      isMobileDrawerOpen: false,
      activeDrawerTab: 'timer',
    });
  });

  it('toggles isZen state', () => {
    expect(useUiStore.getState().isZen).toBe(false);
    useUiStore.getState().toggleZen();
    expect(useUiStore.getState().isZen).toBe(true);
    useUiStore.getState().toggleZen();
    expect(useUiStore.getState().isZen).toBe(false);
  });

  it('toggles isFullscreen state and calls requestFullscreen/exitFullscreen safely', () => {
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

    expect(useUiStore.getState().isFullscreen).toBe(false);

    useUiStore.getState().toggleFullscreen();
    expect(useUiStore.getState().isFullscreen).toBe(true);

    // Mock document.fullscreenElement to be present for exit
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
    });

    useUiStore.getState().toggleFullscreen();
    expect(useUiStore.getState().isFullscreen).toBe(false);
    expect(document.exitFullscreen).toHaveBeenCalled();

    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    });
  });

  it('manages modal open states and closes all with closeAllModals', () => {
    useUiStore.getState().setMixerOpen(true);
    useUiStore.getState().setWallpaperPickerOpen(true);
    useUiStore.getState().setThemeCustomizerOpen(true);
    useUiStore.getState().setClockSettingsOpen(true);
    useUiStore.getState().setAnalyticsOpen(true);

    const state = useUiStore.getState();
    expect(state.isMixerOpen).toBe(true);
    expect(state.isWallpaperPickerOpen).toBe(true);
    expect(state.isThemeCustomizerOpen).toBe(true);
    expect(state.isClockSettingsOpen).toBe(true);
    expect(state.isAnalyticsOpen).toBe(true);

    useUiStore.getState().closeAllModals();

    const closedState = useUiStore.getState();
    expect(closedState.isMixerOpen).toBe(false);
    expect(closedState.isWallpaperPickerOpen).toBe(false);
    expect(closedState.isThemeCustomizerOpen).toBe(false);
    expect(closedState.isClockSettingsOpen).toBe(false);
    expect(closedState.isAnalyticsOpen).toBe(false);
  });

  it('updates active drawer tab and mobile drawer state', () => {
    useUiStore.getState().setMobileDrawerOpen(true);
    useUiStore.getState().setActiveDrawerTab('tasks');

    expect(useUiStore.getState().isMobileDrawerOpen).toBe(true);
    expect(useUiStore.getState().activeDrawerTab).toBe('tasks');
  });
});
