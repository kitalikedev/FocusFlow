import { describe, it, expect } from 'vitest';
import {
  rowToNote,
  rowToSavedTheme,
  rowToSession,
  rowToSettings,
  rowToTask,
  rowToWallpaper,
  savedThemeToRow,
  sessionToRow,
  settingsToRow,
  taskToRow,
  taskUpdatesToRow,
  UserSettingsRow,
} from '../mappers';
import { createDefaultSettings } from '../defaults';
import { DEFAULT_THEME_CONFIG } from '@/core/theme/presets';

const settingsRow: UserSettingsRow = {
  id: 's1',
  user_id: 'u1',
  focus_duration: 1800,
  short_break_duration: 300,
  long_break_duration: 900,
  long_break_interval: 4,
  auto_start_breaks: true,
  auto_start_focus: false,
  clock_visual_mode: 'circular_ring',
  clock_position: 'zen',
  active_wallpaper_id: 'preset-x',
  volume_rain: '0.50',
  volume_brown_noise: 0.1,
  volume_campfire: 0,
  volume_master: 0.8,
  is_migrated: true,
  active_theme: {},
  updated_at: '2026-11-05T10:00:00Z',
};

describe('settings mapping', () => {
  it('rebuilds nested settings from flat columns', () => {
    const settings = rowToSettings(settingsRow);
    expect(settings.userId).toBe('u1');
    expect(settings.timerDurations).toEqual({ focus: 1800, shortBreak: 300, longBreak: 900 });
    expect(settings.ambientVolumes).toEqual({ rain: 0.5, brownNoise: 0.1, campfire: 0, master: 0.8 });
    expect(settings.clockVisualMode).toBe('circular_ring');
    expect(settings.autoStartBreaks).toBe(true);
    expect(settings.isMigrated).toBe(true);
    expect(settings.activeTheme).toBe(DEFAULT_THEME_CONFIG);
  });

  it('flattens a full settings object into columns', () => {
    const row = settingsToRow('u1', createDefaultSettings(), '2026-11-06T00:00:00.000Z');
    expect(row).toMatchObject({
      user_id: 'u1',
      focus_duration: 1500,
      short_break_duration: 300,
      long_break_duration: 900,
      long_break_interval: 4,
      auto_start_breaks: false,
      auto_start_focus: false,
      clock_visual_mode: 'minimal',
      clock_position: 'center',
      active_wallpaper_id: 'preset-lofi-cafe',
      volume_rain: 0.5,
      volume_brown_noise: 0,
      volume_campfire: 0,
      volume_master: 0.8,
      is_migrated: false,
      updated_at: '2026-11-06T00:00:00.000Z',
    });
    expect(row.active_theme).toBeDefined();
  });

  it('only includes columns present in a partial update', () => {
    const row = settingsToRow('u1', { isMigrated: true }, 'now');
    expect(Object.keys(row).sort()).toEqual(['is_migrated', 'updated_at', 'user_id']);
  });

  it('clamps unsafe values before they reach the database', () => {
    const row = settingsToRow(
      'u1',
      { timerDurations: { focus: 5, shortBreak: 99999, longBreak: 600 }, ambientVolumes: { rain: 3, brownNoise: -1, campfire: 0.5, master: 1 }, longBreakInterval: 99 },
      'now',
    );
    expect(row.focus_duration).toBe(60);
    expect(row.short_break_duration).toBe(10800);
    expect(row.volume_rain).toBe(1);
    expect(row.volume_brown_noise).toBe(0);
    expect(row.long_break_interval).toBe(24);
  });
});

describe('task mapping', () => {
  const row = {
    id: 't1',
    user_id: 'u1',
    title: 'Write',
    is_completed: true,
    priority: 'high' as const,
    due_date: '2026-11-06T09:00:00Z',
    labels: null,
    created_at: 'c',
    updated_at: 'u',
  };

  it('maps snake_case rows to TaskItem and back', () => {
    const task = rowToTask(row);
    expect(task).toEqual({
      id: 't1',
      userId: 'u1',
      title: 'Write',
      isCompleted: true,
      priority: 'high',
      dueDate: '2026-11-06T09:00:00Z',
      labels: [],
      createdAt: 'c',
      updatedAt: 'u',
    });
    expect(taskToRow(task, 'u2')).toMatchObject({ user_id: 'u2', is_completed: true, due_date: row.due_date });
    expect(taskToRow({ ...task, dueDate: undefined }, 'u2').due_date).toBeNull();
  });

  it('builds update payloads only for provided fields', () => {
    expect(taskUpdatesToRow({ isCompleted: true }, 'now')).toEqual({ updated_at: 'now', is_completed: true });
    expect(
      taskUpdatesToRow({ title: 't', priority: 'low', dueDate: null, labels: ['a'] }, 'now'),
    ).toEqual({ updated_at: 'now', title: 't', priority: 'low', due_date: null, labels: ['a'] });
  });
});

describe('other mappings', () => {
  it('maps notes, sessions, wallpapers and themes', () => {
    expect(rowToNote({ id: 'n', user_id: 'u', content: 'c', updated_at: 'x' })).toEqual({
      id: 'n',
      userId: 'u',
      content: 'c',
      updatedAt: 'x',
    });

    const session = rowToSession({
      id: 's',
      duration_minutes: 25,
      intent_title: 'Focus',
      task_id: null,
      completed_at: 'x',
    });
    expect(session).toEqual({
      id: 's',
      userId: undefined,
      durationMinutes: 25,
      intentTitle: 'Focus',
      taskId: null,
      completedAt: 'x',
    });
    expect(sessionToRow({ ...session, intentTitle: undefined, taskId: undefined }, 'u')).toMatchObject({
      user_id: 'u',
      intent_title: null,
      task_id: null,
    });

    const wallpaper = rowToWallpaper(
      { id: 'w', user_id: 'u', storage_path: 'u/w.gif', file_size: 10, luminance: '0.145', created_at: 'c' },
      'https://cdn/u/w.gif',
    );
    expect(wallpaper).toEqual({
      id: 'w',
      name: 'w.gif',
      type: 'custom',
      url: 'https://cdn/u/w.gif',
      fileSize: 10,
      luminance: 0.145,
      uploadedAt: 'c',
    });

    const theme = rowToSavedTheme({ id: 'th', user_id: 'u', name: 'N', config: {}, created_at: 'c', updated_at: 'u' });
    expect(theme.config).toBe(DEFAULT_THEME_CONFIG);
    expect(savedThemeToRow(theme, 'u9')).toMatchObject({ id: 'th', user_id: 'u9', name: 'N' });
  });
});
