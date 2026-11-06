import { describe, it, expect } from 'vitest';
import { AppError, classifyAuthError, classifyPostgresError, toAppError } from '../errors';
import { ERROR_MESSAGES } from '../messages';

describe('classifyPostgresError (23514 check_violation)', () => {
  const cases: [string, string][] = [
    ['TASK_LIMIT_EXCEEDED: Maximum 100 tasks allowed per user.', 'TASK_LIMIT_EXCEEDED'],
    ['SAVED_THEME_LIMIT_EXCEEDED: Maximum 10 saved themes allowed per user.', 'THEME_LIMIT_EXCEEDED'],
    ['WALLPAPER_LIMIT_EXCEEDED: Maximum 3 custom wallpapers allowed per user.', 'WALLPAPER_LIMIT_EXCEEDED'],
    ['new row violates check constraint "user_settings_active_theme_check"', 'CONFIG_TOO_LARGE'],
    ['new row violates check constraint "focus_sessions_intent_title_check"', 'INTENT_TOO_LONG'],
    ['new row violates check constraint "chk_tasks_labels"', 'INVALID_LABELS'],
    ['new row violates check constraint "tasks_title_check"', 'TITLE_LENGTH_INVALID'],
    ['new row violates check constraint "notes_content_check"', 'NOTE_TOO_LARGE'],
    ['new row violates check constraint "user_settings_volume_rain_check"', 'VALIDATION_FAILED'],
  ];

  it.each(cases)('maps "%s" to %s', (message, expected) => {
    const error = classifyPostgresError({ code: '23514', message });
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(expected);
    expect(error.message).toBe(ERROR_MESSAGES[expected as keyof typeof ERROR_MESSAGES]);
  });

  it('maps foreign key, unique, permission and unknown codes', () => {
    expect(classifyPostgresError({ code: '23503' }).code).toBe('FOREIGN_KEY_INVALID');
    expect(classifyPostgresError({ code: '23505' }).code).toBe('ALREADY_EXISTS');
    expect(classifyPostgresError({ code: '42501' }).code).toBe('PERMISSION_DENIED');
    expect(classifyPostgresError({}).code).toBe('UNKNOWN_ERROR');
  });
});

describe('toAppError', () => {
  it('returns AppError instances unchanged', () => {
    const original = new AppError('NOT_FOUND');
    expect(toAppError(original)).toBe(original);
  });

  it('detects network failures', () => {
    expect(toAppError(new TypeError('Failed to fetch')).code).toBe('NETWORK_DISCONNECTED');
    expect(toAppError({ message: 'TypeError: Failed to fetch' }).code).toBe('NETWORK_DISCONNECTED');
    expect(toAppError({ name: 'AuthRetryableFetchError', message: 'x' }).code).toBe('NETWORK_DISCONNECTED');
  });

  it('detects expired sessions', () => {
    expect(toAppError({ code: 'PGRST301', message: 'x' }).code).toBe('AUTH_SESSION_EXPIRED');
    expect(toAppError({ message: 'JWT expired' }).code).toBe('AUTH_SESSION_EXPIRED');
  });

  it('detects rate limiting', () => {
    expect(toAppError({ status: 429, message: 'x' }).code).toBe('RATE_LIMITED');
  });

  it('delegates SQLSTATE codes and falls back to UNKNOWN_ERROR', () => {
    expect(toAppError({ code: '23505', message: 'dup' }).code).toBe('ALREADY_EXISTS');
    expect(toAppError('plain string').code).toBe('UNKNOWN_ERROR');
    expect(toAppError(42).code).toBe('UNKNOWN_ERROR');
    expect(toAppError({ code: 7, details: 'd', statusCode: '400' }).code).toBe('UNKNOWN_ERROR');
  });
});

describe('classifyAuthError', () => {
  it('maps credential errors to the message required by AC-01.2', () => {
    expect(classifyAuthError({ code: 'invalid_credentials', message: 'x' }).message).toBe(
      'Invalid login credentials',
    );
    expect(classifyAuthError({ message: 'Invalid login credentials' }).code).toBe(
      'AUTH_INVALID_CREDENTIALS',
    );
  });

  it('maps existing user, weak password and rate limits', () => {
    expect(classifyAuthError({ code: 'user_already_exists' }).code).toBe('AUTH_USER_EXISTS');
    expect(classifyAuthError({ message: 'User already registered' }).code).toBe('AUTH_USER_EXISTS');
    expect(classifyAuthError({ code: 'weak_password' }).code).toBe('AUTH_WEAK_PASSWORD');
    expect(classifyAuthError({ code: 'over_email_send_rate_limit' }).code).toBe('RATE_LIMITED');
    expect(classifyAuthError({ status: 429 }).code).toBe('RATE_LIMITED');
  });

  it('handles network failures, AppError passthrough and unknown errors', () => {
    expect(classifyAuthError(new TypeError('Failed to fetch')).code).toBe('NETWORK_DISCONNECTED');
    const original = new AppError('AUTH_CONFIRMATION_REQUIRED');
    expect(classifyAuthError(original)).toBe(original);
    expect(classifyAuthError({ message: 'boom' }).code).toBe('UNKNOWN_ERROR');
  });
});
