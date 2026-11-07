import { parseColor, relativeLuminance } from '@/core/theme/color';
import { PIXEL_CYBERPUNK_WALLPAPERS } from './pixelCyberpunk';

export type WallpaperCategory = 'colors' | 'abstract' | 'animated' | 'pixel' | 'cyberpunk' | 'scenic';

export const CATEGORY_LABELS: Record<WallpaperCategory, string> = {
  colors: 'Colors & Gradients',
  abstract: 'Abstract',
  animated: 'Animated',
  pixel: 'Pixel',
  cyberpunk: 'Cyberpunk',
  scenic: 'Scenic',
};

export interface CatalogWallpaper {
  id: string;
  name: string;
  category: WallpaperCategory;
  /** CSS `background` value (gradients) or null for image wallpapers. */
  background: string | null;
  /** Image or GIF under /public/wallpapers (scenic group). */
  imageUrl?: string;
  /** Pixel art: scale with hard edges instead of smoothing. */
  pixelated?: boolean;
  /** Extra class for animated wallpapers (keyframes in wallpapers.css). */
  animationClass?: string;
  /** Precomputed average relative luminance 0..1 (FR-15: never measured at runtime). */
  luminance: number;
}

/** Average relative luminance of the gradient stops: cheap and stable stand-in for the rendered image. */
export function averageLuminance(colors: string[]): number {
  const values = colors.map((color) => parseColor(color)).filter((color) => color !== null);
  if (values.length === 0) return 0;
  const total = values.reduce((sum, color) => sum + relativeLuminance(color), 0);
  return Math.round((total / values.length) * 1000) / 1000;
}

function gradient(id: string, name: string, angle: number, stops: string[]): CatalogWallpaper {
  return {
    id,
    name,
    category: 'colors',
    background: `linear-gradient(${angle}deg, ${stops.join(', ')})`,
    luminance: averageLuminance(stops),
  };
}

function layered(id: string, name: string, background: string, palette: string[]): CatalogWallpaper {
  return { id, name, category: 'abstract', background, luminance: averageLuminance(palette) };
}

function animated(id: string, name: string, stops: string[]): CatalogWallpaper {
  return {
    id,
    name,
    category: 'animated',
    background: `linear-gradient(-45deg, ${stops.join(', ')})`,
    animationClass: 'ff-wallpaper-drift',
    luminance: averageLuminance(stops),
  };
}

/**
 * Built-in wallpapers. All are drawn with CSS (0 KB, no copyright question). To add a picture, put the file in
 * /public/wallpapers and add `{ id, name, category: 'scenic', background: null, imageUrl, luminance }` here.
 */
export const WALLPAPER_CATALOG: CatalogWallpaper[] = [
  gradient('gradient-midnight', 'Midnight', 160, ['#020617', '#0f172a', '#1e3a8a']),
  gradient('gradient-thermal', 'Thermal', 135, ['#1e1b4b', '#6d28d9', '#ea580c']),
  gradient('gradient-fog', 'Fog', 180, ['#18181b', '#27272a', '#52525b']),
  gradient('gradient-forest', 'Forest', 150, ['#052e16', '#14532d', '#4d7c0f']),
  gradient('gradient-ocean', 'Ocean', 160, ['#082f49', '#0e7490', '#155e75']),
  gradient('gradient-sunset', 'Sunset', 135, ['#4c0519', '#be123c', '#fb923c']),
  gradient('gradient-ember', 'Ember', 160, ['#0c0a09', '#7f1d1d', '#b45309']),
  gradient('gradient-rose', 'Rose Gold', 135, ['#3f1d2b', '#9f4f5d', '#e8b4a0']),
  gradient('gradient-autumn', 'Autumn', 135, ['#7c2d12', '#ea580c', '#facc15']),
  gradient('gradient-cotton', 'Cotton', 135, ['#c7d2fe', '#fbcfe8', '#e0f2fe']),
  gradient('gradient-lavender', 'Lavender', 160, ['#ede9fe', '#c4b5fd', '#a5b4fc']),
  gradient('gradient-mint', 'Mint', 160, ['#ecfdf5', '#a7f3d0', '#5eead4']),
  layered(
    'abstract-nebula',
    'Nebula',
    'radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.55), transparent 45%), radial-gradient(circle at 80% 70%, rgba(37, 99, 235, 0.5), transparent 50%), radial-gradient(circle at 50% 100%, rgba(236, 72, 153, 0.35), transparent 55%), #05030f',
    ['#05030f', '#05030f', '#7c3aed', '#2563eb'],
  ),
  layered(
    'abstract-dusk',
    'Dusk Mesh',
    'radial-gradient(at 10% 10%, #f472b6 0, transparent 50%), radial-gradient(at 90% 20%, #818cf8 0, transparent 50%), radial-gradient(at 50% 90%, #fb923c 0, transparent 55%), #1e1b4b',
    ['#1e1b4b', '#1e1b4b', '#f472b6', '#818cf8'],
  ),
  layered(
    'abstract-grid',
    'Grid Glow',
    'radial-gradient(circle at 50% 40%, rgba(56, 189, 248, 0.25), transparent 60%), repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 48px), repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 48px), #020617',
    ['#020617', '#020617', '#0c4a6e'],
  ),
  layered(
    'abstract-dunes',
    'Dunes',
    'linear-gradient(170deg, transparent 0 55%, rgba(120, 53, 15, 0.9) 55% 70%, transparent 70%), linear-gradient(190deg, transparent 0 65%, rgba(68, 26, 3, 0.95) 65%), linear-gradient(180deg, #fdba74, #c2410c)',
    ['#fdba74', '#c2410c', '#78350f', '#441a03'],
  ),
  animated('animated-aurora', 'Aurora', ['#022c22', '#065f46', '#4c1d95', '#0e7490']),
  animated('animated-lava', 'Lava', ['#450a0a', '#9a3412', '#7f1d1d', '#c2410c']),
  animated('animated-deep-sea', 'Deep Sea', ['#020617', '#0c4a6e', '#1e3a8a', '#0f766e']),
  animated('animated-candy', 'Candy', ['#f9a8d4', '#a5b4fc', '#fbcfe8', '#93c5fd']),
  ...PIXEL_CYBERPUNK_WALLPAPERS,
];

export function findWallpaper(id: string): CatalogWallpaper | undefined {
  return WALLPAPER_CATALOG.find((wallpaper) => wallpaper.id === id);
}

export function solidLuminance(color: string): number {
  const parsed = parseColor(color);
  return parsed ? relativeLuminance(parsed) : 0;
}
