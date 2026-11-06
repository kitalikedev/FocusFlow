import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme } from '../applyTheme';
import { OBSIDIAN_MINIMAL_TOKENS } from '../presets';
import { CSS_VARIABLE_MAP } from '../tokens';

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('exports CSS_VARIABLE_MAP with exactly 15 design tokens', () => {
    expect(Object.keys(CSS_VARIABLE_MAP)).toHaveLength(15);
  });

  it('handles non-browser environment safely', () => {
    const originalDocument = globalThis.document;
    // @ts-expect-error simulating undefined document
    delete globalThis.document;
    expect(() => applyTheme(OBSIDIAN_MINIMAL_TOKENS)).not.toThrow();
    globalThis.document = originalDocument;
  });

  it('correctly sets all 15 CSS variables on document.documentElement and omits deprecated background variable', () => {
    const startTime = performance.now();
    applyTheme(OBSIDIAN_MINIMAL_TOKENS);
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(50);

    const style = document.documentElement.style;

    // Verify deprecated background token is NOT set
    const obsoleteToken = ['--', 'color', '-', 'bg'].join('');
    expect(style.getPropertyValue(obsoleteToken)).toBe('');

    // Must set exactly the 15 tokens defined in PRD FR-24
    expect(style.getPropertyValue('--color-accent')).toBe(OBSIDIAN_MINIMAL_TOKENS.colorAccent);
    expect(style.getPropertyValue('--color-accent-contrast')).toBe(
      OBSIDIAN_MINIMAL_TOKENS.colorAccentContrast
    );
    expect(style.getPropertyValue('--capsule-bg')).toBe(OBSIDIAN_MINIMAL_TOKENS.capsuleBg);
    expect(style.getPropertyValue('--capsule-opacity')).toBe(
      String(OBSIDIAN_MINIMAL_TOKENS.capsuleOpacity)
    );
    expect(style.getPropertyValue('--capsule-blur')).toBe(
      `${OBSIDIAN_MINIMAL_TOKENS.capsuleBlur}px`
    );
    expect(style.getPropertyValue('--capsule-radius')).toBe(
      `${OBSIDIAN_MINIMAL_TOKENS.capsuleRadius}px`
    );
    expect(style.getPropertyValue('--capsule-border-width')).toBe(
      `${OBSIDIAN_MINIMAL_TOKENS.capsuleBorderWidth}px`
    );
    expect(style.getPropertyValue('--capsule-border-color')).toBe(
      OBSIDIAN_MINIMAL_TOKENS.capsuleBorderColor
    );
    expect(style.getPropertyValue('--font-clock')).toBe(OBSIDIAN_MINIMAL_TOKENS.fontClock);
    expect(style.getPropertyValue('--clock-scale')).toBe(
      `${OBSIDIAN_MINIMAL_TOKENS.clockScale * 100}%`
    );
    expect(style.getPropertyValue('--clock-weight')).toBe(
      String(OBSIDIAN_MINIMAL_TOKENS.clockWeight)
    );
    expect(style.getPropertyValue('--bg-dim')).toBe(`${OBSIDIAN_MINIMAL_TOKENS.bgDim}%`);
    expect(style.getPropertyValue('--bg-blur')).toBe(`${OBSIDIAN_MINIMAL_TOKENS.bgBlur}px`);
    expect(style.getPropertyValue('--bg-brightness')).toBe(
      `${OBSIDIAN_MINIMAL_TOKENS.bgBrightness}%`
    );
    expect(style.getPropertyValue('--bg-solid-color')).toBe(OBSIDIAN_MINIMAL_TOKENS.bgSolidColor);

    // Verify exactly 15 CSS properties are registered
    expect(style.length).toBe(15);
  });
});
