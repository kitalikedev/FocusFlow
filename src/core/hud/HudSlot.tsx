import React from 'react';
import { Cloud, CloudOff, Flame, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import type { SyncStatus } from '../data/useSyncStatusStore';
import { useHud } from './useHud';
import { AccountMenu } from './AccountMenu';

const SYNC_LABELS: Record<SyncStatus, string> = {
  offline: 'Offline — changes saved locally',
  syncing: 'Syncing…',
  synced: 'Synced',
};

const SyncIndicator: React.FC<{ status: SyncStatus }> = ({ status }) => {
  const Icon = status === 'offline' ? CloudOff : status === 'syncing' ? RefreshCw : Cloud;
  return (
    <span
      data-testid="sync-indicator"
      data-status={status}
      role="status"
      title={SYNC_LABELS[status]}
      aria-label={SYNC_LABELS[status]}
      className="flex items-center text-white/80"
    >
      <Icon
        aria-hidden="true"
        className={`h-4 w-4 ${status === 'syncing' ? 'animate-spin motion-reduce:animate-none' : ''}`}
      />
    </span>
  );
};

export const HudSlot: React.FC = () => {
  const {
    sessionsToday,
    streakCount,
    syncStatus,
    isZen,
    isFullscreen,
    fullscreenSupported,
    toggleFullscreen,
  } = useHud();

  if (isZen) {
    return null;
  }

  return (
    <header
      data-testid="hud-header"
      className="w-full flex items-center justify-between px-6 py-4 select-none"
    >
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        <span className="font-semibold tracking-wider text-sm opacity-90">FocusFlow</span>
      </div>

      {/* Session counter & Streak (the cycle dots live in the clock capsule, AC-30.1) */}
      <div className="flex items-center gap-4">
        <span data-testid="sessions-today" className="text-xs text-white/80" title="Focus sessions completed today">
          {sessionsToday} today
        </span>

        {/* Streak Badge */}
        <div
          data-testid="streak-badge"
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80"
          title="Daily Streak"
        >
          <Flame className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          <span>{streakCount}</span>
        </div>

        {syncStatus && <SyncIndicator status={syncStatus} />}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <AccountMenu />
        {fullscreenSupported && (
          <button
            data-testid="fullscreen-btn"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            title={isFullscreen ? 'Exit Fullscreen (Shift+F)' : 'Fullscreen (Shift+F)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
