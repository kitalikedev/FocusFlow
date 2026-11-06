import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/shared/lib/web-audio', () => ({
  initAudioContext: vi.fn().mockResolvedValue(undefined),
  playChime: vi.fn(),
}));
vi.mock('@/core/timer/completion', () => ({
  onSessionCompleted: vi.fn(),
  requestNotificationPermission: vi.fn(),
}));

import { createInitialTimerState, useTimerStore } from '@/core/timer/useTimerStore';
import { ClockDisplay, ClockSettingsPopover, formatClock } from '../ClockDisplay';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  useTimerStore.getState().reset();
  useTimerStore.setState(createInitialTimerState());
});
afterEach(() => {
  useTimerStore.getState().reset();
  vi.useRealTimers();
});

describe('formatClock', () => {
  it('pads minutes and seconds and allows more than 59 minutes', () => {
    expect(formatClock(1500)).toBe('25:00');
    expect(formatClock(5400)).toBe('90:00');
    expect(formatClock(9)).toBe('00:09');
    expect(formatClock(-4)).toBe('00:00');
    expect(formatClock(59.9)).toBe('00:59');
  });
});

describe('ClockDisplay', () => {
  it('AC-04.1: shows 25:00 labelled Focus inside the capsule', () => {
    render(<ClockDisplay />);
    expect(screen.getByTestId('clock-capsule')).toBeInTheDocument();
    expect(screen.getByTestId('clock-time')).toHaveTextContent('25:00');
    expect(screen.getByTestId('session-label')).toHaveTextContent('Focus');
  });

  it('AC-04.2: choosing a preset changes the time', () => {
    render(<ClockDisplay />);
    fireEvent.click(screen.getByTestId('mode-52_17'));
    expect(screen.getByTestId('clock-time')).toHaveTextContent('52:00');
    fireEvent.click(screen.getByTestId('mode-deep_work'));
    expect(screen.getByTestId('clock-time')).toHaveTextContent('90:00');
    expect(screen.getByTestId('mode-deep_work')).toHaveAttribute('aria-selected', 'true');
  });

  it('start / pause / resume / reset buttons drive the timer', () => {
    render(<ClockDisplay />);
    const button = screen.getByTestId('start-pause-btn');
    expect(button).toHaveTextContent('Start');

    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(3_010);
    });
    expect(screen.getByTestId('clock-time')).toHaveTextContent('24:57');
    expect(button).toHaveTextContent('Pause');

    fireEvent.click(button);
    expect(button).toHaveTextContent('Resume');

    fireEvent.click(screen.getByTestId('reset-btn'));
    expect(screen.getByTestId('clock-time')).toHaveTextContent('25:00');
    expect(button).toHaveTextContent('Start');
  });

  it('AC-04.3: stopwatch counts up from 00:00 and has no Skip button', () => {
    render(<ClockDisplay />);
    fireEvent.click(screen.getByTestId('mode-stopwatch'));
    expect(screen.queryByTestId('skip-btn')).not.toBeInTheDocument();
    expect(screen.getByTestId('clock-time')).toHaveTextContent('00:00');

    fireEvent.click(screen.getByTestId('start-pause-btn'));
    act(() => {
      vi.advanceTimersByTime(2_010);
    });
    expect(screen.getByTestId('clock-time')).toHaveTextContent('00:02');
  });

  it('Skip moves to the short break', () => {
    render(<ClockDisplay />);
    fireEvent.click(screen.getByTestId('skip-btn'));
    expect(screen.getByTestId('session-label')).toHaveTextContent('Short Break');
    expect(screen.getByTestId('clock-time')).toHaveTextContent('05:00');
  });

  it('settings popover is still a stub for package 3A', () => {
    const { container } = render(<ClockSettingsPopover />);
    expect(container).toBeEmptyDOMElement();
  });
});
