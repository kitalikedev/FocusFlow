import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isFullscreenSupported, useUiStore, watchFullscreen } from '../useUiStore';

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

  it('toggleFullscreen asks the browser to enter and leave fullscreen without touching the state', () => {
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

    useUiStore.getState().toggleFullscreen();
    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
    expect(useUiStore.getState().isFullscreen).toBe(false);

    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, configurable: true });
    useUiStore.getState().toggleFullscreen();
    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
  });

  it('a rejected or missing fullscreen request never throws or flips the state', async () => {
    document.documentElement.requestFullscreen = vi.fn().mockRejectedValue(new Error('denied'));
    expect(() => useUiStore.getState().toggleFullscreen()).not.toThrow();
    await Promise.resolve();
    expect(useUiStore.getState().isFullscreen).toBe(false);

    (document.documentElement as { requestFullscreen?: unknown }).requestFullscreen = undefined;
    expect(() => useUiStore.getState().toggleFullscreen()).not.toThrow();
  });

  it('watchFullscreen keeps isFullscreen in sync with the browser, including Esc', () => {
    const stop = watchFullscreen();
    expect(useUiStore.getState().isFullscreen).toBe(false);

    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, configurable: true });
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(useUiStore.getState().isFullscreen).toBe(true);

    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(useUiStore.getState().isFullscreen).toBe(false);

    stop();
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, configurable: true });
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(useUiStore.getState().isFullscreen).toBe(false);
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
  });

  it('isFullscreenSupported depends on the browser capability', () => {
    document.documentElement.requestFullscreen = vi.fn();
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true });
    expect(isFullscreenSupported()).toBe(true);
    Object.defineProperty(document, 'fullscreenEnabled', { value: false, configurable: true });
    expect(isFullscreenSupported()).toBe(false);
    Object.defineProperty(document, 'fullscreenEnabled', { value: undefined, configurable: true });
    (document.documentElement as { requestFullscreen?: unknown }).requestFullscreen = undefined;
    expect(isFullscreenSupported()).toBe(false);
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

describe('useUiStore.togglePanel', () => {
  beforeEach(() => {
    useUiStore.setState({ isTasksOpen: false, isNoteOpen: false, isMixerOpen: false });
  });

  it('opens several panels side by side on desktop and closes one on a second click', () => {
    const { togglePanel } = useUiStore.getState();
    togglePanel('tasks');
    togglePanel('note');
    expect(useUiStore.getState()).toMatchObject({ isTasksOpen: true, isNoteOpen: true, isMixerOpen: false });
    togglePanel('tasks');
    expect(useUiStore.getState()).toMatchObject({ isTasksOpen: false, isNoteOpen: true });
  });

  it('exclusive mode keeps only the toggled panel open (phones)', () => {
    const { togglePanel } = useUiStore.getState();
    togglePanel('tasks', true);
    togglePanel('mixer', true);
    expect(useUiStore.getState()).toMatchObject({ isTasksOpen: false, isNoteOpen: false, isMixerOpen: true });
    togglePanel('mixer', true);
    expect(useUiStore.getState().isMixerOpen).toBe(false);
  });
});
