import { AUTH_MESSAGES } from '@/shared/lib/messages';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

/** Returns an error message for invalid credentials, or null when the form can be submitted (AC-01.1). */
export function validateCredentials(email: string, password: string): string | null {
  if (!EMAIL_PATTERN.test(email.trim())) return AUTH_MESSAGES.invalidEmail;
  if (password.length < MIN_PASSWORD_LENGTH) return AUTH_MESSAGES.passwordTooShort;
  return null;
}
