import { describe, it, expect } from 'vitest';
import type { FocusSessionRecord, TaskItem } from '@/shared/types/contracts';
import {
  allLabels,
  applyView,
  dateInputToIso,
  DEFAULT_VIEW,
  exceedsLabelQuota,
  isOverdue,
  isoToDateInput,
  parseLabels,
} from '../lib/tasks';
import { formatMinutes, minutesByIntent, NO_INTENT_LABEL, startOfWeek, weekMinutes } from '../lib/analytics';

function task(id: string, overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    id,
    title: `Task ${id}`,
    isCompleted: false,
    priority: 'none',
    dueDate: null,
    labels: [],
    createdAt: `2026-11-0${id}T08:00:00.000Z`,
    updatedAt: `2026-11-0${id}T08:00:00.000Z`,
    ...overrides,
  };
}

describe('applyView', () => {
  const tasks = [
    task('1', { title: 'Viết báo cáo tài chính', priority: 'high', labels: ['Work'] }),
    task('2', { title: 'Đọc sách', priority: 'low', dueDate: '2026-11-10T00:00:00.000Z' }),
    task('3', { title: 'Nộp báo cáo tuần', priority: 'high', dueDate: '2026-11-08T00:00:00.000Z', isCompleted: true }),
    task('4', { title: 'Gym', priority: 'medium', dueDate: '2026-11-09T00:00:00.000Z' }),
  ];

  it('newest first with completed tasks last', () => {
    expect(applyView(tasks, DEFAULT_VIEW).map((t) => t.id)).toEqual(['4', '2', '1', '3']);
  });

  it('AC-19.5: search plus priority filter', () => {
    const view = { ...DEFAULT_VIEW, search: 'BÁO CÁO', priority: 'high' as const };
    expect(applyView(tasks, view).map((t) => t.id)).toEqual(['1', '3']);
  });

  it('AC-19.6: due date ascending, tasks without date at the end', () => {
    expect(applyView(tasks, { ...DEFAULT_VIEW, sort: 'dueDate' }).map((t) => t.id)).toEqual(['4', '2', '1', '3']);
  });

  it('priority sort and label filter', () => {
    expect(applyView(tasks, { ...DEFAULT_VIEW, sort: 'priority' }).map((t) => t.id)).toEqual(['1', '4', '2', '3']);
    expect(applyView(tasks, { ...DEFAULT_VIEW, label: 'Work' }).map((t) => t.id)).toEqual(['1']);
  });
});

describe('task helpers', () => {
  it('parses labels without duplicates or blanks', () => {
    expect(parseLabels(' Work, Urgent ,work,, ')).toEqual(['Work', 'Urgent']);
    expect(allLabels([task('1', { labels: ['b', 'a'] }), task('2', { labels: ['a'] })])).toEqual(['a', 'b']);
  });

  it('enforces 20 distinct labels per user', () => {
    const many = [task('1', { labels: Array.from({ length: 19 }, (_, i) => `l${i}`) })];
    expect(exceedsLabelQuota(many, '2', ['l0', 'new'])).toBe(false);
    expect(exceedsLabelQuota(many, '2', ['new', 'other'])).toBe(true);
    expect(exceedsLabelQuota(many, '1', ['a', 'b'])).toBe(false);
  });

  it('converts date inputs in the local timezone and flags overdue tasks', () => {
    const iso = dateInputToIso('2026-11-07');
    expect(iso).not.toBeNull();
    expect(isoToDateInput(iso)).toBe('2026-11-07');
    expect(dateInputToIso('7/11/2026')).toBeNull();
    expect(isoToDateInput(null)).toBe('');
    expect(isoToDateInput('nope')).toBe('');

    const now = new Date(2026, 10, 7, 12);
    expect(isOverdue(task('1', { dueDate: new Date(2026, 10, 6).toISOString() }), now)).toBe(true);
    expect(isOverdue(task('1', { dueDate: new Date(2026, 10, 7).toISOString() }), now)).toBe(false);
    expect(isOverdue(task('1', { dueDate: new Date(2026, 10, 6).toISOString(), isCompleted: true }), now)).toBe(false);
  });
});

describe('analytics helpers', () => {
  const session = (date: Date, minutes: number, intentTitle?: string): FocusSessionRecord => ({
    id: crypto.randomUUID(),
    durationMinutes: minutes,
    intentTitle,
    completedAt: date.toISOString(),
  });

  it('AC-21.3: sums minutes per local day from Monday to Sunday', () => {
    const now = new Date(2026, 10, 7, 15); // Saturday
    expect(startOfWeek(now)).toEqual(new Date(2026, 10, 2));
    const sessions = [
      session(new Date(2026, 10, 2, 9), 25),
      session(new Date(2026, 10, 2, 23, 30), 25),
      session(new Date(2026, 10, 7, 10), 50),
      session(new Date(2026, 10, 1, 10), 90), // previous week
    ];
    expect(weekMinutes(sessions, now)).toEqual([50, 0, 0, 0, 0, 50, 0]);
  });

  it('AC-29.2: groups minutes by intent, largest first', () => {
    const now = new Date();
    const totals = minutesByIntent([
      session(now, 25, 'Thiết kế UI Tokens'),
      session(now, 25, 'thiết kế ui tokens'),
      session(now, 30),
      session(now, 10, 'Email'),
    ]);
    expect(totals).toEqual([
      { title: 'Thiết kế UI Tokens', minutes: 50 },
      { title: NO_INTENT_LABEL, minutes: 30 },
      { title: 'Email', minutes: 10 },
    ]);
  });

  it('formats minutes', () => {
    expect(formatMinutes(25)).toBe('25m');
    expect(formatMinutes(60)).toBe('1h');
    expect(formatMinutes(95)).toBe('1h 35m');
  });
});
