import {
  FocusSessionRecord,
  NoteItem,
  SavedTheme,
  TaskItem,
  UserSettings,
} from '@/shared/types/contracts';
import { AppError } from '@/shared/lib/errors';
import { LIMITS } from './defaults';
import { GuestSnapshot, LocalRepository } from './LocalRepository';
import { SupabaseRepository } from './SupabaseRepository';
import { clearGuestData } from './storageKeys';

export type MigrationMode = 'signup' | 'merge';

export interface MigrationResult {
  tasks: number;
  note: boolean;
  savedThemes: number;
  sessions: number;
}

/** The subset of SupabaseRepository the migration needs (keeps the routine easy to test). */
export interface MigrationCloud {
  getSettings(): Promise<UserSettings>;
  saveSettings(settings: Partial<UserSettings>): Promise<UserSettings>;
  getTasks(): Promise<TaskItem[]>;
  importTasks(tasks: TaskItem[]): Promise<void>;
  getNote(): Promise<NoteItem>;
  saveNote(content: string): Promise<NoteItem>;
  getSavedThemes(): Promise<SavedTheme[]>;
  importSavedThemes(themes: SavedTheme[]): Promise<void>;
  importFocusSessions(sessions: FocusSessionRecord[], knownTaskIds: Set<string>): Promise<void>;
}

export interface MigrationDeps {
  local?: { exportAll(): GuestSnapshot };
  cloud?: MigrationCloud;
  clear?: () => void;
}

function combineNotes(cloudContent: string, guestContent: string): string {
  if (cloudContent.trim().length === 0) return guestContent;
  // Re-running a partially failed merge must not append the same text twice.
  if (cloudContent.endsWith(guestContent)) return cloudContent;
  return `${cloudContent}\n\n${guestContent}`;
}

/**
 * Moves guest data to the signed-in account (FR-02).
 *  - 'signup': new account, guest settings are uploaded.
 *  - 'merge': existing account, cloud settings are kept and guest tasks/note/themes/sessions are appended.
 * All limits are checked before the first write. Guest data is removed only after every step succeeded,
 * and records already present in the cloud (same id) are skipped so the routine can be retried safely.
 */
export async function migrateGuestData(
  mode: MigrationMode,
  deps: MigrationDeps = {},
): Promise<MigrationResult> {
  const local = deps.local ?? new LocalRepository();
  const cloud = deps.cloud ?? new SupabaseRepository();
  const clear = deps.clear ?? clearGuestData;

  const snapshot = local.exportAll();

  // Step 0: read cloud state and validate limits before writing anything.
  const [cloudTasks, cloudThemes] = await Promise.all([cloud.getTasks(), cloud.getSavedThemes()]);

  const cloudTaskIds = new Set(cloudTasks.map((t) => t.id));
  const freshTasks = snapshot.tasks.filter((t) => !cloudTaskIds.has(t.id));
  if (cloudTasks.length + freshTasks.length > LIMITS.cloudTasksMax) {
    throw new AppError('TASK_LIMIT_EXCEEDED');
  }

  const cloudThemeIds = new Set(cloudThemes.map((t) => t.id));
  const freshThemes = snapshot.savedThemes.filter((t) => !cloudThemeIds.has(t.id));
  if (cloudThemes.length + freshThemes.length > LIMITS.cloudThemesMax) {
    throw new AppError('THEME_LIMIT_EXCEEDED');
  }

  let noteToWrite: string | null = null;
  if (snapshot.note) {
    const cloudNote = await cloud.getNote();
    const combined = combineNotes(cloudNote.content, snapshot.note.content);
    if (combined.length > LIMITS.noteMaxChars) throw new AppError('NOTE_TOO_LARGE');
    if (combined !== cloudNote.content) noteToWrite = combined;
  }

  // Step 1: user_settings (must exist before dependent data; guest settings only for a new account).
  if (mode === 'signup' && snapshot.settings) {
    await cloud.saveSettings({ ...snapshot.settings, isMigrated: true });
  } else {
    await cloud.getSettings();
    await cloud.saveSettings({ isMigrated: true });
  }

  // Step 2: tasks (must precede focus_sessions because of the foreign key).
  if (freshTasks.length > 0) await cloud.importTasks(freshTasks);

  // Step 3: notes.
  if (noteToWrite !== null) await cloud.saveNote(noteToWrite);

  // Step 4: saved themes.
  if (freshThemes.length > 0) await cloud.importSavedThemes(freshThemes);

  // Step 5: focus sessions.
  if (snapshot.sessions.length > 0) {
    const knownTaskIds = new Set([...cloudTaskIds, ...freshTasks.map((t) => t.id)]);
    await cloud.importFocusSessions(snapshot.sessions, knownTaskIds);
  }

  // Step 6: only now is it safe to drop the guest copy.
  clear();

  return {
    tasks: freshTasks.length,
    note: noteToWrite !== null,
    savedThemes: freshThemes.length,
    sessions: snapshot.sessions.length,
  };
}
