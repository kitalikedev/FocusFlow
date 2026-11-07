import type React from 'react';

/** Clock digits follow the theme tokens: accent colour, clock font, weight and scale (FR-25). */
export const CLOCK_TEXT_STYLE: React.CSSProperties = {
  color: 'var(--color-accent)',
  fontFamily: 'var(--font-clock)',
  fontWeight: 'var(--clock-weight)' as React.CSSProperties['fontWeight'],
  fontVariantNumeric: 'tabular-nums',
  // Set by the "Glow" effect of the theme (FR-26); `none` when the effect is off.
  textShadow: 'var(--clock-glow, none)',
};

export const CLOCK_SCALE_STYLE: React.CSSProperties = {
  transform: 'scale(var(--clock-scale, 1))',
};
