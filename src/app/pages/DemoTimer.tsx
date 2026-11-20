import React, { useEffect, useState } from 'react';
import { SITE_BUTTON_LINE, SITE_BUTTON_PRIMARY, SITE_FOCUS } from '@/core/ui/siteStyles';

const MODES = [
  { id: 'pomodoro', label: 'Pomodoro', minutes: 25, note: 'Focus for 25 min, then take a 5 min break' },
  { id: '52-17', label: '52/17', minutes: 52, note: 'Focus for 52 min, then take a 17 min break' },
  { id: 'deep-work', label: 'Deep Work', minutes: 90, note: 'Focus for 90 min, then take a 20 min break' },
] as const;

type ModeId = (typeof MODES)[number]['id'];

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * A small timer on the home page so visitors can try the idea before opening the workspace.
 * It has its own state and never touches the real workspace timer.
 */
export const DemoTimer: React.FC = () => {
  const [modeId, setModeId] = useState<ModeId>('pomodoro');
  const mode = MODES.find((item) => item.id === modeId) ?? MODES[0];
  const [secondsLeft, setSecondsLeft] = useState(mode.minutes * 60);
  const [isRunning, setRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((left) => Math.max(0, left - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  const pickMode = (id: ModeId) => {
    const next = MODES.find((item) => item.id === id) ?? MODES[0];
    setModeId(id);
    setRunning(false);
    setSecondsLeft(next.minutes * 60);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(mode.minutes * 60);
  };

  return (
    <div
      data-testid="demo-timer"
      className="rounded-2xl border border-site-line bg-site-surface p-5 transition-colors duration-300"
    >
      <div role="group" aria-label="Timer mode" className="flex flex-wrap gap-1">
        {MODES.map((item) => {
          const isActive = item.id === modeId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => pickMode(item.id)}
              className={`min-h-9 rounded-lg px-3 text-[13px] font-medium transition-colors ${SITE_FOCUS} ${
                isActive ? 'bg-site-bg text-site-text ring-1 ring-inset ring-site-line' : 'text-site-muted hover:text-site-text'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <p
        data-testid="demo-clock"
        role="timer"
        aria-label={`${mode.label} timer`}
        className="mb-2 mt-7 font-digits text-[76px] font-bold leading-none tracking-[-0.04em] tabular-nums sm:text-[104px]"
      >
        {formatClock(secondsLeft)}
      </p>
      <p className="mb-5 text-[13px] text-site-muted">{mode.note}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRunning((running) => !running)}
          disabled={secondsLeft === 0}
          className={`${SITE_BUTTON_PRIMARY} min-w-[108px] disabled:opacity-50`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button type="button" onClick={reset} className={SITE_BUTTON_LINE}>
          Reset
        </button>
      </div>
    </div>
  );
};
