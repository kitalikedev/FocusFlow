import { ThemeTokens } from '@/shared/types/contracts';
import { withAlpha } from './color';

/**
 * Apply theme tokens to document root as CSS variables.
 * Designed to execute in < 50ms without full page re-render.
 * Sets exactly the 15 design tokens defined in PRD FR-24 and ARCHITECTURE 4.2.
 */
export function applyTheme(tokens: ThemeTokens): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  root.style.setProperty('--color-accent', tokens.colorAccent);
  root.style.setProperty('--color-accent-contrast', tokens.colorAccentContrast);
  // The capsule color carries the opacity token as its alpha, so the opacity slider changes the glass.
  root.style.setProperty('--capsule-bg', withAlpha(tokens.capsuleBg, tokens.capsuleOpacity));
  root.style.setProperty('--capsule-opacity', String(tokens.capsuleOpacity));
  // Tool panels hold long text, so they never get more transparent than 80 % (readability on any wallpaper).
  root.style.setProperty('--panel-bg', withAlpha(tokens.capsuleBg, Math.max(0.8, tokens.capsuleOpacity)));
  root.style.setProperty('--capsule-blur', `${tokens.capsuleBlur}px`);
  root.style.setProperty('--capsule-radius', `${tokens.capsuleRadius}px`);
  root.style.setProperty('--capsule-border-width', `${tokens.capsuleBorderWidth}px`);
  root.style.setProperty('--capsule-border-color', tokens.capsuleBorderColor);
  root.style.setProperty('--font-clock', tokens.fontClock);
  root.style.setProperty('--clock-scale', `${tokens.clockScale * 100}%`);
  root.style.setProperty('--clock-weight', String(tokens.clockWeight));
  root.style.setProperty('--bg-dim', `${tokens.bgDim}%`);
  root.style.setProperty('--bg-blur', `${tokens.bgBlur}px`);
  root.style.setProperty('--bg-brightness', `${tokens.bgBrightness}%`);
  root.style.setProperty('--bg-solid-color', tokens.bgSolidColor);
}
