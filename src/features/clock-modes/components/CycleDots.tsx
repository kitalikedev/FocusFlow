import React from 'react';
import { filledCycleDots } from '@/core/timer/timer-engine';
import { useTimerStore } from '@/core/timer/useTimerStore';

/** AC-30.1: cycle dots right under the mode tabs (lit = focus sessions done in this cycle). */
export const CycleDots: React.FC = () => {
  const interval = useTimerStore((state) => state.longBreakInterval);
  const cycles = useTimerStore((state) => state.cyclesCompleted);
  const sessionType = useTimerStore((state) => state.sessionType);

  if (sessionType === 'stopwatch') return null;
  const filled = filledCycleDots(cycles, interval, sessionType);

  return (
    <div
      data-testid="capsule-cycle-dots"
      role="img"
      aria-label={`${filled} of ${interval} focus sessions done in this cycle`}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: interval }).map((_, index) => (
        <span
          key={index}
          data-filled={index < filled}
          className={`h-2 w-2 rounded-full ${index < filled ? 'bg-accent' : 'border border-white/20'}`}
        />
      ))}
    </div>
  );
};
