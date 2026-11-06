import type { SupabaseClient } from '@supabase/supabase-js';
import {
  DataRepository,
  FocusSessionRecord,
  NoteItem,
  SavedTheme,
  TaskFilterParams,
  TaskItem,
  TaskPriority,
  ThemeLimitError,
  UserSettings,
  WallpaperMetadata,
} from '@/shared/types/contracts';
import { AppError, toAppError } from '@/shared/lib/errors';
import { getSupabaseClient } from '@/shared/lib/supabase';
import { createDefaultSettings, parseThemeConfig } from './defaults';
import {
  FocusSessionRow,
  NoteRow,
  rowToNote,
  rowToSavedTheme,
  rowToSession,
  rowToSettings,
  rowToTask,
  rowToWallpaper,
  SavedThemeRow,
  savedThemeToRow,
  sessionToRow,
  settingsToRow,
  TaskRow,
  taskToRow,
  taskUpdatesToRow,
  UserSettingsRow,
  WallpaperRow,
} from './mappers';
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
} from './validators';

const WALLPAPER_BUCKET = 'user-wallpapers';
const PRIORITY_RANK: Record<TaskPriority, number> = { none: 0, low: 1, medium: 2, high: 3 };
const SESSIONS_PAGE_SIZE = 500;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const IMPORT_CHUNK_SIZE = 100;

interface QueryResult<T> {
  data: T | null;
  error: unknown;
}

function unwrap<T>(result: QueryResult<T>): T | null {
  if (result.error) throw toAppError(result.error);
  return result.data;
}

function unwrapRequired<T>(result: QueryResult<T>): T {
  const data = unwrap(result);
  if (data === null) throw new AppError('NOT_FOUND');
  return data;
}

/** Escapes LIKE wildcards so user search text is matched literally. */
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

/** Authenticated-user repository backed by Supabase PostgREST + Storage (RLS enforced server side). */
export class SupabaseRepository implements DataRepository {
  private get client(): SupabaseClient {
    return getSupabaseClient();
  }

  private async requireUserId(): Promise<string> {
    const { data, error } = await this.client.auth.getSession();
    const userId = data.session?.user.id;
    if (error || !userId) throw new AppError('AUTH_SESSION_EXPIRED');
    return userId;
  }

  // -------------------------------------------------------------------- tasks

  async getTasks(filter?: TaskFilterParams): Promise<TaskItem[]> {
    try {
      let query = this.client.from('tasks').select('*');

      if (filter?.isCompleted !== undefined) query = query.eq('is_completed', filter.isCompleted);
      if (filter?.priority) query = query.eq('priority', filter.priority);
      if (filter?.label) query = query.contains('labels', [filter.label]);
      if (filter?.search) query = query.ilike('title', `%${escapeLike(filter.search)}%`);

      const ascending = filter?.sortOrder === 'asc';
      query =
        filter?.sortBy === 'dueDate'
          ? query.order('due_date', { ascending, nullsFirst: false })
          : query.order('created_at', { ascending: filter?.sortBy === 'createdAt' ? ascending : false });

      const rows = unwrap(await (query as unknown as PromiseLike<QueryResult<TaskRow[]>>)) ?? [];
      const tasks = rows.map(rowToTask);

      if (filter?.sortBy === 'priority') {
        const direction = ascending ? 1 : -1;
        tasks.sort((a, b) => direction * (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]));
      }
      return tasks;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async createTask(
    title: string,
    options?: Partial<Pick<TaskItem, 'priority' | 'dueDate' | 'labels'>>,
  ): Promise<TaskItem> {
    const cleanTitle = validateTaskTitle(title);
    const labels = validateLabels(options?.labels ?? []);
    const dueDate = validateDueDate(options?.dueDate);

    try {
      const userId = await this.requireUserId();
      const result = await this.client
        .from('tasks')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          title: cleanTitle,
          priority: options?.priority ?? 'none',
          due_date: dueDate,
          labels,
        })
        .select()
        .single();
      return rowToTask(unwrapRequired<TaskRow>(result));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async updateTask(
    id: string,
    updates: Partial<Pick<TaskItem, 'title' | 'isCompleted' | 'priority' | 'dueDate' | 'labels'>>,
  ): Promise<TaskItem> {
    const cleaned = validateTaskUpdates(updates);
    try {
      const result = await this.client
        .from('tasks')
        .update(taskUpdatesToRow(cleaned, new Date().toISOString()))
        .eq('id', id)
        .select()
        .maybeSingle();
      // Last-Write-Wins: when the server rejects an older write it returns its current row, which we trust.
      return rowToTask(unwrapRequired<TaskRow>(result));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const result = await this.client.from('tasks').delete().eq('id', id);
      unwrap(result as QueryResult<unknown>);
    } catch (error) {
      throw toAppError(error);
    }
  }

  // -------------------------------------------------------------------- notes

  async getNote(): Promise<NoteItem> {
    try {
      const userId = await this.requireUserId();
      const result = await this.client.from('notes').select('*').eq('user_id', userId).maybeSingle();
      const row = unwrap<NoteRow>(result);
      return row
        ? rowToNote(row)
        : { id: crypto.randomUUID(), userId, content: '', updatedAt: new Date().toISOString() };
    } catch (error) {
      throw toAppError(error);
    }
  }

  async saveNote(content: string): Promise<NoteItem> {
    validateNoteContent(content);
    try {
      const userId = await this.requireUserId();
      // `id` is omitted on purpose: with onConflict 'user_id' the existing primary key must not change.
      const result = await this.client
        .from('notes')
        .upsert(
          { user_id: userId, content, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )
        .select()
        .single();
      return rowToNote(unwrapRequired<NoteRow>(result));
    } catch (error) {
      throw toAppError(error);
    }
  }

  // ----------------------------------------------------------------- settings

  async getSettings(): Promise<UserSettings> {
    try {
      const userId = await this.requireUserId();
      const read = () =>
        this.client.from('user_settings').select('*').eq('user_id', userId).maybeSingle();

      const existing = unwrap<UserSettingsRow>(await read());
      if (existing) return rowToSettings(existing);

      // First login: create defaults without overwriting a row a concurrent migration may have written.
      const defaults = settingsToRow(userId, createDefaultSettings(), new Date().toISOString());
      const created = await this.client
        .from('user_settings')
        .upsert(defaults, { onConflict: 'user_id', ignoreDuplicates: true });
      unwrap(created as QueryResult<unknown>);
      return rowToSettings(unwrapRequired<UserSettingsRow>(await read()));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const userId = await this.requireUserId();
      const result = await this.client
        .from('user_settings')
        .upsert(settingsToRow(userId, settings, new Date().toISOString()), { onConflict: 'user_id' })
        .select()
        .single();
      return rowToSettings(unwrapRequired<UserSettingsRow>(result));
    } catch (error) {
      throw toAppError(error);
    }
  }

  // ----------------------------------------------------------------- sessions

  async recordFocusSession(
    durationMinutes: number,
    intentTitle?: string | null,
    taskId?: string | null,
  ): Promise<FocusSessionRecord> {
    const valid = validateFocusSession(durationMinutes, intentTitle);
    try {
      const userId = await this.requireUserId();
      const insert = (linkedTaskId: string | null) =>
        this.client
          .from('focus_sessions')
          .insert({
            id: crypto.randomUUID(),
            user_id: userId,
            duration_minutes: valid.durationMinutes,
            intent_title: valid.intentTitle,
            task_id: linkedTaskId,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

      let result = await insert(taskId ?? null);
      if (taskId && result.error && toAppError(result.error).code === 'FOREIGN_KEY_INVALID') {
        // The linked task no longer exists: keep the session and the intent title, drop the link.
        result = await insert(null);
      }
      return rowToSession(unwrapRequired<FocusSessionRow>(result));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async getFocusSessions(): Promise<FocusSessionRecord[]> {
    try {
      const since = new Date(Date.now() - NINETY_DAYS_MS).toISOString();
      const sessions: FocusSessionRecord[] = [];
      let from = 0;

      for (;;) {
        const page = unwrap(
          await (this.client
            .from('focus_sessions')
            .select('id, duration_minutes, intent_title, task_id, completed_at')
            .gte('completed_at', since)
            .order('completed_at', { ascending: false })
            .range(from, from + SESSIONS_PAGE_SIZE - 1) as unknown as PromiseLike<
            QueryResult<FocusSessionRow[]>
          >),
        );
        const rows = page ?? [];
        sessions.push(...rows.map(rowToSession));
        if (rows.length < SESSIONS_PAGE_SIZE) break;
        from += SESSIONS_PAGE_SIZE;
      }
      return sessions;
    } catch (error) {
      throw toAppError(error);
    }
  }

  // --------------------------------------------------------------- wallpapers

  private publicUrl(storagePath: string): string {
    return this.client.storage.from(WALLPAPER_BUCKET).getPublicUrl(storagePath).data.publicUrl;
  }

  async getWallpapers(): Promise<WallpaperMetadata[]> {
    try {
      const rows =
        unwrap(
          await (this.client
            .from('user_wallpapers')
            .select('*')
            .order('created_at', { ascending: false }) as unknown as PromiseLike<
            QueryResult<WallpaperRow[]>
          >),
        ) ?? [];
      return rows.map((row) => rowToWallpaper(row, this.publicUrl(row.storage_path)));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async uploadCustomWallpaper(file: File, luminance: number): Promise<WallpaperMetadata> {
    const extension = validateWallpaperFile(file, luminance);
    try {
      const userId = await this.requireUserId();
      const wallpaperId = crypto.randomUUID();
      const storagePath = `${userId}/${wallpaperId}.${extension}`;
      const bucket = this.client.storage.from(WALLPAPER_BUCKET);

      const upload = await bucket.upload(storagePath, file, { cacheControl: '31536000', upsert: false });
      if (upload.error) {
        // Storage policy rejects the 4th file (quota) with a row-level-security message.
        if (/row-level security|policy/i.test(upload.error.message)) {
          throw new AppError('WALLPAPER_LIMIT_EXCEEDED', undefined, { originalError: upload.error });
        }
        throw toAppError(upload.error);
      }

      const insert = await this.client
        .from('user_wallpapers')
        .insert({
          id: wallpaperId,
          user_id: userId,
          storage_path: storagePath,
          file_size: file.size,
          luminance: Number(luminance.toFixed(3)),
        })
        .select()
        .single();

      if (insert.error) {
        // Compensating transaction: never leave an orphan object consuming storage quota.
        await bucket.remove([storagePath]);
        throw toAppError(insert.error);
      }
      return rowToWallpaper(insert.data as WallpaperRow, this.publicUrl(storagePath));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async deleteCustomWallpaper(id: string): Promise<void> {
    try {
      const result = await this.client
        .from('user_wallpapers')
        .delete()
        .eq('id', id)
        .select('storage_path');
      const rows = unwrap(result as QueryResult<{ storage_path: string }[]>) ?? [];
      if (rows.length === 0) throw new AppError('NOT_FOUND');

      const removal = await this.client
        .storage.from(WALLPAPER_BUCKET)
        .remove(rows.map((row) => row.storage_path));
      if (removal.error) {
        console.warn('Wallpaper file could not be removed from storage.');
      }
    } catch (error) {
      throw toAppError(error);
    }
  }

  // ------------------------------------------------------------------- themes

  async getSavedThemes(): Promise<SavedTheme[]> {
    try {
      const rows =
        unwrap(
          await (this.client
            .from('saved_themes')
            .select('*')
            .order('created_at', { ascending: true }) as unknown as PromiseLike<
            QueryResult<SavedThemeRow[]>
          >),
        ) ?? [];
      return rows.map(rowToSavedTheme);
    } catch (error) {
      throw toAppError(error);
    }
  }

  async saveTheme(theme: Omit<SavedTheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedTheme> {
    const name = validateThemeName(theme.name);
    const config = parseThemeConfig(theme.config);
    validateThemeConfigSize(config);

    try {
      const userId = await this.requireUserId();
      const result = await this.client
        .from('saved_themes')
        .insert({ id: crypto.randomUUID(), user_id: userId, name, config })
        .select()
        .single();
      return rowToSavedTheme(unwrapRequired<SavedThemeRow>(result));
    } catch (error) {
      const appError = toAppError(error);
      if (appError.code === 'THEME_LIMIT_EXCEEDED') {
        throw new ThemeLimitError(appError.message);
      }
      throw appError;
    }
  }

  async renameTheme(id: string, name: string): Promise<SavedTheme> {
    const cleanName = validateThemeName(name);
    try {
      const result = await this.client
        .from('saved_themes')
        .update({ name: cleanName, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();
      return rowToSavedTheme(unwrapRequired<SavedThemeRow>(result));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async deleteTheme(id: string): Promise<void> {
    try {
      const result = await this.client.from('saved_themes').delete().eq('id', id);
      unwrap(result as QueryResult<unknown>);
    } catch (error) {
      throw toAppError(error);
    }
  }

  // ------------------------------------------------------- migration helpers
  // These keep the ids generated at guest time, so a re-run never creates duplicates.

  async importTasks(tasks: TaskItem[]): Promise<void> {
    const userId = await this.requireUserId();
    for (const batch of chunk(tasks, IMPORT_CHUNK_SIZE)) {
      const result = await this.client.from('tasks').insert(batch.map((t) => taskToRow(t, userId)));
      if (result.error) throw toAppError(result.error);
    }
  }

  async importSavedThemes(themes: SavedTheme[]): Promise<void> {
    const userId = await this.requireUserId();
    for (const batch of chunk(themes, IMPORT_CHUNK_SIZE)) {
      const result = await this.client
        .from('saved_themes')
        .insert(batch.map((t) => savedThemeToRow(t, userId)));
      if (result.error) throw toAppError(result.error);
    }
  }

  /**
   * Imports guest focus sessions. Sessions whose task is not in `knownTaskIds` lose the task link but keep
   * their intent title; rows that already exist are skipped (ON CONFLICT DO NOTHING).
   */
  async importFocusSessions(sessions: FocusSessionRecord[], knownTaskIds: Set<string>): Promise<void> {
    const userId = await this.requireUserId();
    const rows = sessions.map((s) =>
      sessionToRow({ ...s, taskId: s.taskId && knownTaskIds.has(s.taskId) ? s.taskId : null }, userId),
    );
    for (const batch of chunk(rows, IMPORT_CHUNK_SIZE)) {
      const result = await this.client
        .from('focus_sessions')
        .upsert(batch, { onConflict: 'id', ignoreDuplicates: true });
      if (result.error) throw toAppError(result.error);
    }
  }
}
