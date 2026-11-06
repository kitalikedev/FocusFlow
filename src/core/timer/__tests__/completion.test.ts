import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/shared/lib/web-audio', () => ({ playChime: vi.fn() }));
vi.mock('@/core/data/useDataRepository', () => ({ getDataRepository: vi.fn() }));

import { playChime } from '@/shared/lib/web-audio';
import { getDataRepository } from '@/core/data/useDataRepository';
import { useFocusSessionsStore } from '@/core/data/useFocusSessionsStore';
import { useSyncStatusStore } from '@/core/data/useSyncStatusStore';
import { useToastStore } from '@/core/ui/useToastStore';
import { AppError } from '@/shared/lib/errors';
import { useFocusIntentStore } from '../useFocusIntentStore';

import { onSessionCompleted } from '../completion';

type CompletionModule = typeof import('../completion');

const recordFocusSession = vi.fn();
const record = {
  id: 'r1',
  durationMinutes: 25,
  intentTitle: null,
  taskId: null,
  completedAt: '2026-11-06T10:00:00.000Z',
};

class FakeNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn().mockResolvedValue('granted');
  static created: Array<{ title: string; options?: NotificationOptions }> = [];
  constructor(title: string, options?: NotificationOptions) {
    FakeNotification.created.push({ title, options });
  }
}

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { value: hidden, configurable: true });
}

// Only the permission tests need a fresh module (the "already asked" flag is module state).
async function loadFreshCompletion(): Promise<CompletionModule> {
  vi.resetModules();
  return import('../completion');
}

beforeEach(() => {
  vi.clearAllMocks();
  recordFocusSession.mockResolvedValue(record);
  vi.mocked(getDataRepository).mockReturnValue({ recordFocusSession } as unknown as ReturnType<typeof getDataRepository>);
  FakeNotification.permission = 'granted';
  FakeNotification.created = [];
  vi.stubGlobal('Notification', FakeNotification);
  setHidden(true);
  useFocusIntentStore.setState({ intentTitle: '', taskId: null });
  useFocusSessionsStore.setState({ sessions: [] });
  useToastStore.setState({ toasts: [] });
  useSyncStatusStore.setState({ pendingWrites: 0 });
});
afterEach(() => {
  vi.unstubAllGlobals();
  setHidden(false);
});

describe('onSessionCompleted', () => {
  it('AC-07.2: always plays the chime, for focus and for breaks', async () => {
    onSessionCompleted({ sessionType: 'focus', sessionSeconds: 1500 });
    onSessionCompleted({ sessionType: 'short_break', sessionSeconds: 300 });
    expect(playChime).toHaveBeenCalledTimes(2);
  });

  it('AC-07.1: notifies only when granted and the tab is hidden', async () => {
    onSessionCompleted({ sessionType: 'focus', sessionSeconds: 1500 });
    expect(FakeNotification.created).toEqual([
      { title: 'Session Completed!', options: { body: 'Time for a break!' } },
    ]);

    onSessionCompleted({ sessionType: 'long_break', sessionSeconds: 900 });
    expect(FakeNotification.created[1]).toEqual({ title: 'Break Over!', options: { body: 'Time to focus!' } });

    setHidden(false);
    onSessionCompleted({ sessionType: 'focus', sessionSeconds: 1500 });
    FakeNotification.permission = 'denied';
    setHidden(true);
    onSessionCompleted({ sessionType: 'focus', sessionSeconds: 1500 });
    expect(FakeNotification.created).toHaveLength(2);
  });

  it('does not fail when Notification is missing or its constructor throws', async () => {
    vi.stubGlobal('Notification', class {
      static permission = 'granted';
      constructor() {
        throw new TypeError('Illegal constructor');
      }
    });
    expect(() => onSessionCompleted({ sessionType: 'focus', sessionSeconds: 60 })).not.toThrow();

    vi.stubGlobal('Notification', undefined);
    expect(() => onSessionCompleted({ sessionType: 'focus', sessionSeconds: 60 })).not.toThrow();
  });

  it('AC-21.1: records a focus session with its length in minutes', async () => {
    onSessionCompleted({ sessionType: 'focus', sessionSeconds: 1500 });
    await vi.waitFor(() => expect(useFocusSessionsStore.getState().sessions).toEqual([record]));
    expect(recordFocusSession).toHaveBeenCalledWith(25, null, null);
  });

  it('AC-29.2: includes the focus intent and linked task', async () => {
    useFocusIntentStore.getState().setIntent('  Thiết kế UI Tokens  ', 'task-1');
    onSessionCompleted({ sessionType: 'focus', sessionSeconds: 1500 });
    await vi.waitFor(() => expect(recordFocusSession).toHaveBeenCalled());
    expect(recordFocusSession).toHaveBeenCalledWith(25, 'Thiết kế UI Tokens', 'task-1');
  });

  it('truncates a long intent and clamps the length to 1..1440 minutes', async () => {
    useFocusIntentStore.getState().setIntent('x'.repeat(200));
    onSessionCompleted({ sessionType: 'focus', sessionSeconds: 10 });
    onSessionCompleted({ sessionType: 'focus', sessionSeconds: 10800 * 60 });
    await vi.waitFor(() => expect(recordFocusSession).toHaveBeenCalledTimes(2));
    expect(recordFocusSession.mock.calls[0]).toEqual([1, 'x'.repeat(80), null]);
    expect(recordFocusSession.mock.calls[1][0]).toBe(1440);
  });

  it('does not record breaks', async () => {
    onSessionCompleted({ sessionType: 'short_break', sessionSeconds: 300 });
    onSessionCompleted({ sessionType: 'long_break', sessionSeconds: 900 });
    expect(recordFocusSession).not.toHaveBeenCalled();
  });

  it('shows a toast when saving fails and keeps the sync counter balanced', async () => {
    recordFocusSession.mockRejectedValue(new AppError('NETWORK_DISCONNECTED'));
    onSessionCompleted({ sessionType: 'focus', sessionSeconds: 1500 });

    await vi.waitFor(() => expect(useToastStore.getState().toasts).toHaveLength(1));
    expect(useToastStore.getState().toasts[0].variant).toBe('error');
    expect(useFocusSessionsStore.getState().sessions).toEqual([]);
    expect(useSyncStatusStore.getState().pendingWrites).toBe(0);
  });
});

describe('requestNotificationPermission (plan Q6)', () => {
  it('asks once when the permission is still undecided', async () => {
    FakeNotification.permission = 'default';
    const { requestNotificationPermission } = await loadFreshCompletion();
    requestNotificationPermission();
    requestNotificationPermission();
    expect(FakeNotification.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('never asks when already decided or unsupported', async () => {
    const { requestNotificationPermission } = await loadFreshCompletion();
    requestNotificationPermission();
    expect(FakeNotification.requestPermission).not.toHaveBeenCalled();

    vi.stubGlobal('Notification', undefined);
    expect(() => requestNotificationPermission()).not.toThrow();
  });

  it('survives a browser that throws from requestPermission', async () => {
    FakeNotification.permission = 'default';
    FakeNotification.requestPermission.mockImplementationOnce(() => {
      throw new Error('needs gesture');
    });
    const { requestNotificationPermission } = await loadFreshCompletion();
    expect(() => requestNotificationPermission()).not.toThrow();
  });
});

describe('useFocusIntentStore', () => {
  it('AC-29.3: clearing the task link keeps the text', () => {
    useFocusIntentStore.getState().setIntent('Write report', 'task-9');
    useFocusIntentStore.getState().clearTaskLink();
    expect(useFocusIntentStore.getState()).toMatchObject({ intentTitle: 'Write report', taskId: null });
  });
});
