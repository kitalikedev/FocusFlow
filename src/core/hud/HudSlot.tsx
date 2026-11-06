import React from 'react';
import { Maximize2, Minimize2, Flame } from 'lucide-react';
import { useHud } from './useHud';
import { AccountMenu } from './AccountMenu';

export const HudSlot: React.FC = () => {
  const {
    cycleDots,
    completedDots,
    streakCount,
    isZen,
    isFullscreen,
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

      {/* Cycle Indicator & Streak */}
      <div className="flex items-center gap-4">
        {/* Cycle Dots */}
        <div data-testid="cycle-dots" className="flex items-center gap-1.5" title="Pomodoro Cycles">
          {Array.from({ length: cycleDots }).map((_, index) => {
            const isFilled = index < completedDots;
            return (
              <span
                key={index}
                data-testid={`cycle-dot-${index}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  isFilled ? 'bg-white opacity-90' : 'bg-white/20'
                }`}
              />
            );
          })}
        </div>

        {/* Streak Badge */}
        <div
          data-testid="streak-badge"
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80"
          title="Daily Streak"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>{streakCount}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <AccountMenu />
        <button
          data-testid="fullscreen-btn"
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
