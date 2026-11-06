import { useMemo } from 'react';
import { useAuthStore } from '../auth/useAuthStore';
import { useFocusSessionsStore } from '../data/useFocusSessionsStore';
import { SyncStatus, selectSyncStatus, useSyncStatusStore } from '../data/useSyncStatusStore';
import { filledCycleDots } from '../timer/timer-engine';
import { useTimerStore } from '../timer/useTimerStore';
import { isFullscreenSupported, useUiStore } from '../ui/useUiStore';
import { computeStreak, countToday } from './stats';

export interface HudData {
  cycleDots: number;
  completedDots: number;
  sessionsToday: number;
  streakCount: number;
  /** null for guests: their data only lives on this device, so there is nothing to sync. */
  syncStatus: SyncStatus | null;
  isZen: boolean;
  isFullscreen: boolean;
  fullscreenSupported: boolean;
  toggleFullscreen: () => void;
  toggleZen: () => void;
}

export function useHud(): HudData {
  const isZen = useUiStore((state) => state.isZen);
  const isFullscreen = useUiStore((state) => state.isFullscreen);
  const toggleFullscreen = useUiStore((state) => state.toggleFullscreen);
  const toggleZen = useUiStore((state) => state.toggleZen);
  const cycleDots = useTimerStore((state) => state.longBreakInterval);
  const cyclesCompleted = useTimerStore((state) => state.cyclesCompleted);
  const sessionType = useTimerStore((state) => state.sessionType);
  const sessions = useFocusSessionsStore((state) => state.sessions);
  const isGuest = useAuthStore((state) => state.isGuest);
  const status = useSyncStatusStore(selectSyncStatus);

  const sessionsToday = useMemo(() => countToday(sessions), [sessions]);
  const streakCount = useMemo(() => computeStreak(sessions), [sessions]);

  return {
    cycleDots,
    completedDots: filledCycleDots(cyclesCompleted, cycleDots, sessionType),
    sessionsToday,
    streakCount,
    syncStatus: isGuest ? null : status,
    isZen,
    isFullscreen,
    fullscreenSupported: isFullscreenSupported(),
    toggleFullscreen,
    toggleZen,
  };
}
