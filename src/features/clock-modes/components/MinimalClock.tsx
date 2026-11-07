import React from 'react';
import type { InternalClockProps } from '@/shared/types/contracts';
import { formatClock } from '../lib/formatClock';
import { CLOCK_SCALE_STYLE, CLOCK_TEXT_STYLE } from './clockText';

/** AC-10.1: plain large digits, no ring and no flip cards. */
export const MinimalClock: React.FC<Pick<InternalClockProps, 'remainingSeconds' | 'position'>> = ({
  remainingSeconds,
  position,
}) => (
  <span
    data-testid="clock-time"
    role="timer"
    className={
      position === 'mini_corner'
        ? 'text-3xl tracking-tight'
        : 'text-7xl tracking-tighter sm:text-8xl lg:text-9xl'
    }
    style={{ ...CLOCK_TEXT_STYLE, ...(position === 'mini_corner' ? {} : CLOCK_SCALE_STYLE), display: 'inline-block' }}
  >
    {formatClock(remainingSeconds)}
  </span>
);
