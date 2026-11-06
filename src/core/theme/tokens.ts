export const CSS_VARIABLE_MAP = {
  colorAccent: '--color-accent',
  colorAccentContrast: '--color-accent-contrast',
  capsuleBg: '--capsule-bg',
  capsuleOpacity: '--capsule-opacity',
  capsuleBlur: '--capsule-blur',
  capsuleRadius: '--capsule-radius',
  capsuleBorderWidth: '--capsule-border-width',
  capsuleBorderColor: '--capsule-border-color',
  fontClock: '--font-clock',
  clockScale: '--clock-scale',
  clockWeight: '--clock-weight',
  bgDim: '--bg-dim',
  bgBlur: '--bg-blur',
  bgBrightness: '--bg-brightness',
  bgSolidColor: '--bg-solid-color',
} as const;

export type ThemeCssVariable = (typeof CSS_VARIABLE_MAP)[keyof typeof CSS_VARIABLE_MAP];
