import { describe, it, expect } from 'vitest';
import { formatClock } from '../lib/formatClock';
import { parseWholeNumber } from '../lib/validation';

describe('formatClock', () => {
  it('pads minutes and seconds and allows more than 59 minutes', () => {
    expect(formatClock(1500)).toBe('25:00');
    expect(formatClock(5400)).toBe('90:00');
    expect(formatClock(10800)).toBe('180:00');
    expect(formatClock(9)).toBe('00:09');
    expect(formatClock(59.9)).toBe('00:59');
    expect(formatClock(-4)).toBe('00:00');
  });
});

describe('parseWholeNumber', () => {
  it('accepts whole numbers inside the range', () => {
    expect(parseWholeNumber('45', 1, 180)).toBe(45);
    expect(parseWholeNumber(' 1 ', 1, 180)).toBe(1);
    expect(parseWholeNumber('180', 1, 180)).toBe(180);
  });

  it.each(['0', '-10', '181', '', '4.5', '1e2', 'abc'])('rejects "%s"', (value) => {
    expect(parseWholeNumber(value, 1, 180)).toBeNull();
  });
});
