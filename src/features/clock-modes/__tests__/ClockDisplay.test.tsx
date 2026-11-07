import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/shared/lib/web-audio', () => ({
  initAudioContext: vi.fn().mockResolvedValue(undefined),
  setMasterVolume: vi.fn(),
  playChime: vi.fn(),
}));
vi.mock('@/core/timer/completion', () => ({
  onSessionCompleted: vi.fn(),
  requestNotificationPermission: vi.fn(),
}));

import { useSettingsStore } from '@/core/data/useSettingsStore';
import { useTimerStore } from '@/core/timer/useTimerStore';
import { useUiStore } from '@/core/ui/useUiStore';
import { ClockDisplay, ClockSettingsPopover } from '../index';
import { NARROW_SCREEN_QUERY } from '../hooks/useMediaQuery';
import { mockMediaQueries, resetStores } from './testUtils';

function setPreferences(patch: Record<string, string>) {
  useSettingsStore.setState((state) => ({ settings: { ...state.settings, ...patch } }));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  resetStores();
});
afterEach(() => {
  useTimerStore.getState().reset();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ClockDisplay', () => {
  it('AC-04.1: shows 25:00 labelled Focus inside the capsule, with the cycle dots', () => {
    render(<ClockDisplay />);
    expect(screen.getByTestId('clock-capsule')).toHaveAttribute('data-position', 'center');
    expect(screen.getByTestId('clock-time')).toHaveTextContent('25:00');
    expect(screen.getByTestId('session-label')).toHaveTextContent('Focus');
    expect(screen.getByTestId('capsule-cycle-dots')).toHaveAttribute('aria-label', '0 of 4 focus sessions done in this cycle');
  });

  it('AC-04.2: the mode tabs switch presets', () => {
    render(<ClockDisplay />);
    fireEvent.click(screen.getByTestId('mode-52_17'));
    expect(screen.getByTestId('clock-time')).toHaveTextContent('52:00');
    fireEvent.click(screen.getByTestId('mode-deep_work'));
    expect(screen.getByTestId('clock-time')).toHaveTextContent('90:00');
    expect(screen.getByTestId('mode-deep_work')).toHaveAttribute('aria-selected', 'true');
  });

  it('start, pause, resume and reset drive the timer', () => {
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
  });

  it('Skip moves to the short break', () => {
    render(<ClockDisplay />);
    fireEvent.click(screen.getByTestId('skip-btn'));
    expect(screen.getByTestId('session-label')).toHaveTextContent('Short Break');
    expect(screen.getByTestId('clock-time')).toHaveTextContent('05:00');
  });

  it('AC-04.3: stopwatch counts up, has no Skip button and no cycle dots', () => {
    render(<ClockDisplay />);
    fireEvent.click(screen.getByTestId('mode-stopwatch'));
    expect(screen.queryByTestId('skip-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('capsule-cycle-dots')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('start-pause-btn'));
    act(() => {
      vi.advanceTimersByTime(2_010);
    });
    expect(screen.getByTestId('clock-time')).toHaveTextContent('00:02');
  });

  it.each([
    ['minimal', 'clock-time'],
    ['circular_ring', 'clock-ring'],
    ['retro_flip', 'flip-card-0'],
  ])('FR-10: renders the %s style', (mode, testId) => {
    setPreferences({ clockVisualMode: mode });
    render(<ClockDisplay />);
    expect(screen.getByTestId('clock-capsule')).toHaveAttribute('data-visual-mode', mode);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('AC-11.1: Mini Corner moves a compact capsule to the bottom-right corner', () => {
    setPreferences({ clockPosition: 'mini_corner', clockVisualMode: 'circular_ring' });
    render(<ClockDisplay />);
    const capsule = screen.getByTestId('clock-capsule');
    expect(capsule).toHaveAttribute('data-position', 'mini_corner');
    expect(capsule.className).toContain('fixed');
    expect(capsule.className).toContain('right-4');
    expect(capsule.className).toContain('max-w-[240px]');
    expect(capsule.className).toContain('max-h-[80px]');
    expect(screen.queryByTestId('clock-ring')).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('start-pause-btn'));
    expect(useTimerStore.getState().status).toBe('running');
  });

  it('plan A4: phones keep the clock in the center', () => {
    mockMediaQueries([NARROW_SCREEN_QUERY]);
    setPreferences({ clockPosition: 'mini_corner' });
    render(<ClockDisplay />);
    expect(screen.getByTestId('clock-capsule')).toHaveAttribute('data-position', 'center');
  });

  it("plan A3: a stored 'zen' position is shown as Center", () => {
    setPreferences({ clockPosition: 'zen' });
    render(<ClockDisplay />);
    expect(screen.getByTestId('clock-capsule')).toHaveAttribute('data-position', 'center');
  });

  it('AC-11.2: Zen fades out every control but keeps the clock', () => {
    useUiStore.setState({ isZen: true });
    render(<ClockDisplay />);

    expect(screen.getByTestId('clock-time')).toBeVisible();
    const controls = screen.getByTestId('start-pause-btn').parentElement as HTMLElement;
    expect(controls.className).toContain('opacity-0');
    expect(controls.className).toContain('pointer-events-none');
    expect(controls.className).toContain('duration-300');
    expect(controls).toHaveAttribute('inert');
  });

  it('Zen also hides the controls of the Mini Corner capsule', () => {
    useUiStore.setState({ isZen: true });
    setPreferences({ clockPosition: 'mini_corner' });
    render(<ClockDisplay />);
    const controls = screen.getByTestId('start-pause-btn').parentElement as HTMLElement;
    expect(controls.className).toContain('opacity-0');
  });

  it('the gear button opens the settings popover (both positions)', () => {
    render(
      <>
        <ClockDisplay />
        <ClockSettingsPopover />
      </>,
    );
    fireEvent.click(screen.getByTestId('clock-settings-btn'));
    expect(screen.getByTestId('clock-settings-popover')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close timer settings'));
    act(() => setPreferences({ clockPosition: 'mini_corner' }));
    fireEvent.click(screen.getByTestId('clock-settings-btn'));
    expect(useUiStore.getState().isClockSettingsOpen).toBe(true);
  });

  it('follows the media query when the window is resized', () => {
    let listener: (() => void) | null = null;
    let narrow = false;
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        get matches() {
          return query === NARROW_SCREEN_QUERY && narrow;
        },
        media: query,
        addEventListener: (_: string, fn: () => void) => {
          if (query === NARROW_SCREEN_QUERY) listener = fn;
        },
        removeEventListener: vi.fn(),
      })),
    );
    setPreferences({ clockPosition: 'mini_corner' });
    render(<ClockDisplay />);
    expect(screen.getByTestId('clock-capsule')).toHaveAttribute('data-position', 'mini_corner');

    narrow = true;
    act(() => listener?.());
    expect(screen.getByTestId('clock-capsule')).toHaveAttribute('data-position', 'center');
  });
});
