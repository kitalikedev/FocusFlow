import React, { useEffect, useRef, useState } from 'react';
import { SITE_BUTTON_LINE, SITE_BUTTON_PRIMARY, SITE_FOCUS } from '@/core/ui/siteStyles';
import { useSitePreset } from '@/core/ui/siteTheme';

const MODES = [
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    minutes: 25,
    note: 'Focus for 25 min, then take a 5 min break',
  },
  { id: '52-17', label: '52/17', minutes: 52, note: 'Focus for 52 min, then take a 17 min break' },
  {
    id: 'deep-work',
    label: 'Deep Work',
    minutes: 90,
    note: 'Focus for 90 min, then take a 20 min break',
  },
] as const;

type ModeId = (typeof MODES)[number]['id'];

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * The big timer at the top of the home page, drawn in the clock font of the website theme,
 * so visitors can try the idea before opening the workspace. It has its own state and never touches
 * the real workspace timer.
 */
export const DemoTimer: React.FC = () => {
  const { presetId } = useSitePreset();
  const [modeId, setModeId] = useState<ModeId>('pomodoro');
  const mode = MODES.find((item) => item.id === modeId) ?? MODES[0];
  const [secondsLeft, setSecondsLeft] = useState(mode.minutes * 60);
  const [isRunning, setRunning] = useState(false);
  // The clock is the largest thing on the first screen: it shows at once when the page opens (LCP, issue #30)
  // and only animates when a digit or the theme changes afterwards.
  const hasMounted = useRef(false);
  useEffect(() => {
    hasMounted.current = true;
  }, []);
  const animate = hasMounted.current;

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
    <div data-testid="demo-timer" className="flex flex-col items-center text-center">
      <div
        role="group"
        aria-label="Timer mode"
        className="flex flex-wrap justify-center gap-1 rounded-full border border-site-line bg-site-surface p-1"
      >
        {MODES.map((item) => {
          const isActive = item.id === modeId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => pickMode(item.id)}
              className={`min-h-9 rounded-full px-4 text-[13px] font-medium transition-colors duration-200 ${SITE_FOCUS} ${
                isActive
                  ? 'bg-site-accent text-site-on-accent'
                  : 'text-site-muted hover:text-site-text'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Keyed by theme so the new clock font fades in after a theme change. */}
      <p
        key={presetId}
        data-testid="demo-clock"
        role="timer"
        aria-label={`${mode.label} timer`}
        className={`site-clock ${animate ? 'site-swap' : ''} my-3 select-none whitespace-nowrap text-[24vw] font-bold leading-[1] tracking-[-0.03em] text-site-accent sm:text-[168px] lg:text-[208px]`}
        style={{ textShadow: '0 0 90px var(--site-glow)' }}
      >
        {formatClock(secondsLeft)
          .split('')
          .map((char, index) => (
            // Keyed by value: a digit that changes mounts again and drops in.
            <span
              key={`${index}-${char}`}
              className={char !== ':' && animate ? 'site-tick' : 'inline-block'}
            >
              {char}
            </span>
          ))}
      </p>
      <p className="mb-6 text-[15px] text-site-muted">{mode.note}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRunning((running) => !running)}
          disabled={secondsLeft === 0}
          className={`${SITE_BUTTON_PRIMARY} min-w-[120px] disabled:opacity-50`}
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
