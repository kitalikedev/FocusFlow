import { lazy } from 'react';

export { WallpaperLayer } from './components/WallpaperLayer';
export type { WallpaperLayerProps } from './components/WallpaperLayer';
export { EffectsLayer } from './components/EffectsLayer';
export { ThemeCustomizerModal, WallpaperPickerModal } from './components/ThemeModals';
// The preview page is only needed when someone opens it, so it stays out of the first bundle.
export const ThemesPage = lazy(() => import('./components/ThemesPage'));
// The built-in theme list (plain data), used by the website home page to show a few of them.
export { THEME_PRESETS } from './lib/presets';
export type { ThemePreset } from './lib/presets';
