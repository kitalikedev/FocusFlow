import { create } from 'zustand';

export type SyncStatus = 'offline' | 'syncing' | 'synced';

export interface SyncStatusState {
  isOnline: boolean;
  pendingWrites: number;
  setOnline: (isOnline: boolean) => void;
}

export const useSyncStatusStore = create<SyncStatusState>((set) => ({
  isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
  pendingWrites: 0,
  setOnline: (isOnline) => set({ isOnline }),
}));

export function selectSyncStatus(state: SyncStatusState): SyncStatus {
  if (!state.isOnline) return 'offline';
  return state.pendingWrites > 0 ? 'syncing' : 'synced';
}

/** Marks a repository write as in flight so the HUD can show "Syncing" (FR-30). */
export async function trackWrite<T>(write: () => Promise<T>): Promise<T> {
  useSyncStatusStore.setState((state) => ({ pendingWrites: state.pendingWrites + 1 }));
  try {
    return await write();
  } finally {
    useSyncStatusStore.setState((state) => ({ pendingWrites: Math.max(0, state.pendingWrites - 1) }));
  }
}

/** Mirrors the browser online/offline events into the store; returns the cleanup function. */
export function watchConnectivity(): () => void {
  const goOnline = () => useSyncStatusStore.getState().setOnline(true);
  const goOffline = () => useSyncStatusStore.getState().setOnline(false);
  useSyncStatusStore.getState().setOnline(navigator.onLine);
  window.addEventListener('online', goOnline);
  window.addEventListener('offline', goOffline);
  return () => {
    window.removeEventListener('online', goOnline);
    window.removeEventListener('offline', goOffline);
  };
}
