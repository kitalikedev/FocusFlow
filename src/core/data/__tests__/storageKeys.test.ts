import { describe, it, expect, beforeEach } from 'vitest';
import { clearGuestData, GUEST_STORAGE_KEYS, hasGuestData, hasGuestSettings } from '../storageKeys';

describe('guest storage helpers', () => {
  beforeEach(() => window.localStorage.clear());

  it('reports no data on a clean browser', () => {
    expect(hasGuestData()).toBe(false);
    expect(hasGuestSettings()).toBe(false);
  });

  it('detects tasks, notes, sessions and themes as guest data', () => {
    window.localStorage.setItem(GUEST_STORAGE_KEYS.tasks, JSON.stringify([{ id: 'a' }]));
    expect(hasGuestData()).toBe(true);
    window.localStorage.clear();

    window.localStorage.setItem(GUEST_STORAGE_KEYS.notes, JSON.stringify({ content: 'hello' }));
    expect(hasGuestData()).toBe(true);
    window.localStorage.clear();

    window.localStorage.setItem(GUEST_STORAGE_KEYS.sessions, JSON.stringify([{ id: 's' }]));
    expect(hasGuestData()).toBe(true);
    window.localStorage.clear();

    window.localStorage.setItem(GUEST_STORAGE_KEYS.savedThemes, JSON.stringify([{ id: 't' }]));
    expect(hasGuestData()).toBe(true);
  });

  it('ignores empty containers, blank notes and corrupted JSON', () => {
    window.localStorage.setItem(GUEST_STORAGE_KEYS.tasks, '[]');
    window.localStorage.setItem(GUEST_STORAGE_KEYS.notes, JSON.stringify({ content: '   ' }));
    window.localStorage.setItem(GUEST_STORAGE_KEYS.sessions, '{not json');
    expect(hasGuestData()).toBe(false);
    window.localStorage.setItem(GUEST_STORAGE_KEYS.notes, JSON.stringify({ content: 5 }));
    expect(hasGuestData()).toBe(false);
  });

  it('detects guest settings separately', () => {
    window.localStorage.setItem(GUEST_STORAGE_KEYS.settings, JSON.stringify({ focusDuration: 1 }));
    expect(hasGuestSettings()).toBe(true);
    expect(hasGuestData()).toBe(false);
  });

  it('clearGuestData removes every guest key', () => {
    for (const key of Object.values(GUEST_STORAGE_KEYS)) window.localStorage.setItem(key, '[1]');
    clearGuestData();
    for (const key of Object.values(GUEST_STORAGE_KEYS)) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
  });
});
