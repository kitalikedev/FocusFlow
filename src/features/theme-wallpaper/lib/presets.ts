import type { ThemeConfig, ThemeTokens } from '@/shared/types/contracts';
import { OBSIDIAN_MINIMAL_CONFIG, OBSIDIAN_MINIMAL_TOKENS } from '@/core/theme/presets';
import { accentContrastColor } from './contrast';
import { FONT_OPTIONS } from './fonts';

export interface ThemePreset {
  id: string;
  name: string;
  config: ThemeConfig;
}

const NO_EFFECTS = { rain: 0, snow: 0, fireflies: 0, grain: 0, vignette: 0, scanlines: 0, glow: 0 };

function fontStack(id: string): string {
  return FONT_OPTIONS.find((font) => font.id === id)?.stack ?? OBSIDIAN_MINIMAL_TOKENS.fontClock;
}

function preset(
  id: string,
  name: string,
  tokens: Partial<ThemeTokens>,
  wallpaperRef: ThemeConfig['wallpaperRef'],
  effects: Partial<ThemeConfig['effects']> = {},
): ThemePreset {
  const merged = { ...OBSIDIAN_MINIMAL_TOKENS, ...tokens };
  merged.colorAccentContrast = accentContrastColor(merged.colorAccent);
  return { id, name, config: { presetId: id, tokens: merged, effects: { ...NO_EFFECTS, ...effects }, wallpaperRef } };
}

/** The six FocusFlow presets of PRD FR-27 (AC-27.1). */
export const THEME_PRESETS: ThemePreset[] = [
  { id: 'obsidian-minimal', name: 'Obsidian Minimal', config: OBSIDIAN_MINIMAL_CONFIG },
  preset(
    'tokyo-fog',
    'Tokyo Fog',
    {
      colorAccent: '#f5f5f4',
      capsuleBg: '#18181b',
      capsuleOpacity: 0.55,
      capsuleBorderColor: 'rgba(255, 255, 255, 0.12)',
      fontClock: fontStack('space-mono'),
      clockWeight: 700,
      bgSolidColor: '#18181b',
      bgDim: 15,
    },
    { type: 'preset', idOrColor: 'gradient-fog' },
    { grain: 20 },
  ),
  preset(
    'midnight-indigo',
    'Midnight Indigo',
    {
      colorAccent: '#38bdf8',
      capsuleBg: '#0f172a',
      capsuleOpacity: 0.6,
      capsuleBorderColor: 'rgba(56, 189, 248, 0.2)',
      fontClock: fontStack('jetbrains-mono'),
      bgSolidColor: '#0b0f19',
    },
    { type: 'preset', idOrColor: 'gradient-midnight' },
  ),
  preset(
    'matcha-slate',
    'Matcha Slate',
    {
      colorAccent: '#4ade80',
      capsuleBg: '#0f1f17',
      capsuleOpacity: 0.55,
      capsuleRadius: 32,
      capsuleBorderColor: 'rgba(74, 222, 128, 0.18)',
      fontClock: fontStack('outfit'),
      bgSolidColor: '#0f1412',
    },
    { type: 'preset', idOrColor: 'gradient-forest' },
    { fireflies: 30 },
  ),
  preset(
    'amber-wood',
    'Amber Wood',
    {
      colorAccent: '#fb923c',
      capsuleBg: '#1c130c',
      capsuleOpacity: 0.6,
      capsuleRadius: 16,
      capsuleBorderColor: 'rgba(251, 146, 60, 0.2)',
      fontClock: fontStack('playfair-display'),
      bgSolidColor: '#140f0b',
    },
    { type: 'preset', idOrColor: 'gradient-ember' },
    { vignette: 40 },
  ),
  preset(
    'nordic-night',
    'Nordic Night',
    {
      colorAccent: '#93c5fd',
      capsuleBg: '#0f172a',
      capsuleOpacity: 0.5,
      capsuleRadius: 12,
      capsuleBorderColor: 'rgba(186, 230, 253, 0.25)',
      fontClock: fontStack('silkscreen'),
      clockWeight: 400,
      bgSolidColor: '#0f172a',
    },
    { type: 'preset', idOrColor: 'animated-deep-sea' },
    { snow: 25 },
  ),
];
