import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { DemoTimer } from '../pages/DemoTimer';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('DemoTimer on the home page', () => {
  it('counts down after Start, pauses, and resets to the mode length', () => {
    render(<DemoTimer />);
    const clock = screen.getByTestId('demo-clock');
    expect(clock).toHaveTextContent('25:00');

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    act(() => vi.advanceTimersByTime(3000));
    expect(clock).toHaveTextContent('24:57');

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(clock).toHaveTextContent('24:57');

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(clock).toHaveTextContent('25:00');
  });

  it('switches mode, stops the countdown and shows the new length', () => {
    render(<DemoTimer />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(screen.getByRole('button', { name: '52/17' }));

    expect(screen.getByRole('button', { name: '52/17' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('demo-clock')).toHaveTextContent('52:00');
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTestId('demo-clock')).toHaveTextContent('52:00');
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });
});
