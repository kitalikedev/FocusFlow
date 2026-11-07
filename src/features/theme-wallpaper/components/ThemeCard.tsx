import React from 'react';
import { Check } from 'lucide-react';
import type { ThemeConfig } from '@/shared/types/contracts';
import { withAlpha } from '@/core/theme/color';
import { useThemeLibraryStore } from '../store/useThemeLibraryStore';
import { backgroundFor } from './WallpaperLayer';

interface ThemeCardProps {
  name: string;
  config: ThemeConfig;
  isActive: boolean;
  onSelect: () => void;
  testId?: string;
}

/** Thumbnail of a whole theme: its wallpaper with a mini capsule in its accent and font (AC-13.1 ring). */
export const ThemeCard: React.FC<ThemeCardProps> = ({ name, config, isActive, onSelect, testId }) => {
  const customs = useThemeLibraryStore((state) => state.customWallpapers);
  const background = backgroundFor(config.wallpaperRef, customs, config.tokens.bgSolidColor, false);
  const { tokens } = config;

  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={isActive}
      onClick={onSelect}
      className={`group flex flex-col gap-1.5 text-left focus-visible:outline-none`}
    >
      <span
        className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl transition ${
          isActive ? 'ring-2 ring-white' : 'ring-1 ring-white/10 group-hover:ring-white/40 group-focus-visible:ring-white/60'
        }`}
        style={{ backgroundColor: tokens.bgSolidColor }}
      >
        <span aria-hidden="true" className={`absolute inset-0 ${background.className}`} style={background.style} />
        <span
          aria-hidden="true"
          className="relative px-2.5 py-1 text-sm"
          style={{
            backgroundColor: withAlpha(tokens.capsuleBg, tokens.capsuleOpacity),
            borderRadius: Math.min(tokens.capsuleRadius, 14),
            color: tokens.colorAccent,
            fontFamily: tokens.fontClock,
            fontWeight: tokens.clockWeight,
          }}
        >
          25:00
        </span>
        {isActive && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-white p-0.5 text-black">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="truncate text-xs text-white/80">{name}</span>
    </button>
  );
};

interface SwatchProps {
  label: string;
  style: React.CSSProperties;
  isActive: boolean;
  onSelect: () => void;
  testId?: string;
  children?: React.ReactNode;
}

/** Wallpaper-only thumbnail. */
export const WallpaperSwatch: React.FC<SwatchProps> = ({ label, style, isActive, onSelect, testId, children }) => (
  <div className="relative">
    <button
      type="button"
      data-testid={testId}
      aria-label={label}
      title={label}
      aria-pressed={isActive}
      onClick={onSelect}
      className={`block aspect-video w-full overflow-hidden rounded-lg transition focus-visible:outline-none ${
        isActive ? 'ring-2 ring-white' : 'ring-1 ring-white/10 hover:ring-white/40 focus-visible:ring-white/60'
      }`}
      style={style}
    />
    {children}
  </div>
);
