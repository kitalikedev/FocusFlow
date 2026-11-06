import { AppError } from '@/shared/lib/errors';

/** Single guest wallpaper persisted in IndexedDB (PRD FR-14: Guest keeps at most 1 file). */
export interface StoredWallpaper {
  id: string;
  name: string;
  blob: Blob;
  fileSize: number;
  luminance: number;
  uploadedAt: string;
}

export interface WallpaperStore {
  get(): Promise<StoredWallpaper | null>;
  put(wallpaper: StoredWallpaper): Promise<void>;
  remove(): Promise<void>;
}

const DB_NAME = 'focusflow';
const STORE_NAME = 'guest_wallpaper';
const RECORD_KEY = 'current';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runRequest<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = action(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** IndexedDB-backed implementation. Missing IndexedDB (private mode) behaves like an empty store. */
export const idbWallpaperStore: WallpaperStore = {
  async get() {
    if (typeof indexedDB === 'undefined') return null;
    try {
      const db = await openDatabase();
      const value = await runRequest<StoredWallpaper | undefined>(db, 'readonly', (store) =>
        store.get(RECORD_KEY),
      );
      db.close();
      return value ?? null;
    } catch {
      return null;
    }
  },

  async put(wallpaper) {
    if (typeof indexedDB === 'undefined') throw new AppError('STORAGE_FULL');
    try {
      const db = await openDatabase();
      await runRequest(db, 'readwrite', (store) => store.put(wallpaper, RECORD_KEY));
      db.close();
    } catch (error) {
      throw new AppError('STORAGE_FULL', undefined, { originalError: error });
    }
  },

  async remove() {
    if (typeof indexedDB === 'undefined') return;
    try {
      const db = await openDatabase();
      await runRequest(db, 'readwrite', (store) => store.delete(RECORD_KEY));
      db.close();
    } catch {
      // Nothing to remove when the database cannot be opened.
    }
  },
};
