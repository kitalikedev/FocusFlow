import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../useDataRepository', () => ({ getDataRepository: vi.fn() }));

import { AppError } from '@/shared/lib/errors';
import { useToastStore } from '@/core/ui/useToastStore';
import { getDataRepository } from '../useDataRepository';
import { useFocusSessionsStore } from '../useFocusSessionsStore';

const getFocusSessions = vi.fn();
const make = (id: string) => ({ id, durationMinutes: 25, completedAt: '2026-11-06T10:00:00.000Z' });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getDataRepository).mockReturnValue({ getFocusSessions } as unknown as ReturnType<typeof getDataRepository>);
  useFocusSessionsStore.setState({ sessions: [] });
  useToastStore.setState({ toasts: [] });
});

describe('useFocusSessionsStore', () => {
  it('loads the sessions of the current data source', async () => {
    getFocusSessions.mockResolvedValue([make('a'), make('b')]);
    await useFocusSessionsStore.getState().load();
    expect(useFocusSessionsStore.getState().sessions.map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('adds a new session at the front', () => {
    useFocusSessionsStore.setState({ sessions: [make('old')] });
    useFocusSessionsStore.getState().add(make('new'));
    expect(useFocusSessionsStore.getState().sessions.map((s) => s.id)).toEqual(['new', 'old']);
  });

  it('clears the previous account sessions while loading', async () => {
    useFocusSessionsStore.setState({ sessions: [make('other-account')] });
    let release: (value: unknown[]) => void = () => {};
    getFocusSessions.mockReturnValue(new Promise((resolve) => (release = resolve)));

    const loading = useFocusSessionsStore.getState().load();
    expect(useFocusSessionsStore.getState().sessions).toEqual([]);
    release([make('mine')]);
    await loading;
    expect(useFocusSessionsStore.getState().sessions.map((s) => s.id)).toEqual(['mine']);
  });

  it('drops the response of an outdated load', async () => {
    let releaseFirst: (value: unknown[]) => void = () => {};
    getFocusSessions.mockReturnValueOnce(new Promise((resolve) => (releaseFirst = resolve)));
    getFocusSessions.mockResolvedValueOnce([make('second')]);

    const first = useFocusSessionsStore.getState().load();
    await useFocusSessionsStore.getState().load();
    releaseFirst([make('first')]);
    await first;

    expect(useFocusSessionsStore.getState().sessions.map((s) => s.id)).toEqual(['second']);
  });

  it('shows a toast when loading fails, but not for an outdated request', async () => {
    getFocusSessions.mockRejectedValueOnce(new AppError('NETWORK_DISCONNECTED'));
    await useFocusSessionsStore.getState().load();
    expect(useToastStore.getState().toasts).toHaveLength(1);

    useToastStore.setState({ toasts: [] });
    let rejectFirst: (error: Error) => void = () => {};
    getFocusSessions.mockReturnValueOnce(new Promise((_, reject) => (rejectFirst = reject)));
    getFocusSessions.mockResolvedValueOnce([]);
    const stale = useFocusSessionsStore.getState().load();
    await useFocusSessionsStore.getState().load();
    rejectFirst(new Error('late'));
    await stale;
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
