import React from 'react';
import type { InternalClockProps } from '@/shared/types/contracts';
import { formatClock } from '../lib/formatClock';
import { CLOCK_SCALE_STYLE, CLOCK_TEXT_STYLE } from './clockText';

const SIZE = 280;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Offset proportional to the share of time left, so it decreases evenly as the session runs (AC-10.2). */
export function ringOffset(remainingSeconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, remainingSeconds / totalSeconds));
  return RING_CIRCUMFERENCE * ratio;
}

export const CircularRingClock: React.FC<
  Pick<InternalClockProps, 'remainingSeconds' | 'totalSeconds' | 'sessionType'>
> = ({ remainingSeconds, totalSeconds, sessionType }) => {
  const showRing = sessionType !== 'stopwatch' && totalSeconds > 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE, ...CLOCK_SCALE_STYLE }}>
      {showRing && (
        <svg
          data-testid="clock-ring"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 -rotate-90"
          aria-hidden="true"
        >
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-white/10" />
          <circle
            data-testid="clock-ring-progress"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            stroke="var(--color-accent)"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={ringOffset(remainingSeconds, totalSeconds)}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none"
          />
        </svg>
      )}
      <span data-testid="clock-time" role="timer" className="relative text-6xl tracking-tighter" style={CLOCK_TEXT_STYLE}>
        {formatClock(remainingSeconds)}
      </span>
    </div>
  );
};
