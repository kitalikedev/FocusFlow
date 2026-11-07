import type { ThemeTokens } from '@/shared/types/contracts';
import { contrastRatio, parseColor, relativeLuminance, toHex, type Rgb } from '@/core/theme/color';

/** FR-15 / FR-24 limits. */
export const CAPSULE_MAX_LUMINANCE = 0.2;
export const BRIGHT_BACKGROUND_LUMINANCE = 0.6;
export const OPACITY_FLOOR = 0.5;
export const MIN_CONTRAST = 4.5;

export const OPACITY_LOCKED_NOTE = 'Locked at min 50% on bright background';
export const ACCENT_ADJUSTED_NOTE = 'Contrast adjusted to 4.5:1 for readability';
export const CAPSULE_CLAMPED_NOTE = 'Capsule color kept dark (luminance ≤ 0.20) so the clock stays readable';

/** L_effective = L_base × brightness/100 × (1 − dim/100); no per-frame image analysis (FR-15). */
export function effectiveLuminance(base: number, brightness: number, dim: number): number {
  return Math.min(1, Math.max(0, base * (brightness / 100) * (1 - dim / 100)));
}

/** Results are stored as hex, so every check runs on the rounded 8-bit channels. */
function rounded(color: Rgb): Rgb {
  return { r: Math.round(color.r), g: Math.round(color.g), b: Math.round(color.b), a: color.a };
}

function scale(color: Rgb, factor: number): Rgb {
  return rounded({ r: color.r * factor, g: color.g * factor, b: color.b * factor, a: color.a });
}

function mix(color: Rgb, target: Rgb, amount: number): Rgb {
  return rounded({
    r: color.r + (target.r - color.r) * amount,
    g: color.g + (target.g - color.g) * amount,
    b: color.b + (target.b - color.b) * amount,
    a: color.a,
  });
}

const WHITE: Rgb = { r: 255, g: 255, b: 255, a: 1 };
const BLACK: Rgb = { r: 0, g: 0, b: 0, a: 1 };

/** Darkens a capsule color until its relative luminance is ≤ 0.20 (AC-25.3). Returns a hex color. */
export function clampCapsuleColor(color: string): { color: string; clamped: boolean } {
  const parsed = parseColor(color);
  if (!parsed) return { color: '#000000', clamped: true };
  if (relativeLuminance(parsed) <= CAPSULE_MAX_LUMINANCE) return { color: toHex(parsed), clamped: false };
  let low = 0;
  let high = 1;
  for (let i = 0; i < 20; i += 1) {
    const middle = (low + high) / 2;
    if (relativeLuminance(scale(parsed, middle)) <= CAPSULE_MAX_LUMINANCE) low = middle;
    else high = middle;
  }
  return { color: toHex(scale(parsed, low)), clamped: true };
}

/**
 * Raises the accent until it reaches 4.5:1 against the (dark) capsule, by mixing it toward white (AC-25.2).
 */
export function adjustAccent(accent: string, capsule: string): { color: string; adjusted: boolean } {
  const parsedAccent = parseColor(accent) ?? WHITE;
  const background = relativeLuminance(parseColor(capsule) ?? BLACK);
  if (contrastRatio(relativeLuminance(parsedAccent), background) >= MIN_CONTRAST) {
    return { color: toHex(parsedAccent), adjusted: false };
  }
  let low = 0;
  let high = 1;
  for (let i = 0; i < 20; i += 1) {
    const middle = (low + high) / 2;
    if (contrastRatio(relativeLuminance(mix(parsedAccent, WHITE, middle)), background) >= MIN_CONTRAST) high = middle;
    else low = middle;
  }
  return { color: toHex(mix(parsedAccent, WHITE, high)), adjusted: true };
}

/** Black or white text on the accent, whichever reads better (`--color-accent-contrast`). */
export function accentContrastColor(accent: string): string {
  const luminance = relativeLuminance(parseColor(accent) ?? WHITE);
  return contrastRatio(luminance, 0) >= contrastRatio(luminance, 1) ? '#000000' : '#ffffff';
}

export interface ReadabilityResult {
  tokens: ThemeTokens;
  opacityLocked: boolean;
  capsuleClamped: boolean;
  accentAdjusted: boolean;
}

/**
 * Applies every readability rule to a token set for a background of luminance `baseLuminance`:
 * dark capsule, opacity floor on bright backgrounds, accent contrast and accent text color.
 */
export function enforceReadability(tokens: ThemeTokens, baseLuminance: number): ReadabilityResult {
  const bright = effectiveLuminance(baseLuminance, tokens.bgBrightness, tokens.bgDim) > BRIGHT_BACKGROUND_LUMINANCE;
  const capsule = clampCapsuleColor(tokens.capsuleBg);
  const opacityLocked = bright && tokens.capsuleOpacity < OPACITY_FLOOR;
  const accent = adjustAccent(tokens.colorAccent, capsule.color);
  return {
    tokens: {
      ...tokens,
      capsuleBg: capsule.color,
      capsuleOpacity: opacityLocked ? OPACITY_FLOOR : tokens.capsuleOpacity,
      colorAccent: accent.color,
      colorAccentContrast: accentContrastColor(accent.color),
    },
    opacityLocked,
    capsuleClamped: capsule.clamped,
    accentAdjusted: accent.adjusted,
  };
}

export function isBrightBackground(baseLuminance: number, tokens: ThemeTokens): boolean {
  return effectiveLuminance(baseLuminance, tokens.bgBrightness, tokens.bgDim) > BRIGHT_BACKGROUND_LUMINANCE;
}
