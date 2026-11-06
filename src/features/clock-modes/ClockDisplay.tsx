import React from 'react';
import type { SessionType, TimerMode } from '@/shared/types/contracts';
import { useTimerStore } from '@/core/timer/useTimerStore';

// Minimal working clock so Phase 2 can be used and checked by hand. Package 3A replaces this file
// with the full clock (3 visual styles, positions, settings popover) and keeps the same slot contract.

const MODES: { mode: TimerMode; label: string }[] = [
  { mode: 'pomodoro', label: 'Pomodoro' },
  { mode: '52_17', label: '52/17' },
  { mode: 'deep_work', label: 'Deep Work' },
  { mode: 'custom', label: 'Custom' },
  { mode: 'stopwatch', label: 'Stopwatch' },
];

const SESSION_LABELS: Record<SessionType, string> = {
  focus: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
  stopwatch: 'Stopwatch',
};

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// Only this component subscribes to the per-second value, so the rest of the layout never re-renders on a tick.
const TimeText: React.FC = () => {
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds);
  return (
    <span
      data-testid="clock-time"
      role="timer"
      className="text-7xl font-semibold tracking-tighter"
      style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-clock)' }}
    >
      {formatClock(remainingSeconds)}
    </span>
  );
};

const BUTTON_CLASS =
  'rounded-lg px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300';

export const ClockDisplay: React.FC = () => {
  const mode = useTimerStore((state) => state.mode);
  const status = useTimerStore((state) => state.status);
  const sessionType = useTimerStore((state) => state.sessionType);
  const start = useTimerStore((state) => state.start);
  const pause = useTimerStore((state) => state.pause);
  const reset = useTimerStore((state) => state.reset);
  const setMode = useTimerStore((state) => state.setMode);
  const skipSession = useTimerStore((state) => state.skipSession);

  const isRunning = status === 'running';

  return (
    <div
      data-testid="clock-capsule"
      className="flex flex-col items-center gap-4 px-10 py-6 select-none"
      style={{
        backgroundColor: 'var(--capsule-bg)',
        backdropFilter: 'blur(var(--capsule-blur))',
        WebkitBackdropFilter: 'blur(var(--capsule-blur))',
        borderRadius: 'var(--capsule-radius)',
        borderWidth: 'var(--capsule-border-width)',
        borderColor: 'var(--capsule-border-color)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div role="tablist" aria-label="Timer mode" className="flex flex-wrap justify-center gap-1">
        {MODES.map((item) => (
          <button
            key={item.mode}
            type="button"
            role="tab"
            data-testid={`mode-${item.mode}`}
            aria-selected={mode === item.mode}
            onClick={() => setMode(item.mode)}
            className={`${BUTTON_CLASS} ${mode === item.mode ? 'bg-white/15 text-white' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <span data-testid="session-label" className="text-xs uppercase tracking-widest text-white/60">
        {SESSION_LABELS[sessionType]}
      </span>

      <TimeText />

      <div className="flex items-center gap-2">
        <button
          type="button"
          data-testid="start-pause-btn"
          onClick={isRunning ? pause : start}
          className={`${BUTTON_CLASS} bg-white/10`}
        >
          {isRunning ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}
        </button>
        <button type="button" data-testid="reset-btn" onClick={reset} className={BUTTON_CLASS}>
          Reset
        </button>
        {mode !== 'stopwatch' && (
          <button type="button" data-testid="skip-btn" onClick={skipSession} className={BUTTON_CLASS}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export const ClockSettingsPopover: React.FC = () => {
  return null;
};
