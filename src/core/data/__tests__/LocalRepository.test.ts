import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppError } from '@/shared/lib/errors';
import { ThemeLimitError } from '@/shared/types/contracts';
import { OBSIDIAN_MINIMAL_CONFIG } from '@/core/theme/presets';
import { LocalRepository } from '../LocalRepository';
import { GUEST_STORAGE_KEYS } from '../storageKeys';
import { StoredWallpaper, WallpaperStore } from '../idbWallpaperStore';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createMemoryWallpaperStore(): WallpaperStore & { value: StoredWallpaper | null } {
  const store = {
    value: null as StoredWallpaper | null,
    async get() {
      return store.value;
    },
    async put(wallpaper: StoredWallpaper) {
      store.value = wallpaper;
    },
    async remove() {
      store.value = null;
    },
  };
  return store;
}

async function codeOf(promise: Promise<unknown>): Promise<string | undefined> {
  try {
    await promise;
  } catch (error) {
    return error instanceof AppError ? error.code : `other:${(error as Error).name}`;
  }
  return undefined;
}

describe('LocalRepository', () => {
  let repo: LocalRepository;
  let wallpapers: ReturnType<typeof createMemoryWallpaperStore>;

  beforeEach(() => {
    window.localStorage.clear();
    wallpapers = createMemoryWallpaperStore();
    repo = new LocalRepository(window.localStorage, wallpapers);
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:mock') }));
  });

  describe('AC-02.1 persistence', () => {
    it('keeps 3 tasks, a note and settings after a "reload" (new repository instance)', async () => {
      await repo.createTask('One');
      await repo.createTask('Two');
      await repo.createTask('Three');
      await repo.saveNote('my note');
      await repo.saveSettings({ autoStartFocus: true });

      const reloaded = new LocalRepository(window.localStorage, wallpapers);
      expect(await reloaded.getTasks()).toHaveLength(3);
      expect((await reloaded.getNote()).content).toBe('my note');
      expect((await reloaded.getSettings()).autoStartFocus).toBe(true);

      expect(window.localStorage.getItem(GUEST_STORAGE_KEYS.tasks)).not.toBeNull();
      expect(window.localStorage.getItem(GUEST_STORAGE_KEYS.notes)).not.toBeNull();
      expect(window.localStorage.getItem(GUEST_STORAGE_KEYS.settings)).not.toBeNull();
    });
  });

  describe('tasks', () => {
    it('creates tasks with client-side UUID v4 ids and defaults', async () => {
      const task = await repo.createTask('  Draft  ', { priority: 'high', labels: ['Work'], dueDate: '2026-11-07T17:00:00Z' });
      expect(task.id).toMatch(UUID_V4);
      expect(task).toMatchObject({ title: 'Draft', priority: 'high', labels: ['Work'], isCompleted: false });
      expect(task.dueDate).toBe('2026-11-07T17:00:00.000Z');
      expect((await repo.createTask('plain')).priority).toBe('none');
    });

    it('rejects invalid titles, labels and due dates', async () => {
      expect(await codeOf(repo.createTask(''))).toBe('TITLE_LENGTH_INVALID');
      expect(await codeOf(repo.createTask('x', { labels: ['1', '2', '3', '4', '5', '6'] }))).toBe('INVALID_LABELS');
      expect(await codeOf(repo.createTask('x', { dueDate: 'garbage' }))).toBe('INVALID_DUE_DATE');
    });

    it('blocks the 101st task', async () => {
      const seed = Array.from({ length: 100 }, (_, i) => ({
        id: `id-${i}`,
        title: `t${i}`,
        isCompleted: false,
        priority: 'none',
        dueDate: null,
        labels: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }));
      window.localStorage.setItem(GUEST_STORAGE_KEYS.tasks, JSON.stringify(seed));
      expect(await codeOf(repo.createTask('one too many'))).toBe('TASK_LIMIT_EXCEEDED');
    });

    it('updates and deletes tasks; unknown ids raise NOT_FOUND', async () => {
      const task = await repo.createTask('A');
      const updated = await repo.updateTask(task.id, { isCompleted: true, title: 'B' });
      expect(updated).toMatchObject({ isCompleted: true, title: 'B' });
      expect(await codeOf(repo.updateTask('missing', { title: 'x' }))).toBe('NOT_FOUND');
      await repo.deleteTask(task.id);
      expect(await repo.getTasks()).toHaveLength(0);
    });

    it('filters, searches and sorts', async () => {
      const a = await repo.createTask('Alpha meeting', { priority: 'low', labels: ['Work'], dueDate: '2026-11-10T00:00:00Z' });
      const b = await repo.createTask('Beta report', { priority: 'high', labels: ['Home'] });
      const c = await repo.createTask('Gamma', { priority: 'medium', dueDate: '2026-11-08T00:00:00Z' });
      await repo.updateTask(c.id, { isCompleted: true });

      expect((await repo.getTasks({ isCompleted: true })).map((t) => t.id)).toEqual([c.id]);
      expect((await repo.getTasks({ priority: 'high' })).map((t) => t.id)).toEqual([b.id]);
      expect((await repo.getTasks({ label: 'Work' })).map((t) => t.id)).toEqual([a.id]);
      expect((await repo.getTasks({ search: 'MEETING' })).map((t) => t.id)).toEqual([a.id]);

      expect((await repo.getTasks({ sortBy: 'priority', sortOrder: 'desc' })).map((t) => t.id)).toEqual([b.id, c.id, a.id]);
      expect((await repo.getTasks({ sortBy: 'priority', sortOrder: 'asc' })).map((t) => t.id)).toEqual([a.id, c.id, b.id]);
      // due date ascending, tasks without a date last
      expect((await repo.getTasks({ sortBy: 'dueDate', sortOrder: 'asc' })).map((t) => t.id)).toEqual([c.id, a.id, b.id]);
      expect((await repo.getTasks({ sortBy: 'dueDate', sortOrder: 'desc' })).map((t) => t.id)).toEqual([a.id, c.id, b.id]);
      expect((await repo.getTasks({ sortBy: 'createdAt', sortOrder: 'asc' })).length).toBe(3);
    });

    it('sorts by due date when several tasks have no date', async () => {
      await repo.createTask('x');
      await repo.createTask('y');
      expect(await repo.getTasks({ sortBy: 'dueDate' })).toHaveLength(2);
    });

    it('ignores corrupted storage instead of crashing', async () => {
      window.localStorage.setItem(GUEST_STORAGE_KEYS.tasks, '{broken');
      expect(await repo.getTasks()).toEqual([]);
      window.localStorage.setItem(GUEST_STORAGE_KEYS.tasks, JSON.stringify([{ nope: true }, 5]));
      expect(await repo.getTasks()).toEqual([]);
    });

    it('reports STORAGE_FULL when localStorage rejects writes', async () => {
      const full = {
        getItem: () => null,
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      } as unknown as Storage;
      const failing = new LocalRepository(full, wallpapers);
      expect(await codeOf(failing.createTask('x'))).toBe('STORAGE_FULL');
    });
  });

  describe('notes', () => {
    it('returns an empty note when none is stored and keeps the id after saving', async () => {
      const empty = await repo.getNote();
      expect(empty.content).toBe('');
      expect(empty.id).toMatch(UUID_V4);

      const first = await repo.saveNote('hello');
      const second = await repo.saveNote('hello world');
      expect(second.id).toBe(first.id);
      expect(await codeOf(repo.saveNote('x'.repeat(50001)))).toBe('NOTE_TOO_LARGE');
    });
  });

  describe('settings', () => {
    it('returns defaults, then deep merges partial updates', async () => {
      expect((await repo.getSettings()).timerDurations.focus).toBe(1500);
      const saved = await repo.saveSettings({ timerDurations: { focus: 3000 } as never });
      expect(saved.timerDurations).toEqual({ focus: 3000, shortBreak: 300, longBreak: 900 });
      expect(saved.userId).toBeUndefined();
    });
  });

  describe('focus sessions', () => {
    it('records sessions and returns the last 90 days newest first', async () => {
      const first = await repo.recordFocusSession(25, 'Draft PRD', 'task-1');
      expect(first.id).toMatch(UUID_V4);
      expect(first).toMatchObject({ durationMinutes: 25, intentTitle: 'Draft PRD', taskId: 'task-1' });
      await repo.recordFocusSession(30);

      const old = {
        id: 'old',
        durationMinutes: 25,
        intentTitle: null,
        taskId: null,
        completedAt: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString(),
      };
      const stored = JSON.parse(window.localStorage.getItem(GUEST_STORAGE_KEYS.sessions) as string);
      window.localStorage.setItem(GUEST_STORAGE_KEYS.sessions, JSON.stringify([...stored, old]));

      const sessions = await repo.getFocusSessions();
      expect(sessions).toHaveLength(2);
      expect(Date.parse(sessions[0].completedAt)).toBeGreaterThanOrEqual(Date.parse(sessions[1].completedAt));
      expect(await codeOf(repo.recordFocusSession(0))).toBe('VALIDATION_FAILED');
    });

    it('detaches sessions from a deleted task (ON DELETE SET NULL)', async () => {
      const task = await repo.createTask('Linked');
      await repo.recordFocusSession(25, 'x', task.id);
      await repo.recordFocusSession(25, 'y', 'other');
      await repo.deleteTask(task.id);
      const sessions = await repo.getFocusSessions();
      expect(sessions.find((s) => s.intentTitle === 'x')?.taskId).toBeNull();
      expect(sessions.find((s) => s.intentTitle === 'y')?.taskId).toBe('other');
    });
  });

  describe('saved themes', () => {
    const themeInput = { name: 'Night', config: OBSIDIAN_MINIMAL_CONFIG };

    it('saves, renames and deletes themes with a limit of 3', async () => {
      const a = await repo.saveTheme(themeInput);
      expect(a.id).toMatch(UUID_V4);
      await repo.saveTheme({ ...themeInput, name: 'B' });
      await repo.saveTheme({ ...themeInput, name: 'C' });
      await expect(repo.saveTheme({ ...themeInput, name: 'D' })).rejects.toBeInstanceOf(ThemeLimitError);

      const renamed = await repo.renameTheme(a.id, 'Renamed');
      expect(renamed.name).toBe('Renamed');
      expect(await codeOf(repo.renameTheme('missing', 'x'))).toBe('NOT_FOUND');
      expect(await codeOf(repo.renameTheme(a.id, ''))).toBe('NAME_LENGTH_INVALID');

      await repo.deleteTheme(a.id);
      expect(await repo.getSavedThemes()).toHaveLength(2);
    });

    it('rejects invalid names and oversized configs', async () => {
      expect(await codeOf(repo.saveTheme({ ...themeInput, name: ' ' }))).toBe('NAME_LENGTH_INVALID');
      const hugeConfig = {
        ...OBSIDIAN_MINIMAL_CONFIG,
        presetId: 'x'.repeat(9000),
      };
      expect(await codeOf(repo.saveTheme({ name: 'Huge', config: hugeConfig }))).toBe('CONFIG_TOO_LARGE');
    });

    it('drops corrupted theme entries', async () => {
      window.localStorage.setItem(GUEST_STORAGE_KEYS.savedThemes, JSON.stringify([{ id: 1 }]));
      expect(await repo.getSavedThemes()).toEqual([]);
    });
  });

  describe('guest wallpaper (single file)', () => {
    const png = () => new File(['x'], 'bg.png', { type: 'image/png' });

    it('uploads one file, lists it and deletes it', async () => {
      expect(await repo.getWallpapers()).toEqual([]);
      const uploaded = await repo.uploadCustomWallpaper(png(), 0.1234);
      expect(uploaded).toMatchObject({ name: 'bg.png', type: 'custom', luminance: 0.123, url: 'blob:mock' });

      const list = await repo.getWallpapers();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(uploaded.id);

      expect(await codeOf(repo.uploadCustomWallpaper(png(), 0.5))).toBe('WALLPAPER_LIMIT_EXCEEDED');
      expect(await codeOf(repo.deleteCustomWallpaper('wrong'))).toBe('NOT_FOUND');
      await repo.deleteCustomWallpaper(uploaded.id);
      expect(await repo.getWallpapers()).toEqual([]);
    });

    it('validates type and size before touching storage', async () => {
      expect(await codeOf(repo.uploadCustomWallpaper(new File(['x'], 'a.txt', { type: 'text/plain' }), 0.5))).toBe(
        'INVALID_FILE_TYPE',
      );
      expect(wallpapers.value).toBeNull();
    });
  });

  describe('exportAll', () => {
    it('returns a full snapshot and hides blank notes', async () => {
      expect(repo.exportAll()).toEqual({ settings: null, tasks: [], note: null, savedThemes: [], sessions: [] });

      await repo.createTask('A');
      await repo.saveNote('   ');
      await repo.saveSettings({ autoStartFocus: true });
      await repo.recordFocusSession(25);
      await repo.saveTheme({ name: 'T', config: OBSIDIAN_MINIMAL_CONFIG });

      let snapshot = repo.exportAll();
      expect(snapshot.tasks).toHaveLength(1);
      expect(snapshot.note).toBeNull();
      expect(snapshot.settings?.autoStartFocus).toBe(true);
      expect(snapshot.sessions).toHaveLength(1);
      expect(snapshot.savedThemes).toHaveLength(1);

      await repo.saveNote('real');
      snapshot = repo.exportAll();
      expect(snapshot.note?.content).toBe('real');
    });
  });
});
