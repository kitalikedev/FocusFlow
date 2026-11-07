import React, { lazy, Suspense, useCallback } from 'react';
import { useUiStore } from '@/core/ui/useUiStore';

// The whole Themes panel (library, customizer, saved themes) loads on first open.
const ThemePanel = lazy(() => import('./ThemePanel'));

/** Themes panel opened from the quick controls (FR-25, FR-27). */
export const ThemeCustomizerModal: React.FC = () => {
  const isThemeOpen = useUiStore((state) => state.isThemeCustomizerOpen);
  const isPickerOpen = useUiStore((state) => state.isWallpaperPickerOpen);
  const close = useCallback(
    () => useUiStore.setState({ isThemeCustomizerOpen: false, isWallpaperPickerOpen: false }),
    [],
  );

  if (!isThemeOpen && !isPickerOpen) return null;

  return (
    <Suspense fallback={null}>
      <ThemePanel onClose={close} />
    </Suspense>
  );
};

/** Kept for the slot contract: the wallpaper picker lives in the Library tab of the Themes panel. */
export const WallpaperPickerModal: React.FC = () => null;
