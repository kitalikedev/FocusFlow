import React from 'react';
import { useTimerStore } from '@/core/timer/useTimerStore';
import type { ClockPosition, ClockVisualMode } from '../hooks/useClockPreferences';
import { CircularRingClock } from './CircularRingClock';
import { MinimalClock } from './MinimalClock';
import { RetroFlipClock } from './RetroFlipClock';

/**
 * The only component that subscribes to the per-second value, so the capsule and the layout
 * never re-render on a tick (ARCHITECTURE 11.2). Mini Corner always uses compact digits.
 */
export const ClockFace: React.FC<{
  visualMode: ClockVisualMode;
  position: ClockPosition;
  /** Fades the ring out (Zen with "only the time"); the digits stay. */
  hideRing?: boolean;
}> = ({ visualMode, position, hideRing = false }) => {
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds);
  const totalSeconds = useTimerStore((state) => state.sessionSeconds);
  const sessionType = useTimerStore((state) => state.sessionType);

  if (position === 'mini_corner' || visualMode === 'minimal') {
    return <MinimalClock remainingSeconds={remainingSeconds} position={position} />;
  }
  if (visualMode === 'circular_ring') {
    return (
      <CircularRingClock
        remainingSeconds={remainingSeconds}
        totalSeconds={totalSeconds}
        sessionType={sessionType}
        hideRing={hideRing}
      />
    );
  }
  return <RetroFlipClock remainingSeconds={remainingSeconds} />;
};
