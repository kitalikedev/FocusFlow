import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircularRingClock, RING_CIRCUMFERENCE, ringOffset } from '../components/CircularRingClock';

describe('ringOffset (AC-10.2)', () => {
  it('is proportional to the share of time left', () => {
    expect(ringOffset(1500, 1500)).toBeCloseTo(RING_CIRCUMFERENCE);
    expect(ringOffset(750, 1500)).toBeCloseTo(RING_CIRCUMFERENCE / 2);
    expect(ringOffset(0, 1500)).toBe(0);
  });

  it('clamps out-of-range values and handles a zero total', () => {
    expect(ringOffset(2000, 1500)).toBeCloseTo(RING_CIRCUMFERENCE);
    expect(ringOffset(-5, 1500)).toBe(0);
    expect(ringOffset(10, 0)).toBe(0);
  });
});

describe('CircularRingClock', () => {
  it('draws the progress ring around the time and lowers the offset as time passes', () => {
    const { rerender } = render(<CircularRingClock remainingSeconds={1500} totalSeconds={1500} sessionType="focus" />);
    const progress = screen.getByTestId('clock-ring-progress');
    const start = Number(progress.getAttribute('stroke-dashoffset'));
    expect(screen.getByTestId('clock-time')).toHaveTextContent('25:00');

    rerender(<CircularRingClock remainingSeconds={375} totalSeconds={1500} sessionType="focus" />);
    const later = Number(screen.getByTestId('clock-ring-progress').getAttribute('stroke-dashoffset'));
    expect(later).toBeLessThan(start);
    expect(later).toBeCloseTo(start / 4);
  });

  it('shows no ring for the stopwatch', () => {
    render(<CircularRingClock remainingSeconds={42} totalSeconds={0} sessionType="stopwatch" />);
    expect(screen.queryByTestId('clock-ring')).not.toBeInTheDocument();
    expect(screen.getByTestId('clock-time')).toHaveTextContent('00:42');
  });
});
