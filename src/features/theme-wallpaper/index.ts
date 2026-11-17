import { lazy } from 'react';

export { WallpaperLayer } from './components/WallpaperLayer';
export type { WallpaperLayerProps } from './components/WallpaperLayer';
export { EffectsLayer } from './components/EffectsLayer';
export { ThemeCustomizerModal, WallpaperPickerModal } from './components/ThemeModals';
// The preview page is only needed when someone opens it, so it stays out of the first bundle.
export const ThemesPage = lazy(() => import('./components/ThemesPage'));
