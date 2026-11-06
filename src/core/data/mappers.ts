import {
  FocusSessionRecord,
  NoteItem,
  SavedTheme,
  TaskItem,
  TaskPriority,
  UserSettings,
  WallpaperMetadata,
} from '@/shared/types/contracts';
import { clampInt, clampVolume, normalizeSettings, parseThemeConfig } from './defaults';

/** Row shapes returned by PostgREST (snake_case, ERD section 2). */
export interface UserSettingsRow {
  id?: string;
  user_id: string;
  focus_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  long_break_interval: number;
  auto_start_breaks: boolean;
  auto_start_focus: boolean;
  clock_visual_mode: string;
  clock_position: string;
  active_wallpaper_id: string;
  volume_rain: number | string;
  volume_brown_noise: number | string;
  volume_campfire: number | string;
  volume_master: number | string;
  is_migrated: boolean;
  active_theme: unknown;
  created_at?: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  priority: TaskPriority;
  due_date: string | null;
  labels: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface NoteRow {
  id: string;
  user_id: string;
  content: string;
  created_at?: string;
  updated_at: string;
}

export interface FocusSessionRow {
  id: string;
  user_id?: string;
  duration_minutes: number;
  intent_title: string | null;
  task_id: string | null;
  completed_at: string;
}

export interface WallpaperRow {
  id: string;
  user_id: string;
  storage_path: string;
  file_size: number;
  luminance: number | string;
  created_at: string;
  updated_at?: string;
}

export interface SavedThemeRow {
  id: string;
  user_id: string;
  name: string;
  config: unknown;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------- user_settings

export function rowToSettings(row: UserSettingsRow): UserSettings {
  return normalizeSettings({
    userId: row.user_id,
    timerDurations: {
      focus: row.focus_duration,
      shortBreak: row.short_break_duration,
      longBreak: row.long_break_duration,
    },
    clockVisualMode: row.clock_visual_mode,
    clockPosition: row.clock_position,
    activeWallpaperId: row.active_wallpaper_id,
    ambientVolumes: {
      rain: row.volume_rain,
      brownNoise: row.volume_brown_noise,
      campfire: row.volume_campfire,
      master: row.volume_master,
    },
    autoStartBreaks: row.auto_start_breaks,
    autoStartFocus: row.auto_start_focus,
    longBreakInterval: row.long_break_interval,
    isMigrated: row.is_migrated,
    activeTheme: row.active_theme,
    updatedAt: row.updated_at,
  });
}

/** Builds an upsert payload containing only the fields present in `settings` (partial update safe). */
export function settingsToRow(
  userId: string,
  settings: Partial<UserSettings>,
  updatedAt: string,
): Partial<UserSettingsRow> & { user_id: string; updated_at: string } {
  const row: Partial<UserSettingsRow> & { user_id: string; updated_at: string } = {
    user_id: userId,
    updated_at: updatedAt,
  };
  const durations = settings.timerDurations;
  const volumes = settings.ambientVolumes;

  if (durations?.focus !== undefined) row.focus_duration = clampInt(durations.focus, 60, 10800, 1500);
  if (durations?.shortBreak !== undefined) {
    row.short_break_duration = clampInt(durations.shortBreak, 60, 10800, 300);
  }
  if (durations?.longBreak !== undefined) {
    row.long_break_duration = clampInt(durations.longBreak, 60, 10800, 900);
  }
  if (settings.longBreakInterval !== undefined) {
    row.long_break_interval = clampInt(settings.longBreakInterval, 1, 24, 4);
  }
  if (settings.autoStartBreaks !== undefined) row.auto_start_breaks = settings.autoStartBreaks;
  if (settings.autoStartFocus !== undefined) row.auto_start_focus = settings.autoStartFocus;
  if (settings.clockVisualMode !== undefined) row.clock_visual_mode = settings.clockVisualMode;
  if (settings.clockPosition !== undefined) row.clock_position = settings.clockPosition;
  if (settings.activeWallpaperId !== undefined) row.active_wallpaper_id = settings.activeWallpaperId;
  if (volumes?.rain !== undefined) row.volume_rain = clampVolume(volumes.rain, 0.5);
  if (volumes?.brownNoise !== undefined) row.volume_brown_noise = clampVolume(volumes.brownNoise, 0);
  if (volumes?.campfire !== undefined) row.volume_campfire = clampVolume(volumes.campfire, 0);
  if (volumes?.master !== undefined) row.volume_master = clampVolume(volumes.master, 0.8);
  if (settings.isMigrated !== undefined) row.is_migrated = settings.isMigrated;
  if (settings.activeTheme !== undefined) row.active_theme = parseThemeConfig(settings.activeTheme);

  return row;
}

// ---------------------------------------------------------------------- tasks

export function rowToTask(row: TaskRow): TaskItem {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    isCompleted: row.is_completed,
    priority: row.priority,
    dueDate: row.due_date,
    labels: row.labels ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function taskToRow(task: TaskItem, userId: string): TaskRow {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    is_completed: task.isCompleted,
    priority: task.priority,
    due_date: task.dueDate ?? null,
    labels: task.labels,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

export function taskUpdatesToRow(
  updates: Partial<Pick<TaskItem, 'title' | 'isCompleted' | 'priority' | 'dueDate' | 'labels'>>,
  updatedAt: string,
): Partial<TaskRow> {
  const row: Partial<TaskRow> = { updated_at: updatedAt };
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.isCompleted !== undefined) row.is_completed = updates.isCompleted;
  if (updates.priority !== undefined) row.priority = updates.priority;
  if (updates.dueDate !== undefined) row.due_date = updates.dueDate;
  if (updates.labels !== undefined) row.labels = updates.labels;
  return row;
}

// ---------------------------------------------------------------------- notes

export function rowToNote(row: NoteRow): NoteItem {
  return { id: row.id, userId: row.user_id, content: row.content, updatedAt: row.updated_at };
}

// ------------------------------------------------------------- focus_sessions

export function rowToSession(row: FocusSessionRow): FocusSessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    durationMinutes: row.duration_minutes,
    intentTitle: row.intent_title,
    taskId: row.task_id,
    completedAt: row.completed_at,
  };
}

export function sessionToRow(session: FocusSessionRecord, userId: string): FocusSessionRow {
  return {
    id: session.id,
    user_id: userId,
    duration_minutes: session.durationMinutes,
    intent_title: session.intentTitle ?? null,
    task_id: session.taskId ?? null,
    completed_at: session.completedAt,
  };
}

// ------------------------------------------------------------- user_wallpapers

export function rowToWallpaper(row: WallpaperRow, publicUrl: string): WallpaperMetadata {
  const segments = row.storage_path.split('/');
  return {
    id: row.id,
    name: segments[segments.length - 1] ?? row.storage_path,
    type: 'custom',
    url: publicUrl,
    fileSize: row.file_size,
    luminance: Number(row.luminance),
    uploadedAt: row.created_at,
  };
}

// --------------------------------------------------------------- saved_themes

export function rowToSavedTheme(row: SavedThemeRow): SavedTheme {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    config: parseThemeConfig(row.config),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function savedThemeToRow(theme: SavedTheme, userId: string): SavedThemeRow {
  return {
    id: theme.id,
    user_id: userId,
    name: theme.name,
    config: theme.config,
    created_at: theme.createdAt,
    updated_at: theme.updatedAt,
  };
}
