import { describe, it, expect } from 'vitest';
import { validateCredentials } from '../validation';

describe('validateCredentials', () => {
  it('accepts a valid email and a 6 character password', () => {
    expect(validateCredentials('user@example.com', '123456')).toBeNull();
    expect(validateCredentials('  user@example.com  ', '123456')).toBeNull();
  });

  it('rejects invalid emails', () => {
    for (const email of ['', 'plain', 'a@b', '@b.co', 'a b@c.co']) {
      expect(validateCredentials(email, '123456')).toBe('Please enter a valid email address.');
    }
  });

  it('rejects passwords shorter than 6 characters', () => {
    expect(validateCredentials('user@example.com', '12345')).toBe('Password must be at least 6 characters.');
  });
});
