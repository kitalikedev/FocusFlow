import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useUiStore } from '@/core/ui/useUiStore';
import { EXIT_ZEN_HIDE_DELAY_MS, ExitZenButton } from '../components/ExitZenButton';

beforeEach(() => {
  vi.useFakeTimers();
  useUiStore.setState({ isZen: true });
});
afterEach(() => {
  vi.useRealTimers();
});

const exitButton = () => screen.queryByRole('button', { name: 'Exit Zen' });

describe('ExitZenButton (AC-11.2)', () => {
  it('stays hidden until the mouse moves, then fades out again after 3 seconds', () => {
    render(<ExitZenButton />);
    expect(exitButton()).not.toBeInTheDocument();
    expect(screen.getByTestId('exit-zen-btn')).toHaveClass('opacity-0', 'pointer-events-none');

    fireEvent.mouseMove(window);
    expect(exitButton()).toBeInTheDocument();
    expect(screen.getByTestId('exit-zen-btn')).toHaveClass('opacity-100');

    act(() => {
      vi.advanceTimersByTime(EXIT_ZEN_HIDE_DELAY_MS);
    });
    expect(exitButton()).not.toBeInTheDocument();
    expect(screen.getByTestId('exit-zen-btn')).toHaveClass('opacity-0');
  });

  it('appears on touch and leaves Zen when clicked', () => {
    render(<ExitZenButton />);
    fireEvent.touchStart(window);
    fireEvent.click(screen.getByRole('button', { name: 'Exit Zen' }));
    expect(useUiStore.getState().isZen).toBe(false);
    expect(screen.queryByTestId('exit-zen-btn')).not.toBeInTheDocument();
  });

  it('keeps showing while the mouse keeps moving', () => {
    render(<ExitZenButton />);
    fireEvent.mouseMove(window);
    act(() => {
      vi.advanceTimersByTime(EXIT_ZEN_HIDE_DELAY_MS - 500);
    });
    fireEvent.mouseMove(window);
    act(() => {
      vi.advanceTimersByTime(EXIT_ZEN_HIDE_DELAY_MS - 500);
    });
    expect(exitButton()).toBeInTheDocument();
  });

  it('ignores mouse movement outside Zen mode', () => {
    useUiStore.setState({ isZen: false });
    render(<ExitZenButton />);
    fireEvent.mouseMove(window);
    expect(screen.queryByTestId('exit-zen-btn')).not.toBeInTheDocument();
  });
});
