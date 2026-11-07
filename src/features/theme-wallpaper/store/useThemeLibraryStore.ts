import { create } from 'zustand';
import type { SavedTheme, ThemeConfig, WallpaperMetadata } from '@/shared/types/contracts';
import { LIMITS } from '@/core/data/defaults';
import { getDataRepository } from '@/core/data/useDataRepository';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { trackWrite } from '@/core/data/useSyncStatusStore';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { useToastStore } from '@/core/ui/useToastStore';
import { toAppError } from '@/shared/lib/errors';
import { findWallpaper, solidLuminance } from '../lib/catalog';
import { enforceReadability } from '../lib/contrast';
import { isAcceptedWallpaper, sampleLuminance, UPLOAD_ERROR } from '../lib/sampleImage';

export interface ThemeLibraryState {
  customWallpapers: WallpaperMetadata[];
  savedThemes: SavedTheme[];
  isUploading: boolean;
  load: () => Promise<void>;
  uploadWallpaper: (file: File) => Promise<WallpaperMetadata | null>;
  deleteWallpaper: (id: string) => Promise<void>;
  saveTheme: (name: string, config: ThemeConfig) => Promise<boolean>;
  renameTheme: (id: string, name: string) => Promise<boolean>;
  deleteTheme: (id: string) => Promise<void>;
}

function showError(message: string): void {
  useToastStore.getState().showToast(message, { variant: 'error' });
}

export function themeLimit(): number {
  return useAuthStore.getState().isGuest ? LIMITS.guestThemesMax : LIMITS.cloudThemesMax;
}

export function wallpaperLimit(): number {
  return useAuthStore.getState().isGuest ? 1 : 3;
}

/** Luminance of whatever is behind the clock (preset metadata, upload metadata or the solid color). */
export function backgroundLuminance(ref: ThemeConfig['wallpaperRef'], customs: WallpaperMetadata[]): number {
  if (ref.type === 'solid') return solidLuminance(ref.idOrColor);
  if (ref.type === 'preset') return findWallpaper(ref.idOrColor)?.luminance ?? 0;
  return customs.find((wallpaper) => wallpaper.id === ref.idOrColor)?.luminance ?? 0.5;
}

/** Readability rules applied to a whole config before it is shown or saved (FR-15). */
export function readableConfig(config: ThemeConfig, customs: WallpaperMetadata[]): ThemeConfig {
  const { tokens } = enforceReadability(config.tokens, backgroundLuminance(config.wallpaperRef, customs));
  return { ...config, tokens };
}

/** Shows a theme right away and saves it with a single settings update (FR-09, AC-27.1). */
export async function applyAndSaveTheme(config: ThemeConfig): Promise<void> {
  const readable = readableConfig(config, useThemeLibraryStore.getState().customWallpapers);
  useThemeStore.getState().setConfig(readable);
  const wallpaperId = readable.wallpaperRef.type === 'solid' ? undefined : readable.wallpaperRef.idOrColor;
  await useSettingsStore
    .getState()
    .update(wallpaperId ? { activeTheme: readable, activeWallpaperId: wallpaperId } : { activeTheme: readable });
}

let loadSequence = 0;

/** Uploaded wallpapers (FR-14) and saved themes (FR-27) of the current data source. */
export const useThemeLibraryStore = create<ThemeLibraryState>((set, get) => ({
  customWallpapers: [],
  savedThemes: [],
  isUploading: false,

  load: async () => {
    const sequence = ++loadSequence;
    const repository = getDataRepository();
    const [wallpapers, themes] = await Promise.allSettled([repository.getWallpapers(), repository.getSavedThemes()]);
    if (sequence !== loadSequence) return;
    set({
      customWallpapers: wallpapers.status === 'fulfilled' ? wallpapers.value : [],
      savedThemes: themes.status === 'fulfilled' ? themes.value : [],
    });
  },

  uploadWallpaper: async (file) => {
    if (!isAcceptedWallpaper(file)) {
      showError(UPLOAD_ERROR);
      return null;
    }
    if (get().customWallpapers.length >= wallpaperLimit()) {
      showError(
        wallpaperLimit() === 1
          ? 'Guests can keep 1 custom wallpaper. Delete it or sign in to upload up to 3.'
          : 'You can keep up to 3 custom wallpapers. Delete one to upload another.',
      );
      return null;
    }
    set({ isUploading: true });
    try {
      const luminance = await sampleLuminance(file);
      const uploaded = await trackWrite(() => getDataRepository().uploadCustomWallpaper(file, luminance));
      set((state) => ({ customWallpapers: [uploaded, ...state.customWallpapers] }));
      return uploaded;
    } catch (error) {
      showError(toAppError(error).message);
      return null;
    } finally {
      set({ isUploading: false });
    }
  },

  deleteWallpaper: async (id) => {
    try {
      await trackWrite(() => getDataRepository().deleteCustomWallpaper(id));
      set((state) => ({ customWallpapers: state.customWallpapers.filter((wallpaper) => wallpaper.id !== id) }));
      const { config } = useThemeStore.getState();
      if (config.wallpaperRef.type === 'custom' && config.wallpaperRef.idOrColor === id) {
        await applyAndSaveTheme({ ...config, wallpaperRef: { type: 'solid', idOrColor: config.tokens.bgSolidColor } });
      }
    } catch (error) {
      showError(toAppError(error).message);
    }
  },

  saveTheme: async (name, config) => {
    const limit = themeLimit();
    if (get().savedThemes.length >= limit) {
      // AC-27.2, wording from the PRD.
      showError(`Limit reached (${limit} themes). Please delete an existing theme to save.`);
      return false;
    }
    try {
      const saved = await trackWrite(() =>
        getDataRepository().saveTheme({ name, config: { ...config, presetId: undefined } }),
      );
      set((state) => ({ savedThemes: [saved, ...state.savedThemes] }));
      return true;
    } catch (error) {
      showError(toAppError(error).message);
      return false;
    }
  },

  renameTheme: async (id, name) => {
    try {
      const renamed = await trackWrite(() => getDataRepository().renameTheme(id, name));
      set((state) => ({ savedThemes: state.savedThemes.map((theme) => (theme.id === id ? renamed : theme)) }));
      return true;
    } catch (error) {
      showError(toAppError(error).message);
      return false;
    }
  },

  deleteTheme: async (id) => {
    try {
      await trackWrite(() => getDataRepository().deleteTheme(id));
      set((state) => ({ savedThemes: state.savedThemes.filter((theme) => theme.id !== id) }));
    } catch (error) {
      showError(toAppError(error).message);
    }
  },
}));
