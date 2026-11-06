import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { idbWallpaperStore, StoredWallpaper } from '../idbWallpaperStore';

interface FakeRequest<T> {
  result?: T;
  error?: unknown;
  onsuccess?: () => void;
  onerror?: () => void;
  onupgradeneeded?: () => void;
}

/** Minimal in-memory IndexedDB double: enough for open + get/put/delete on one object store. */
function installFakeIndexedDb(options: { failOpen?: boolean; failRequests?: boolean } = {}) {
  const records = new Map<string, unknown>();
  let created = false;

  const fire = <T,>(request: FakeRequest<T>, result: T) => {
    queueMicrotask(() => {
      if (options.failRequests) {
        request.error = new Error('request failed');
        request.onerror?.();
        return;
      }
      request.result = result;
      request.onsuccess?.();
    });
  };

  const store = {
    get: (key: string) => {
      const request: FakeRequest<unknown> = {};
      fire(request, records.get(key));
      return request;
    },
    put: (value: unknown, key: string) => {
      records.set(key, value);
      const request: FakeRequest<string> = {};
      fire(request, key);
      return request;
    },
    delete: (key: string) => {
      records.delete(key);
      const request: FakeRequest<undefined> = {};
      fire(request, undefined);
      return request;
    },
  };

  const db = {
    createObjectStore: () => {
      created = true;
    },
    transaction: () => ({ objectStore: () => store }),
    close: vi.fn(),
  };

  vi.stubGlobal('indexedDB', {
    open: () => {
      const request: FakeRequest<typeof db> & { result?: typeof db } = { result: db };
      queueMicrotask(() => {
        if (options.failOpen) {
          request.error = new Error('open failed');
          request.onerror?.();
          return;
        }
        request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    },
  });

  return { records, db, wasCreated: () => created };
}

const wallpaper: StoredWallpaper = {
  id: 'w1',
  name: 'bg.png',
  blob: new Blob(['x']),
  fileSize: 1,
  luminance: 0.2,
  uploadedAt: 'x',
};

describe('idbWallpaperStore', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('with IndexedDB available', () => {
    let fake: ReturnType<typeof installFakeIndexedDb>;
    beforeEach(() => {
      fake = installFakeIndexedDb();
    });

    it('creates the store on first open, then stores, reads and removes the wallpaper', async () => {
      expect(await idbWallpaperStore.get()).toBeNull();
      expect(fake.wasCreated()).toBe(true);

      await idbWallpaperStore.put(wallpaper);
      expect(await idbWallpaperStore.get()).toEqual(wallpaper);
      expect(fake.db.close).toHaveBeenCalled();

      await idbWallpaperStore.remove();
      expect(await idbWallpaperStore.get()).toBeNull();
    });
  });

  describe('when IndexedDB fails', () => {
    it('get and remove degrade quietly, put raises STORAGE_FULL', async () => {
      installFakeIndexedDb({ failOpen: true });
      expect(await idbWallpaperStore.get()).toBeNull();
      await expect(idbWallpaperStore.remove()).resolves.toBeUndefined();
      await expect(idbWallpaperStore.put(wallpaper)).rejects.toMatchObject({ code: 'STORAGE_FULL' });
    });

    it('treats failed requests like missing data', async () => {
      installFakeIndexedDb({ failRequests: true });
      expect(await idbWallpaperStore.get()).toBeNull();
      await expect(idbWallpaperStore.put(wallpaper)).rejects.toMatchObject({ code: 'STORAGE_FULL' });
      await expect(idbWallpaperStore.remove()).resolves.toBeUndefined();
    });
  });

  describe('when IndexedDB is missing (private browsing)', () => {
    beforeEach(() => {
      vi.stubGlobal("indexedDB", undefined);
    });

    it('behaves like an empty store and rejects writes', async () => {
      expect(await idbWallpaperStore.get()).toBeNull();
      await expect(idbWallpaperStore.remove()).resolves.toBeUndefined();
      await expect(idbWallpaperStore.put(wallpaper)).rejects.toMatchObject({ code: 'STORAGE_FULL' });
    });
  });
});
