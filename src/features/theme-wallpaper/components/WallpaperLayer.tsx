import React from 'react';
import type { ThemeConfig, WallpaperMetadata } from '@/shared/types/contracts';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { findWallpaper } from '../lib/catalog';
import { useClockFont, useContrastShield, useThemeLibraryData } from '../hooks/useThemeEffects';
import { useThemeLibraryStore } from '../store/useThemeLibraryStore';
import './wallpapers.css';

export interface WallpaperLayerProps {
  children?: React.ReactNode;
}

export interface BackgroundStyle {
  style: React.CSSProperties;
  className: string;
}

/** CSS for any wallpaper reference; unknown references fall back to the solid color. */
export function backgroundFor(
  ref: ThemeConfig['wallpaperRef'],
  customs: WallpaperMetadata[],
  fallbackColor: string,
  animate = true,
): BackgroundStyle {
  if (ref.type === 'preset') {
    const wallpaper = findWallpaper(ref.idOrColor);
    if (wallpaper?.background) {
      return {
        style: { background: wallpaper.background },
        className: animate && wallpaper.animationClass ? wallpaper.animationClass : '',
      };
    }
    if (wallpaper?.imageUrl) {
      return {
        style: {
          backgroundImage: `url("${wallpaper.imageUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          imageRendering: wallpaper.pixelated ? 'pixelated' : undefined,
        },
        className: '',
      };
    }
  }
  if (ref.type === 'custom') {
    const custom = customs.find((wallpaper) => wallpaper.id === ref.idOrColor);
    if (custom) {
      return { style: { backgroundImage: `url("${custom.url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }, className: '' };
    }
  }
  return { style: { backgroundColor: ref.type === 'solid' ? ref.idOrColor : fallbackColor }, className: '' };
}

/** Full-screen background (FR-13, FR-14, FR-24) with brightness, blur and dim from the theme tokens. */
export const WallpaperLayer: React.FC<WallpaperLayerProps> = ({ children }) => {
  useThemeLibraryData();
  useClockFont();
  useContrastShield();
  const wallpaperRef = useThemeStore((state) => state.config.wallpaperRef);
  const tokens = useThemeStore((state) => state.tokens);
  const customWallpapers = useThemeLibraryStore((state) => state.customWallpapers);
  const background = backgroundFor(wallpaperRef, customWallpapers, tokens.bgSolidColor);
  const isSolid = wallpaperRef.type === 'solid';

  return (
    <div
      data-testid="wallpaper-layer"
      data-wallpaper={`${wallpaperRef.type}:${wallpaperRef.idOrColor}`}
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: tokens.bgSolidColor }}
    >
      <div
        data-testid="wallpaper-image"
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden transition-[filter] duration-200"
        style={{
          // AC-25.5: a solid color ignores the image adjustments.
          filter: isSolid ? undefined : `brightness(${tokens.bgBrightness}%) blur(${tokens.bgBlur}px)`,
          transform: !isSolid && tokens.bgBlur > 0 ? 'scale(1.05)' : undefined,
        }}
      >
        <div data-testid="wallpaper-art" className={`ff-wallpaper-art ${background.className}`} style={background.style} />
      </div>
      {!isSolid && (
        <div
          data-testid="wallpaper-dim"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: tokens.bgDim / 100 }}
        />
      )}
      {children}
    </div>
  );
};
