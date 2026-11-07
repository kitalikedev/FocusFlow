import { describe, it, expect } from 'vitest';
import { contrastRatio, parseColor, relativeLuminance, toHex, toRgba, withAlpha } from '../color';

describe('color helpers', () => {
  it('parses hex (3, 6, 8 digits), rgb and rgba', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('#09090b')).toEqual({ r: 9, g: 9, b: 11, a: 1 });
    expect(parseColor('#00000080')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    expect(parseColor(' rgba(300, 0, 0, 2) ')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('returns null for unsupported input', () => {
    expect(parseColor('red')).toBeNull();
    expect(parseColor('#12')).toBeNull();
    expect(parseColor('hsl(0, 0%, 0%)')).toBeNull();
  });

  it('formats hex and rgba', () => {
    expect(toHex({ r: 255, g: 0, b: 16, a: 1 })).toBe('#ff0010');
    expect(toRgba({ r: 1, g: 2, b: 3, a: 1 }, 0.456)).toBe('rgba(1, 2, 3, 0.46)');
  });

  it('withAlpha replaces the alpha and leaves unknown colors alone', () => {
    expect(withAlpha('rgba(0, 0, 0, 0.35)', 0.8)).toBe('rgba(0, 0, 0, 0.8)');
    expect(withAlpha('#18181b', 0.5)).toBe('rgba(24, 24, 27, 0.5)');
    expect(withAlpha('transparent', 0.5)).toBe('transparent');
  });

  it('computes WCAG luminance and contrast', () => {
    const white = relativeLuminance({ r: 255, g: 255, b: 255, a: 1 });
    const black = relativeLuminance({ r: 0, g: 0, b: 0, a: 1 });
    expect(white).toBeCloseTo(1);
    expect(black).toBe(0);
    expect(contrastRatio(white, black)).toBeCloseTo(21);
    expect(contrastRatio(black, white)).toBeCloseTo(21);
  });
});
