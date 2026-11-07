import { useEffect } from 'react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { enforceReadability } from '../lib/contrast';
import { ensureFontForStack } from '../lib/fonts';
import { backgroundLuminance, useThemeLibraryStore } from '../store/useThemeLibraryStore';

/** Loads uploads and saved themes for the current account (again after sign in / out). */
export function useThemeLibraryData(): void {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isGuest = useAuthStore((state) => state.isGuest);
  const userId = useAuthStore((state) => state.user?.id);
  const dataVersion = useAuthStore((state) => state.dataVersion);

  useEffect(() => {
    if (!isLoading) void useThemeLibraryStore.getState().load();
  }, [isLoading, isGuest, userId, dataVersion]);
}

/** Downloads the clock font of the active theme on demand (AC-25.4). */
export function useClockFont(): void {
  const fontClock = useThemeStore((state) => state.tokens.fontClock);
  useEffect(() => {
    void ensureFontForStack(fontClock);
  }, [fontClock]);
}

/**
 * AC-15.1 / AC-25.3: whatever produced the current theme (a preset, a saved row, an upload), the capsule stays
 * dark, its opacity never drops under 50 % on a bright background and the accent keeps 4.5:1.
 */
export function useContrastShield(): void {
  const tokens = useThemeStore((state) => state.tokens);
  const wallpaperRef = useThemeStore((state) => state.config.wallpaperRef);
  const customWallpapers = useThemeLibraryStore((state) => state.customWallpapers);

  useEffect(() => {
    const { tokens: safe } = enforceReadability(tokens, backgroundLuminance(wallpaperRef, customWallpapers));
    const fixes: Partial<typeof tokens> = {};
    (Object.keys(safe) as (keyof typeof tokens)[]).forEach((key) => {
      if (safe[key] !== tokens[key]) (fixes as Record<string, unknown>)[key] = safe[key];
    });
    if (Object.keys(fixes).length > 0) useThemeStore.getState().setTokens(fixes);
  }, [tokens, wallpaperRef, customWallpapers]);
}
