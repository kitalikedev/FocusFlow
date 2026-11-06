import { ERROR_MESSAGES, type ErrorCode } from './messages';

/** Minimal shape shared by PostgREST, GoTrue and Storage errors. */
export interface ErrorLike {
  code?: string;
  message?: string;
  details?: string;
  status?: number;
  statusCode?: string | number;
  name?: string;
}

export interface AppErrorOptions {
  status?: number;
  originalError?: unknown;
}

/** Normalised error surfaced to the UI by every repository and store (API_DOCS section 9). */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status?: number;
  readonly originalError?: unknown;

  constructor(code: ErrorCode, message?: string, options: AppErrorOptions = {}) {
    super(message ?? ERROR_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.status = options.status;
    this.originalError = options.originalError;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asErrorLike(error: unknown): ErrorLike {
  if (!isRecord(error)) {
    return typeof error === 'string' ? { message: error } : {};
  }
  const candidate: ErrorLike = {};
  if (typeof error.code === 'string') candidate.code = error.code;
  if (typeof error.message === 'string') candidate.message = error.message;
  if (typeof error.details === 'string') candidate.details = error.details;
  if (typeof error.status === 'number') candidate.status = error.status;
  if (typeof error.statusCode === 'string' || typeof error.statusCode === 'number') {
    candidate.statusCode = error.statusCode;
  }
  if (typeof error.name === 'string') candidate.name = error.name;
  return candidate;
}

function isNetworkFailure(error: unknown, like: ErrorLike): boolean {
  if (error instanceof TypeError) return true;
  const message = like.message ?? '';
  return (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('Load failed') ||
    like.name === 'AuthRetryableFetchError'
  );
}

/** Maps PostgreSQL SQLSTATE errors (including quota triggers sharing 23514) to AppError. */
export function classifyPostgresError(error: ErrorLike): AppError {
  const code = error.code ?? '';
  const message = error.message ?? '';
  const options: AppErrorOptions = { originalError: error, status: error.status };

  if (code === '23514') {
    if (message.includes('TASK_LIMIT_EXCEEDED') || message.includes('tasks allowed per user')) {
      return new AppError('TASK_LIMIT_EXCEEDED', undefined, options);
    }
    if (
      message.includes('SAVED_THEME_LIMIT_EXCEEDED') ||
      message.includes('saved themes allowed per user')
    ) {
      return new AppError('THEME_LIMIT_EXCEEDED', undefined, options);
    }
    if (
      message.includes('WALLPAPER_LIMIT_EXCEEDED') ||
      message.includes('custom wallpapers allowed per user')
    ) {
      return new AppError('WALLPAPER_LIMIT_EXCEEDED', undefined, options);
    }
    if (
      message.includes('active_theme') ||
      message.includes('config') ||
      message.includes('octet_length')
    ) {
      return new AppError('CONFIG_TOO_LARGE', undefined, options);
    }
    if (message.includes('intent_title')) {
      return new AppError('INTENT_TOO_LONG', undefined, options);
    }
    if (message.includes('labels') || message.includes('validate_task_labels')) {
      return new AppError('INVALID_LABELS', undefined, options);
    }
    if (message.includes('title')) {
      return new AppError('TITLE_LENGTH_INVALID', undefined, options);
    }
    if (message.includes('content')) {
      return new AppError('NOTE_TOO_LARGE', undefined, options);
    }
    return new AppError('VALIDATION_FAILED', undefined, options);
  }

  if (code === '23503') return new AppError('FOREIGN_KEY_INVALID', undefined, options);
  if (code === '23505') return new AppError('ALREADY_EXISTS', undefined, options);
  if (code === '42501') return new AppError('PERMISSION_DENIED', undefined, options);

  return new AppError('UNKNOWN_ERROR', undefined, options);
}

/** Converts any thrown or returned error from the data layer into an AppError. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const like = asErrorLike(error);
  const options: AppErrorOptions = { originalError: error, status: like.status };

  if (isNetworkFailure(error, like)) return new AppError('NETWORK_DISCONNECTED', undefined, options);
  if (like.code === 'PGRST301' || (like.message ?? '').includes('JWT expired')) {
    return new AppError('AUTH_SESSION_EXPIRED', undefined, options);
  }
  if (like.status === 429) return new AppError('RATE_LIMITED', undefined, options);
  if (like.code) return classifyPostgresError(like);
  return new AppError('UNKNOWN_ERROR', undefined, options);
}

/** Converts GoTrue (Supabase Auth) errors to AppError with the messages required by FR-01. */
export function classifyAuthError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const like = asErrorLike(error);
  const options: AppErrorOptions = { originalError: error, status: like.status };
  const message = like.message ?? '';

  if (isNetworkFailure(error, like)) return new AppError('NETWORK_DISCONNECTED', undefined, options);
  if (like.code === 'invalid_credentials' || message.includes('Invalid login credentials')) {
    return new AppError('AUTH_INVALID_CREDENTIALS', undefined, options);
  }
  if (like.code === 'user_already_exists' || message.includes('already registered')) {
    return new AppError('AUTH_USER_EXISTS', undefined, options);
  }
  if (like.code === 'weak_password') return new AppError('AUTH_WEAK_PASSWORD', undefined, options);
  if (
    like.status === 429 ||
    like.code === 'over_email_send_rate_limit' ||
    like.code === 'over_request_rate_limit'
  ) {
    return new AppError('RATE_LIMITED', undefined, options);
  }
  return new AppError('UNKNOWN_ERROR', undefined, options);
}
