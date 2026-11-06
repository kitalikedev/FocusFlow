import { AppError } from '@/shared/lib/errors';
import { TaskItem } from '@/shared/types/contracts';
import { LIMITS } from './defaults';

/** Client-side validation mirroring database constraints so users get precise errors before any request. */

export function validateTaskTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0 || trimmed.length > LIMITS.taskTitleMax) {
    throw new AppError('TITLE_LENGTH_INVALID');
  }
  return trimmed;
}

export function validateLabels(labels: string[]): string[] {
  const cleaned = labels.map((label) => label.trim());
  const invalid =
    cleaned.length > LIMITS.taskLabelsMax ||
    cleaned.some((label) => label.length === 0 || label.length > LIMITS.taskLabelLengthMax);
  if (invalid) throw new AppError('INVALID_LABELS');
  return cleaned;
}

export function validateDueDate(dueDate: string | null | undefined): string | null {
  if (dueDate === null || dueDate === undefined) return null;
  const time = Date.parse(dueDate);
  if (Number.isNaN(time)) throw new AppError('INVALID_DUE_DATE');
  return new Date(time).toISOString();
}

export type TaskUpdates = Partial<
  Pick<TaskItem, 'title' | 'isCompleted' | 'priority' | 'dueDate' | 'labels'>
>;

/** Validates only the fields present in an update patch and returns the cleaned patch. */
export function validateTaskUpdates(updates: TaskUpdates): TaskUpdates {
  const cleaned: TaskUpdates = { ...updates };
  if (updates.title !== undefined) cleaned.title = validateTaskTitle(updates.title);
  if (updates.labels !== undefined) cleaned.labels = validateLabels(updates.labels);
  if (updates.dueDate !== undefined) cleaned.dueDate = validateDueDate(updates.dueDate);
  return cleaned;
}

export function validateNoteContent(content: string): void {
  if (content.length > LIMITS.noteMaxChars) throw new AppError('NOTE_TOO_LARGE');
}

export function validateThemeName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > LIMITS.themeNameMax) {
    throw new AppError('NAME_LENGTH_INVALID');
  }
  return trimmed;
}

export function validateThemeConfigSize(config: unknown): void {
  const bytes = new TextEncoder().encode(JSON.stringify(config)).length;
  if (bytes > LIMITS.themeConfigMaxBytes) throw new AppError('CONFIG_TOO_LARGE');
}

export function validateFocusSession(
  durationMinutes: number,
  intentTitle?: string | null,
): { durationMinutes: number; intentTitle: string | null } {
  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > LIMITS.sessionMinutesMax
  ) {
    throw new AppError('VALIDATION_FAILED');
  }
  const trimmed = intentTitle?.trim() ?? '';
  if (trimmed.length > LIMITS.intentTitleMax) throw new AppError('INTENT_TOO_LONG');
  return { durationMinutes, intentTitle: trimmed.length > 0 ? trimmed : null };
}

export const ALLOWED_WALLPAPER_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export function validateWallpaperFile(file: File, luminance: number): string {
  const extension = ALLOWED_WALLPAPER_MIME[file.type];
  if (!extension) throw new AppError('INVALID_FILE_TYPE');
  if (file.size > LIMITS.wallpaperMaxBytes) throw new AppError('FILE_TOO_LARGE');
  if (!Number.isFinite(luminance) || luminance < 0 || luminance > 1) {
    throw new AppError('VALIDATION_FAILED');
  }
  return extension;
}
