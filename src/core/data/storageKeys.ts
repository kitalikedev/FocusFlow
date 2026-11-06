/** localStorage keys used by Guest Mode (PRD AC-02.1, ARCHITECTURE 5.2). */
export const GUEST_STORAGE_KEYS = {
  tasks: 'focusflow_tasks',
  notes: 'focusflow_notes',
  settings: 'focusflow_settings',
  sessions: 'focusflow_sessions',
  savedThemes: 'focusflow_saved_themes',
} as const;

function readRaw(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function isNonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

/** True when guest settings were saved (the key only exists after the user changed a setting). */
export function hasGuestSettings(): boolean {
  const value = readRaw(GUEST_STORAGE_KEYS.settings);
  return typeof value === 'object' && value !== null;
}

/**
 * True when the browser holds guest content worth migrating or merging:
 * tasks, a non-empty note, focus sessions or saved themes.
 */
export function hasGuestData(): boolean {
  const note = readRaw(GUEST_STORAGE_KEYS.notes);
  const hasNote =
    typeof note === 'object' &&
    note !== null &&
    typeof (note as { content?: unknown }).content === 'string' &&
    (note as { content: string }).content.trim().length > 0;

  return (
    isNonEmptyArray(readRaw(GUEST_STORAGE_KEYS.tasks)) ||
    hasNote ||
    isNonEmptyArray(readRaw(GUEST_STORAGE_KEYS.sessions)) ||
    isNonEmptyArray(readRaw(GUEST_STORAGE_KEYS.savedThemes))
  );
}

/** Removes every guest key from localStorage. Guest wallpaper (IndexedDB) is intentionally kept. */
export function clearGuestData(): void {
  try {
    for (const key of Object.values(GUEST_STORAGE_KEYS)) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Storage may be unavailable (private mode); nothing to clean.
  }
}
