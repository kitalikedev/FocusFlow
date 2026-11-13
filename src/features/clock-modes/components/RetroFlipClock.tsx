import React, { useEffect, useRef, useState } from 'react';
import type { InternalClockProps } from '@/shared/types/contracts';
import { formatClock } from '../lib/formatClock';
import { REDUCED_MOTION_QUERY, useMediaQuery } from '@/core/ui/useMediaQuery';
import { CLOCK_SCALE_STYLE, CLOCK_TEXT_STYLE } from './clockText';
import './retroFlip.css';

export const FLIP_DURATION_MS = 300;

const FlipCard: React.FC<{ value: string; index: number; animate: boolean }> = ({ value, index, animate }) => {
  const [previous, setPrevious] = useState<string | null>(null);
  const lastValue = useRef(value);

  useEffect(() => {
    if (value === lastValue.current) return;
    const old = lastValue.current;
    lastValue.current = value;
    if (!animate) return;
    setPrevious(old);
    const timeout = setTimeout(() => setPrevious(null), FLIP_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [value, animate]);

  const isFlipping = previous !== null;

  return (
    <span data-testid={`flip-card-${index}`} data-flipping={isFlipping} className="ff-flip-card">
      <span className="ff-flip-half ff-flip-top" aria-hidden="true">
        <span>{value}</span>
      </span>
      <span className="ff-flip-half ff-flip-bottom" aria-hidden="true">
        <span>{value}</span>
      </span>
      {isFlipping && (
        <span className="ff-flip-half ff-flip-top ff-flip-flap" aria-hidden="true">
          <span>{previous}</span>
        </span>
      )}
    </span>
  );
};

/** AC-10.3: digital cards that flip in 300ms whenever a digit changes. */
export const RetroFlipClock: React.FC<Pick<InternalClockProps, 'remainingSeconds'>> = ({ remainingSeconds }) => {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const text = formatClock(remainingSeconds);
  const [minutes, seconds] = text.split(':');

  return (
    <span
      data-testid="clock-time"
      role="timer"
      aria-label={text}
      className="inline-flex items-center gap-1 text-7xl"
      style={{ ...CLOCK_TEXT_STYLE, ...CLOCK_SCALE_STYLE }}
    >
      {minutes.split('').map((digit, i) => (
        <FlipCard key={`m${minutes.length - i}`} index={i} value={digit} animate={!reducedMotion} />
      ))}
      <span aria-hidden="true" className="px-1">
        :
      </span>
      {seconds.split('').map((digit, i) => (
        <FlipCard
          key={`s${i}`}
          index={minutes.length + i}
          value={digit}
          animate={!reducedMotion}
        />
      ))}
      <span className="sr-only">{text}</span>
    </span>
  );
};
