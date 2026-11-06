import { describe, it, expect } from 'vitest';
import { AppError } from '@/shared/lib/errors';
import {
  validateDueDate,
  validateFocusSession,
  validateLabels,
  validateNoteContent,
  validateTaskTitle,
  validateTaskUpdates,
  validateThemeConfigSize,
  validateThemeName,
  validateWallpaperFile,
} from '../validators';

function codeOf(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (error) {
    return error instanceof AppError ? error.code : 'other';
  }
  return undefined;
}

describe('validators', () => {
  it('validates task titles (1-120 chars after trim)', () => {
    expect(validateTaskTitle('  Write docs  ')).toBe('Write docs');
    expect(codeOf(() => validateTaskTitle('   '))).toBe('TITLE_LENGTH_INVALID');
    expect(codeOf(() => validateTaskTitle('x'.repeat(121)))).toBe('TITLE_LENGTH_INVALID');
  });

  it('validates labels (max 5, 1-24 chars)', () => {
    expect(validateLabels([' a ', 'b'])).toEqual(['a', 'b']);
    expect(codeOf(() => validateLabels(['1', '2', '3', '4', '5', '6']))).toBe('INVALID_LABELS');
    expect(codeOf(() => validateLabels(['']))).toBe('INVALID_LABELS');
    expect(codeOf(() => validateLabels(['x'.repeat(25)]))).toBe('INVALID_LABELS');
  });

  it('validates due dates', () => {
    expect(validateDueDate(undefined)).toBeNull();
    expect(validateDueDate(null)).toBeNull();
    expect(validateDueDate('2026-11-07T17:00:00Z')).toBe('2026-11-07T17:00:00.000Z');
    expect(codeOf(() => validateDueDate('not a date'))).toBe('INVALID_DUE_DATE');
  });

  it('validates only the fields present in a task update', () => {
    expect(validateTaskUpdates({ isCompleted: true })).toEqual({ isCompleted: true });
    expect(
      validateTaskUpdates({ title: ' x ', labels: [' y '], dueDate: null, priority: 'low' }),
    ).toEqual({ title: 'x', labels: ['y'], dueDate: null, priority: 'low' });
    expect(codeOf(() => validateTaskUpdates({ title: '' }))).toBe('TITLE_LENGTH_INVALID');
  });

  it('validates notes, theme names and theme config size', () => {
    expect(codeOf(() => validateNoteContent('a'.repeat(50001)))).toBe('NOTE_TOO_LARGE');
    expect(codeOf(() => validateNoteContent('a'.repeat(50000)))).toBeUndefined();
    expect(validateThemeName(' Night ')).toBe('Night');
    expect(codeOf(() => validateThemeName(''))).toBe('NAME_LENGTH_INVALID');
    expect(codeOf(() => validateThemeName('x'.repeat(51)))).toBe('NAME_LENGTH_INVALID');
    expect(codeOf(() => validateThemeConfigSize({ a: 'x'.repeat(9000) }))).toBe('CONFIG_TOO_LARGE');
    expect(codeOf(() => validateThemeConfigSize({ a: 1 }))).toBeUndefined();
  });

  it('validates focus sessions', () => {
    expect(validateFocusSession(25, '  Study  ')).toEqual({ durationMinutes: 25, intentTitle: 'Study' });
    expect(validateFocusSession(25, '   ')).toEqual({ durationMinutes: 25, intentTitle: null });
    expect(validateFocusSession(25)).toEqual({ durationMinutes: 25, intentTitle: null });
    expect(codeOf(() => validateFocusSession(0))).toBe('VALIDATION_FAILED');
    expect(codeOf(() => validateFocusSession(1.5))).toBe('VALIDATION_FAILED');
    expect(codeOf(() => validateFocusSession(1441))).toBe('VALIDATION_FAILED');
    expect(codeOf(() => validateFocusSession(25, 'x'.repeat(81)))).toBe('INTENT_TOO_LONG');
  });

  it('validates wallpaper files', () => {
    const png = new File(['x'], 'a.png', { type: 'image/png' });
    expect(validateWallpaperFile(png, 0.5)).toBe('png');
    expect(codeOf(() => validateWallpaperFile(new File(['x'], 'a.svg', { type: 'image/svg+xml' }), 0.5))).toBe(
      'INVALID_FILE_TYPE',
    );
    const big = new File(['x'], 'big.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: 5 * 1024 * 1024 + 1 });
    expect(codeOf(() => validateWallpaperFile(big, 0.5))).toBe('FILE_TOO_LARGE');
    expect(codeOf(() => validateWallpaperFile(png, 2))).toBe('VALIDATION_FAILED');
    expect(codeOf(() => validateWallpaperFile(png, Number.NaN))).toBe('VALIDATION_FAILED');
  });
});
