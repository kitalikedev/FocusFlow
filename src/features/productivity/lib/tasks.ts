import type { TaskItem, TaskPriority } from '@/shared/types/contracts';

export type TaskSort = 'newest' | 'dueDate' | 'priority';

export interface TaskView {
  search: string;
  priority: TaskPriority | 'all';
  label: string | null;
  sort: TaskSort;
}

export const DEFAULT_VIEW: TaskView = { search: '', priority: 'all', label: null, sort: 'newest' };

/** Distinct labels a user may own in total (PRD FR-19). */
export const USER_LABELS_MAX = 20;

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1, none: 0 };

/**
 * Client-side search, filter and sort (AC-19.5, AC-19.6): instant on up to 100 tasks, no request.
 * Completed tasks always sink below open ones so the list stays actionable.
 */
export function applyView(tasks: TaskItem[], view: TaskView): TaskItem[] {
  const needle = view.search.trim().toLocaleLowerCase();
  const filtered = tasks.filter(
    (task) =>
      (!needle || task.title.toLocaleLowerCase().includes(needle)) &&
      (view.priority === 'all' || task.priority === view.priority) &&
      (!view.label || task.labels.includes(view.label)),
  );

  const byNewest = (a: TaskItem, b: TaskItem) => Date.parse(b.createdAt) - Date.parse(a.createdAt);
  const compare = (a: TaskItem, b: TaskItem): number => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    if (view.sort === 'dueDate') {
      if (a.dueDate && b.dueDate) return Date.parse(a.dueDate) - Date.parse(b.dueDate) || byNewest(a, b);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
    } else if (view.sort === 'priority') {
      const diff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      if (diff !== 0) return diff;
    }
    return byNewest(a, b);
  };
  return [...filtered].sort(compare);
}

export function allLabels(tasks: TaskItem[]): string[] {
  return [...new Set(tasks.flatMap((task) => task.labels))].sort((a, b) => a.localeCompare(b));
}

/** Splits "Work, Urgent ,work" into ["Work", "Urgent"] (case-insensitive duplicates removed). */
export function parseLabels(input: string): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const raw of input.split(',')) {
    const label = raw.trim();
    const key = label.toLocaleLowerCase();
    if (label && !seen.has(key)) {
      seen.add(key);
      labels.push(label);
    }
  }
  return labels;
}

/** True when saving `labels` on `taskId` would push the user past 20 distinct labels. */
export function exceedsLabelQuota(tasks: TaskItem[], taskId: string | null, labels: string[]): boolean {
  const others = tasks.filter((task) => task.id !== taskId).flatMap((task) => task.labels);
  return new Set([...others, ...labels]).size > USER_LABELS_MAX;
}

/** `<input type="date">` value (local day) to ISO, and back. */
export function dateInputToIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toISOString();
}

export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDueDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: sameYear ? undefined : 'numeric' });
}

export function isOverdue(task: TaskItem, now: Date = new Date()): boolean {
  if (!task.dueDate || task.isCompleted) return false;
  const due = new Date(task.dueDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return due.getTime() < today.getTime();
}
