import { describe, it, expect, beforeEach } from 'vitest';
import { selectSyncStatus, trackWrite, useSyncStatusStore, watchConnectivity } from '../useSyncStatusStore';

beforeEach(() => {
  useSyncStatusStore.setState({ isOnline: true, pendingWrites: 0 });
});

describe('selectSyncStatus', () => {
  it('offline wins over syncing, syncing wins over synced', () => {
    const state = useSyncStatusStore.getState();
    expect(selectSyncStatus({ ...state, isOnline: true, pendingWrites: 0 })).toBe('synced');
    expect(selectSyncStatus({ ...state, isOnline: true, pendingWrites: 2 })).toBe('syncing');
    expect(selectSyncStatus({ ...state, isOnline: false, pendingWrites: 2 })).toBe('offline');
  });
});

describe('trackWrite', () => {
  it('counts a write while it is in flight and returns its result', async () => {
    let release: (value: string) => void = () => {};
    const pending = trackWrite(() => new Promise<string>((resolve) => (release = resolve)));
    expect(useSyncStatusStore.getState().pendingWrites).toBe(1);

    release('saved');
    await expect(pending).resolves.toBe('saved');
    expect(useSyncStatusStore.getState().pendingWrites).toBe(0);
  });

  it('releases the counter when the write fails', async () => {
    await expect(trackWrite(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    expect(useSyncStatusStore.getState().pendingWrites).toBe(0);
  });

  it('handles overlapping writes', async () => {
    const first = trackWrite(() => Promise.resolve(1));
    const second = trackWrite(() => Promise.resolve(2));
    expect(useSyncStatusStore.getState().pendingWrites).toBe(2);
    await Promise.all([first, second]);
    expect(useSyncStatusStore.getState().pendingWrites).toBe(0);
  });
});

describe('watchConnectivity', () => {
  it('follows online and offline events until cleaned up', () => {
    const stop = watchConnectivity();
    window.dispatchEvent(new Event('offline'));
    expect(useSyncStatusStore.getState().isOnline).toBe(false);
    window.dispatchEvent(new Event('online'));
    expect(useSyncStatusStore.getState().isOnline).toBe(true);

    stop();
    window.dispatchEvent(new Event('offline'));
    expect(useSyncStatusStore.getState().isOnline).toBe(true);
  });
});
