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
import { AppError } from '@/shared/lib/errors';
import { ERROR_MESSAGES } from '@/shared/lib/messages';
import { LIMITS, mergeSettings, normalizeSettings, parseThemeConfig } from './defaults';
import { idbWallpaperStore, WallpaperStore } from './idbWallpaperStore';
import { GUEST_STORAGE_KEYS } from './storageKeys';
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

const PRIORITY_RANK: Record<TaskPriority, number> = { none: 0, low: 1, medium: 2, high: 3 };
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

/** Everything a guest has stored; consumed by migrateGuestData. */
export interface GuestSnapshot {
  settings: UserSettings | null;
  tasks: TaskItem[];
  note: NoteItem | null;
  savedThemes: SavedTheme[];
  sessions: FocusSessionRecord[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTask(value: unknown): value is TaskItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.isCompleted === 'boolean' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    Array.isArray(value.labels)
  );
}

function isSession(value: unknown): value is FocusSessionRecord {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.durationMinutes === 'number' &&
    typeof value.completedAt === 'string'
  );
}

function isSavedTheme(value: unknown): value is SavedTheme {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'string' &&
    isRecord(value.config)
  );
}

/** Guest-mode repository backed by localStorage (and IndexedDB for the single guest wallpaper). */
export class LocalRepository implements DataRepository {
  constructor(
    private readonly storage: Storage = window.localStorage,
    private readonly wallpaperStore: WallpaperStore = idbWallpaperStore,
  ) {}

  // ---------------------------------------------------------------- low level

  private read(key: string): unknown {
    try {
      const raw = this.storage.getItem(key);
      return raw === null ? undefined : JSON.parse(raw);
    } catch {
      return undefined;
    }
  }

  private write(key: string, value: unknown): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      throw new AppError('STORAGE_FULL', undefined, { originalError: error });
    }
  }

  private readTasks(): TaskItem[] {
    const raw = this.read(GUEST_STORAGE_KEYS.tasks);
    return Array.isArray(raw) ? raw.filter(isTask) : [];
  }

  private readSessions(): FocusSessionRecord[] {
    const raw = this.read(GUEST_STORAGE_KEYS.sessions);
    return Array.isArray(raw) ? raw.filter(isSession) : [];
  }

  private readThemes(): SavedTheme[] {
    const raw = this.read(GUEST_STORAGE_KEYS.savedThemes);
    return Array.isArray(raw)
      ? raw.filter(isSavedTheme).map((theme) => ({ ...theme, config: parseThemeConfig(theme.config) }))
      : [];
  }

  private readNote(): NoteItem | null {
    const raw = this.read(GUEST_STORAGE_KEYS.notes);
    if (
      isRecord(raw) &&
      typeof raw.id === 'string' &&
      typeof raw.content === 'string' &&
      typeof raw.updatedAt === 'string'
    ) {
      return { id: raw.id, content: raw.content, updatedAt: raw.updatedAt };
    }
    return null;
  }

  /** Returns every guest record, used when moving data to the cloud. */
  exportAll(): GuestSnapshot {
    const rawSettings = this.read(GUEST_STORAGE_KEYS.settings);
    const note = this.readNote();
    return {
      settings: isRecord(rawSettings) ? normalizeSettings(rawSettings) : null,
      tasks: this.readTasks(),
      note: note && note.content.trim().length > 0 ? note : null,
      savedThemes: this.readThemes(),
      sessions: this.readSessions(),
    };
  }

  // -------------------------------------------------------------------- tasks

  async getTasks(filter?: TaskFilterParams): Promise<TaskItem[]> {
    let tasks = this.readTasks();

    if (filter?.isCompleted !== undefined) tasks = tasks.filter((t) => t.isCompleted === filter.isCompleted);
    if (filter?.priority) tasks = tasks.filter((t) => t.priority === filter.priority);
    if (filter?.label) {
      const label = filter.label;
      tasks = tasks.filter((t) => t.labels.includes(label));
    }
    if (filter?.search) {
      const needle = filter.search.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(needle));
    }

    const direction = filter?.sortOrder === 'asc' ? 1 : -1;
    const sortBy = filter?.sortBy ?? 'createdAt';

    return [...tasks].sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return direction * (Date.parse(a.dueDate) - Date.parse(b.dueDate));
      }
      if (sortBy === 'priority') {
        return direction * (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
      }
      return direction * (Date.parse(a.createdAt) - Date.parse(b.createdAt));
    });
  }

  async createTask(
    title: string,
    options?: Partial<Pick<TaskItem, 'priority' | 'dueDate' | 'labels'>>,
  ): Promise<TaskItem> {
    const cleanTitle = validateTaskTitle(title);
    const labels = validateLabels(options?.labels ?? []);
    const dueDate = validateDueDate(options?.dueDate);

    const tasks = this.readTasks();
    if (tasks.length >= LIMITS.guestTasksMax) throw new AppError('TASK_LIMIT_EXCEEDED');

    const now = new Date().toISOString();
    const task: TaskItem = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      isCompleted: false,
      priority: options?.priority ?? 'none',
      dueDate,
      labels,
      createdAt: now,
      updatedAt: now,
    };
    this.write(GUEST_STORAGE_KEYS.tasks, [...tasks, task]);
    return task;
  }

  async updateTask(
    id: string,
    updates: Partial<Pick<TaskItem, 'title' | 'isCompleted' | 'priority' | 'dueDate' | 'labels'>>,
  ): Promise<TaskItem> {
    const cleaned = validateTaskUpdates(updates);
    const tasks = this.readTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new AppError('NOT_FOUND');

    const updated: TaskItem = { ...tasks[index], ...cleaned, updatedAt: new Date().toISOString() };
    tasks[index] = updated;
    this.write(GUEST_STORAGE_KEYS.tasks, tasks);
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    this.write(
      GUEST_STORAGE_KEYS.tasks,
      this.readTasks().filter((t) => t.id !== id),
    );
    // Mirror the database rule ON DELETE SET NULL for focus_sessions.task_id.
    const sessions = this.readSessions();
    if (sessions.some((s) => s.taskId === id)) {
      this.write(
        GUEST_STORAGE_KEYS.sessions,
        sessions.map((s) => (s.taskId === id ? { ...s, taskId: null } : s)),
      );
    }
  }

  // -------------------------------------------------------------------- notes

  async getNote(): Promise<NoteItem> {
    return (
      this.readNote() ?? { id: crypto.randomUUID(), content: '', updatedAt: new Date().toISOString() }
    );
  }

  async saveNote(content: string): Promise<NoteItem> {
    validateNoteContent(content);
    const existing = this.readNote();
    const note: NoteItem = {
      id: existing?.id ?? crypto.randomUUID(),
      content,
      updatedAt: new Date().toISOString(),
    };
    this.write(GUEST_STORAGE_KEYS.notes, note);
    return note;
  }

  // ----------------------------------------------------------------- settings

  async getSettings(): Promise<UserSettings> {
    return normalizeSettings(this.read(GUEST_STORAGE_KEYS.settings));
  }

  async saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const merged = mergeSettings(await this.getSettings(), settings);
    const saved: UserSettings = { ...merged, userId: undefined, updatedAt: new Date().toISOString() };
    this.write(GUEST_STORAGE_KEYS.settings, saved);
    return saved;
  }

  // ----------------------------------------------------------------- sessions

  async recordFocusSession(
    durationMinutes: number,
    intentTitle?: string | null,
    taskId?: string | null,
  ): Promise<FocusSessionRecord> {
    const valid = validateFocusSession(durationMinutes, intentTitle);
    const record: FocusSessionRecord = {
      id: crypto.randomUUID(),
      durationMinutes: valid.durationMinutes,
      intentTitle: valid.intentTitle,
      taskId: taskId ?? null,
      completedAt: new Date().toISOString(),
    };
    this.write(GUEST_STORAGE_KEYS.sessions, [...this.readSessions(), record]);
    return record;
  }

  async getFocusSessions(): Promise<FocusSessionRecord[]> {
    const since = Date.now() - NINETY_DAYS_MS;
    return this.readSessions()
      .filter((s) => Date.parse(s.completedAt) >= since)
      .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  }

  // --------------------------------------------------------------- wallpapers

  async getWallpapers(): Promise<WallpaperMetadata[]> {
    const stored = await this.wallpaperStore.get();
    if (!stored) return [];
    return [
      {
        id: stored.id,
        name: stored.name,
        type: 'custom',
        url: URL.createObjectURL(stored.blob),
        fileSize: stored.fileSize,
        luminance: stored.luminance,
        uploadedAt: stored.uploadedAt,
      },
    ];
  }

  async uploadCustomWallpaper(file: File, luminance: number): Promise<WallpaperMetadata> {
    validateWallpaperFile(file, luminance);
    if (await this.wallpaperStore.get()) {
      throw new AppError('WALLPAPER_LIMIT_EXCEEDED', ERROR_MESSAGES.WALLPAPER_LIMIT_EXCEEDED);
    }

    const stored = {
      id: crypto.randomUUID(),
      name: file.name,
      blob: file,
      fileSize: file.size,
      luminance: Number(luminance.toFixed(3)),
      uploadedAt: new Date().toISOString(),
    };
    await this.wallpaperStore.put(stored);
    return {
      id: stored.id,
      name: stored.name,
      type: 'custom',
      url: URL.createObjectURL(file),
      fileSize: stored.fileSize,
      luminance: stored.luminance,
      uploadedAt: stored.uploadedAt,
    };
  }

  async deleteCustomWallpaper(id: string): Promise<void> {
    const stored = await this.wallpaperStore.get();
    if (!stored || stored.id !== id) throw new AppError('NOT_FOUND');
    await this.wallpaperStore.remove();
  }

  // ------------------------------------------------------------------- themes

  async getSavedThemes(): Promise<SavedTheme[]> {
    return this.readThemes().sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  }

  async saveTheme(theme: Omit<SavedTheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedTheme> {
    const name = validateThemeName(theme.name);
    const config = parseThemeConfig(theme.config);
    validateThemeConfigSize(config);

    const themes = this.readThemes();
    if (themes.length >= LIMITS.guestThemesMax) {
      throw new ThemeLimitError(ERROR_MESSAGES.THEME_LIMIT_EXCEEDED);
    }

    const now = new Date().toISOString();
    const saved: SavedTheme = { id: crypto.randomUUID(), name, config, createdAt: now, updatedAt: now };
    this.write(GUEST_STORAGE_KEYS.savedThemes, [...themes, saved]);
    return saved;
  }

  async renameTheme(id: string, name: string): Promise<SavedTheme> {
    const cleanName = validateThemeName(name);
    const themes = this.readThemes();
    const index = themes.findIndex((t) => t.id === id);
    if (index === -1) throw new AppError('NOT_FOUND');

    const renamed: SavedTheme = { ...themes[index], name: cleanName, updatedAt: new Date().toISOString() };
    themes[index] = renamed;
    this.write(GUEST_STORAGE_KEYS.savedThemes, themes);
    return renamed;
  }

  async deleteTheme(id: string): Promise<void> {
    this.write(
      GUEST_STORAGE_KEYS.savedThemes,
      this.readThemes().filter((t) => t.id !== id),
    );
  }
}
