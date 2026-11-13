import React from 'react';
import { Pause, Play, RotateCcw, Settings2, SkipForward } from 'lucide-react';
import { useTimerStore } from '@/core/timer/useTimerStore';
import { useUiStore } from '@/core/ui/useUiStore';
import { useClockPreferences } from '../hooks/useClockPreferences';
import { NARROW_SCREEN_QUERY, useMediaQuery } from '@/core/ui/useMediaQuery';
import { CONTROL_BUTTON_CLASS, MODE_TABS, SESSION_LABELS } from '../lib/labels';
import { ClockFace } from './ClockFace';
import { CycleDots } from './CycleDots';
import { ExitZenButton } from './ExitZenButton';

const CAPSULE_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--capsule-bg)',
  backdropFilter: 'blur(var(--capsule-blur))',
  WebkitBackdropFilter: 'blur(var(--capsule-blur))',
  borderRadius: 'var(--capsule-radius)',
  borderWidth: 'var(--capsule-border-width)',
  borderColor: 'var(--capsule-border-color)',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
};

/**
 * Controls fade out in Zen mode (opacity 0 + pointer-events none in 300ms, AC-11.2); the clock itself stays.
 * `inert` also removes them from keyboard focus and from screen readers while hidden.
 */
function zenProps(isZen: boolean, className: string): Record<string, string | boolean | undefined> {
  return {
    className: `${className} transition-opacity duration-300 motion-reduce:transition-none ${
      isZen ? 'pointer-events-none opacity-0' : 'opacity-100'
    }`,
    'aria-hidden': isZen || undefined,
    inert: isZen ? '' : undefined,
  };
}

export const ClockDisplay: React.FC = () => {
  const mode = useTimerStore((state) => state.mode);
  const status = useTimerStore((state) => state.status);
  const sessionType = useTimerStore((state) => state.sessionType);
  const start = useTimerStore((state) => state.start);
  const pause = useTimerStore((state) => state.pause);
  const reset = useTimerStore((state) => state.reset);
  const setMode = useTimerStore((state) => state.setMode);
  const skipSession = useTimerStore((state) => state.skipSession);
  const isZen = useUiStore((state) => state.isZen);
  const openSettings = useUiStore((state) => state.setClockSettingsOpen);
  const { visualMode, position: preferredPosition } = useClockPreferences();
  const isNarrow = useMediaQuery(NARROW_SCREEN_QUERY);

  // AC-11.1 is a desktop feature: phones always keep the clock in the center (plan A4).
  const position = isNarrow ? 'center' : preferredPosition;
  const isRunning = status === 'running';
  const startLabel = isRunning ? 'Pause' : status === 'paused' ? 'Resume' : 'Start';
  const StartIcon = isRunning ? Pause : Play;
  const toggleRun = isRunning ? pause : start;

  if (position === 'mini_corner') {
    return (
      <>
        <div
          data-testid="clock-capsule"
          data-position="mini_corner"
          className="fixed bottom-20 right-4 z-30 flex max-h-[80px] max-w-[240px] select-none items-center gap-2 px-4 py-3"
          style={CAPSULE_STYLE}
        >
          <ClockFace visualMode={visualMode} position="mini_corner" />
          <div {...zenProps(isZen, 'flex items-center')}>
            <button type="button" data-testid="start-pause-btn" aria-label={startLabel} onClick={toggleRun} className={CONTROL_BUTTON_CLASS}>
              <StartIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" data-testid="clock-settings-btn" aria-label="Timer settings" onClick={() => openSettings(true)} className={CONTROL_BUTTON_CLASS}>
              <Settings2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <ExitZenButton />
      </>
    );
  }

  return (
    <>
      <div
        data-testid="clock-capsule"
        data-position="center"
        data-visual-mode={visualMode}
        className="relative flex select-none flex-col items-center gap-4 px-6 py-6 sm:px-10"
        style={CAPSULE_STYLE}
      >
        <div {...zenProps(isZen, 'flex flex-col items-center gap-3')}>
          <div role="tablist" aria-label="Timer mode" className="flex flex-wrap justify-center gap-1">
            {MODE_TABS.map((item) => (
              <button
                key={item.mode}
                type="button"
                role="tab"
                data-testid={`mode-${item.mode}`}
                aria-selected={mode === item.mode}
                onClick={() => setMode(item.mode)}
                className={`${CONTROL_BUTTON_CLASS} ${mode === item.mode ? 'bg-white/15 text-white' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <CycleDots />
          <span data-testid="session-label" className="text-xs uppercase tracking-widest text-white/60">
            {SESSION_LABELS[sessionType]}
          </span>
        </div>

        {/* The key restarts the fade whenever the timer mode or the clock style changes. */}
        <div key={`${mode}-${visualMode}`} className="animate-fade-in">
          <ClockFace visualMode={visualMode} position="center" />
        </div>

        <div {...zenProps(isZen, 'flex items-center gap-2')}>
          <button type="button" data-testid="start-pause-btn" onClick={toggleRun} className={`${CONTROL_BUTTON_CLASS} bg-white/10`}>
            <StartIcon className="h-4 w-4" aria-hidden="true" />
            {startLabel}
          </button>
          <button type="button" data-testid="reset-btn" onClick={reset} className={CONTROL_BUTTON_CLASS}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          {mode !== 'stopwatch' && (
            <button type="button" data-testid="skip-btn" onClick={skipSession} className={CONTROL_BUTTON_CLASS}>
              <SkipForward className="h-4 w-4" aria-hidden="true" />
              Skip
            </button>
          )}
          <button
            type="button"
            data-testid="clock-settings-btn"
            aria-label="Timer settings"
            onClick={() => openSettings(true)}
            className={CONTROL_BUTTON_CLASS}
          >
            <Settings2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <ExitZenButton />
    </>
  );
};
