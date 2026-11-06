import type { SessionType } from '@/shared/types/contracts';
import { toAppError } from '@/shared/lib/errors';
import { playChime } from '@/shared/lib/web-audio';
import { getDataRepository } from '@/core/data/useDataRepository';
import { useFocusSessionsStore } from '@/core/data/useFocusSessionsStore';
import { trackWrite } from '@/core/data/useSyncStatusStore';
import { LIMITS } from '@/core/data/defaults';
import { useToastStore } from '@/core/ui/useToastStore';
import { useFocusIntentStore } from './useFocusIntentStore';

let permissionRequested = false;

/** Browsers only allow the prompt after a user gesture, so it is asked once, on the first Start (plan Q6). */
export function requestNotificationPermission(): void {
  if (permissionRequested || typeof Notification === 'undefined') return;
  if (Notification.permission !== 'default') return;
  permissionRequested = true;
  try {
    void Notification.requestPermission();
  } catch {
    // Some browsers reject the call outside a gesture; the chime still plays.
  }
}

/** AC-07.1: only when the tab is hidden and the permission was granted. */
function notifyCompletion(completed: SessionType): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  if (typeof document === 'undefined' || !document.hidden) return;
  const isFocus = completed === 'focus';
  try {
    new Notification(isFocus ? 'Session Completed!' : 'Break Over!', {
      body: isFocus ? 'Time for a break!' : 'Time to focus!',
    });
  } catch {
    // Mobile browsers throw "Illegal constructor"; ignore, the chime already played.
  }
}

async function recordFocusSession(sessionSeconds: number): Promise<void> {
  const minutes = Math.min(LIMITS.sessionMinutesMax, Math.max(1, Math.round(sessionSeconds / 60)));
  const { intentTitle, taskId } = useFocusIntentStore.getState();
  const title = intentTitle.trim().slice(0, LIMITS.intentTitleMax);
  try {
    const record = await trackWrite(() =>
      getDataRepository().recordFocusSession(minutes, title.length > 0 ? title : null, taskId),
    );
    useFocusSessionsStore.getState().add(record);
  } catch (error) {
    useToastStore.getState().showToast(toAppError(error).message, { variant: 'error' });
  }
}

export interface CompletedSession {
  sessionType: SessionType;
  sessionSeconds: number;
}

/** Side effects of a countdown reaching zero: chime, notification and the analytics record (AC-21.1). */
export function onSessionCompleted({ sessionType, sessionSeconds }: CompletedSession): void {
  playChime();
  notifyCompletion(sessionType);
  if (sessionType === 'focus') void recordFocusSession(sessionSeconds);
}
