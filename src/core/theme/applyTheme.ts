import { ThemeTokens } from '@/shared/types/contracts';

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
  root.style.setProperty('--capsule-bg', tokens.capsuleBg);
  root.style.setProperty('--capsule-opacity', String(tokens.capsuleOpacity));
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
