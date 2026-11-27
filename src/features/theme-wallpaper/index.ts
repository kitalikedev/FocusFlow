export { WallpaperLayer } from './components/WallpaperLayer';
export type { WallpaperLayerProps } from './components/WallpaperLayer';
export { EffectsLayer } from './components/EffectsLayer';
export { ThemeCustomizerModal, WallpaperPickerModal } from './components/ThemeModals';
// The preview page is small (about 1 KB gzipped), so it ships in the main bundle: loading it on demand added a
// request after the app had started and delayed the page when it was opened directly.
export { ThemesPage } from './components/ThemesPage';
// The built-in theme list (plain data), used by the website home page to show a few of them.
export { THEME_PRESETS } from './lib/presets';
export type { ThemePreset } from './lib/presets';
