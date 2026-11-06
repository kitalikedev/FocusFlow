import { describe, it, expect, vi } from 'vitest';
import { AppError } from '@/shared/lib/errors';
import { FocusSessionRecord, SavedTheme, TaskItem } from '@/shared/types/contracts';
import { OBSIDIAN_MINIMAL_CONFIG } from '@/core/theme/presets';
import { createDefaultSettings } from '../defaults';
import { GuestSnapshot } from '../LocalRepository';
import { MigrationCloud, migrateGuestData } from '../migrateGuestData';

const task = (id: string): TaskItem => ({
  id,
  title: id,
  isCompleted: false,
  priority: 'none',
  dueDate: null,
  labels: [],
  createdAt: 'c',
  updatedAt: 'u',
});
const theme = (id: string): SavedTheme => ({ id, name: id, config: OBSIDIAN_MINIMAL_CONFIG, createdAt: 'c', updatedAt: 'u' });
const session = (id: string, taskId: string | null = null): FocusSessionRecord => ({
  id,
  durationMinutes: 25,
  intentTitle: id,
  taskId,
  completedAt: 'x',
});

function emptySnapshot(overrides: Partial<GuestSnapshot> = {}): GuestSnapshot {
  return { settings: null, tasks: [], note: null, savedThemes: [], sessions: [], ...overrides };
}

function createCloud(state: { tasks?: TaskItem[]; themes?: SavedTheme[]; note?: string } = {}) {
  const calls: string[] = [];
  const track = <T,>(name: string, value: T) =>
    vi.fn(async () => {
      calls.push(name);
      return value;
    });

  const cloud = {
    getSettings: track('getSettings', createDefaultSettings()),
    saveSettings: track('saveSettings', createDefaultSettings()),
    getTasks: track('getTasks', state.tasks ?? []),
    importTasks: track('importTasks', undefined),
    getNote: track('getNote', { id: 'n', content: state.note ?? '', updatedAt: 'x' }),
    saveNote: track('saveNote', { id: 'n', content: '', updatedAt: 'x' }),
    getSavedThemes: track('getSavedThemes', state.themes ?? []),
    importSavedThemes: track('importSavedThemes', undefined),
    importFocusSessions: track('importFocusSessions', undefined),
  };
  return { cloud: cloud as unknown as MigrationCloud & typeof cloud, calls };
}

describe('migrateGuestData', () => {
  it('signup: writes settings, tasks, notes, themes and sessions in foreign-key order (AC-02.2)', async () => {
    const guestSettings = { ...createDefaultSettings(), autoStartFocus: true };
    const snapshot = emptySnapshot({
      settings: guestSettings,
      tasks: [task('t1'), task('t2'), task('t3')],
      note: { id: 'n', content: 'my note', updatedAt: 'x' },
      savedThemes: [theme('th1')],
      sessions: [session('s1', 't1')],
    });
    const { cloud, calls } = createCloud();
    const clear = vi.fn();

    const result = await migrateGuestData('signup', { local: { exportAll: () => snapshot }, cloud, clear });

    expect(result).toEqual({ tasks: 3, note: true, savedThemes: 1, sessions: 1 });
    const writes = calls.filter((c) => /^(save|import)/.test(c));
    expect(writes).toEqual(['saveSettings', 'importTasks', 'saveNote', 'importSavedThemes', 'importFocusSessions']);
    expect(cloud.saveSettings).toHaveBeenCalledWith({ ...guestSettings, isMigrated: true });
    expect(cloud.saveNote).toHaveBeenCalledWith('my note');
    expect(cloud.importFocusSessions).toHaveBeenCalledWith(snapshot.sessions, new Set(['t1', 't2', 't3']));
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('signup without guest settings still creates the settings row and flags is_migrated', async () => {
    const { cloud } = createCloud();
    await migrateGuestData('signup', {
      local: { exportAll: () => emptySnapshot({ tasks: [task('t1')] }) },
      cloud,
      clear: vi.fn(),
    });
    expect(cloud.getSettings).toHaveBeenCalled();
    expect(cloud.saveSettings).toHaveBeenCalledWith({ isMigrated: true });
  });

  it('merge: keeps cloud settings and appends guest tasks and note (AC-02.3)', async () => {
    const snapshot = emptySnapshot({
      settings: { ...createDefaultSettings(), autoStartFocus: true },
      tasks: [task('g1')],
      note: { id: 'n', content: 'guest text', updatedAt: 'x' },
    });
    const { cloud } = createCloud({ tasks: [task('c1')], note: 'cloud text' });

    await migrateGuestData('merge', { local: { exportAll: () => snapshot }, cloud, clear: vi.fn() });

    expect(cloud.saveSettings).toHaveBeenCalledTimes(1);
    expect(cloud.saveSettings).toHaveBeenCalledWith({ isMigrated: true });
    expect(cloud.importTasks).toHaveBeenCalledWith([task('g1')]);
    expect(cloud.saveNote).toHaveBeenCalledWith('cloud text\n\nguest text');
  });

  it('skips records that already exist in the cloud so a retry never duplicates data', async () => {
    const snapshot = emptySnapshot({
      tasks: [task('t1'), task('t2')],
      savedThemes: [theme('th1')],
      note: { id: 'n', content: 'guest text', updatedAt: 'x' },
    });
    const { cloud } = createCloud({
      tasks: [task('t1')],
      themes: [theme('th1')],
      note: 'cloud text\n\nguest text',
    });
    const clear = vi.fn();

    const result = await migrateGuestData('merge', { local: { exportAll: () => snapshot }, cloud, clear });

    expect(cloud.importTasks).toHaveBeenCalledWith([task('t2')]);
    expect(cloud.importSavedThemes).not.toHaveBeenCalled();
    expect(cloud.saveNote).not.toHaveBeenCalled();
    expect(result).toEqual({ tasks: 1, note: false, savedThemes: 0, sessions: 0 });
    expect(clear).toHaveBeenCalled();
  });

  it('uses the guest note as-is when the cloud note is empty', async () => {
    const { cloud } = createCloud({ note: '   ' });
    await migrateGuestData('merge', {
      local: { exportAll: () => emptySnapshot({ note: { id: 'n', content: 'only guest', updatedAt: 'x' } }) },
      cloud,
      clear: vi.fn(),
    });
    expect(cloud.saveNote).toHaveBeenCalledWith('only guest');
  });

  it('stops before writing anything when limits would be exceeded', async () => {
    const clear = vi.fn();
    const manyCloudTasks = Array.from({ length: 90 }, (_, i) => task(`c${i}`));
    const manyGuestTasks = Array.from({ length: 11 }, (_, i) => task(`g${i}`));
    const { cloud } = createCloud({ tasks: manyCloudTasks });

    await expect(
      migrateGuestData('merge', { local: { exportAll: () => emptySnapshot({ tasks: manyGuestTasks }) }, cloud, clear }),
    ).rejects.toMatchObject({ code: 'TASK_LIMIT_EXCEEDED' });
    expect(cloud.saveSettings).not.toHaveBeenCalled();
    expect(cloud.importTasks).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();

    const cloudThemes = Array.from({ length: 9 }, (_, i) => theme(`c${i}`));
    const { cloud: cloud2 } = createCloud({ themes: cloudThemes });
    await expect(
      migrateGuestData('merge', {
        local: { exportAll: () => emptySnapshot({ savedThemes: [theme('g1'), theme('g2')] }) },
        cloud: cloud2,
        clear,
      }),
    ).rejects.toMatchObject({ code: 'THEME_LIMIT_EXCEEDED' });
    expect(cloud2.saveSettings).not.toHaveBeenCalled();

    const { cloud: cloud3 } = createCloud({ note: 'a'.repeat(49990) });
    await expect(
      migrateGuestData('merge', {
        local: { exportAll: () => emptySnapshot({ note: { id: 'n', content: 'b'.repeat(100), updatedAt: 'x' } }) },
        cloud: cloud3,
        clear,
      }),
    ).rejects.toMatchObject({ code: 'NOTE_TOO_LARGE' });
    expect(cloud3.saveSettings).not.toHaveBeenCalled();
  });

  it('keeps guest data when a later step fails', async () => {
    const { cloud } = createCloud();
    cloud.saveNote.mockRejectedValueOnce(new AppError('NETWORK_DISCONNECTED'));
    const clear = vi.fn();

    await expect(
      migrateGuestData('signup', {
        local: {
          exportAll: () =>
            emptySnapshot({ tasks: [task('t1')], note: { id: 'n', content: 'x', updatedAt: 'x' }, sessions: [session('s1')] }),
        },
        cloud,
        clear,
      }),
    ).rejects.toMatchObject({ code: 'NETWORK_DISCONNECTED' });

    expect(cloud.importFocusSessions).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });

  it('migrating an empty snapshot only flags the account and cleans up', async () => {
    const { cloud } = createCloud();
    const clear = vi.fn();
    const result = await migrateGuestData('signup', { local: { exportAll: () => emptySnapshot() }, cloud, clear });
    expect(result).toEqual({ tasks: 0, note: false, savedThemes: 0, sessions: 0 });
    expect(clear).toHaveBeenCalled();
  });
});
