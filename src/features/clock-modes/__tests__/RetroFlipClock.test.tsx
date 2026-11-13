import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { FLIP_DURATION_MS, RetroFlipClock } from '../components/RetroFlipClock';
import { REDUCED_MOTION_QUERY } from '@/core/ui/useMediaQuery';
import { mockMediaQueries } from './testUtils';

beforeEach(() => {
  vi.useFakeTimers();
  mockMediaQueries([]);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function flipping(): string[] {
  return screen
    .getAllByTestId(/flip-card-/)
    .filter((card) => card.getAttribute('data-flipping') === 'true')
    .map((card) => card.getAttribute('data-testid') as string);
}

describe('RetroFlipClock (AC-10.3)', () => {
  it('splits every digit into a card and labels the time for screen readers', () => {
    render(<RetroFlipClock remainingSeconds={1500} />);
    expect(screen.getAllByTestId(/flip-card-/)).toHaveLength(4);
    expect(screen.getByTestId('clock-time')).toHaveAttribute('aria-label', '25:00');
  });

  it('flips only the digits that changed, for 300ms', () => {
    const { rerender } = render(<RetroFlipClock remainingSeconds={1500} />);
    expect(flipping()).toEqual([]);

    rerender(<RetroFlipClock remainingSeconds={1499} />); // 25:00 -> 24:59
    expect(flipping()).toEqual(['flip-card-1', 'flip-card-2', 'flip-card-3']);

    act(() => {
      vi.advanceTimersByTime(FLIP_DURATION_MS);
    });
    expect(flipping()).toEqual([]);
  });

  it('does not animate when the user prefers reduced motion', () => {
    mockMediaQueries([REDUCED_MOTION_QUERY]);
    const { rerender } = render(<RetroFlipClock remainingSeconds={1500} />);
    rerender(<RetroFlipClock remainingSeconds={1499} />);
    expect(flipping()).toEqual([]);
    expect(screen.getByTestId('clock-time')).toHaveAttribute('aria-label', '24:59');
  });

  it('keeps working when minutes grow to three digits', () => {
    render(<RetroFlipClock remainingSeconds={10800} />);
    expect(screen.getAllByTestId(/flip-card-/)).toHaveLength(5);
  });
});
