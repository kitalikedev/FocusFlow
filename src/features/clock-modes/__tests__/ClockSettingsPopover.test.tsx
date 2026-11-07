import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/shared/lib/web-audio', () => ({
  initAudioContext: vi.fn().mockResolvedValue(undefined),
  setMasterVolume: vi.fn(),
  playChime: vi.fn(),
}));

import { useSettingsStore } from '@/core/data/useSettingsStore';
import { useTimerStore } from '@/core/timer/useTimerStore';
import { useUiStore } from '@/core/ui/useUiStore';
import { ClockSettingsPopover } from '../components/ClockSettingsPopover';
import { resetStores } from './testUtils';

function open() {
  useUiStore.setState({ isClockSettingsOpen: true });
  return render(<ClockSettingsPopover />);
}
const input = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
const save = () => screen.getByTestId('clock-settings-save');

beforeEach(() => {
  resetStores();
});
afterEach(() => {
  useTimerStore.getState().reset();
});

describe('ClockSettingsPopover (FR-12)', () => {
  it('renders nothing while closed', () => {
    const { container } = render(<ClockSettingsPopover />);
    expect(container).toBeEmptyDOMElement();
  });

  it('starts from the current timer values', () => {
    useTimerStore.getState().updateSettings({
      durations: { focus: 3120, shortBreak: 1020, longBreak: 1200 },
      longBreakInterval: 3,
      autoStartBreaks: true,
    });
    open();
    expect(input('Focus').value).toBe('52');
    expect(input('Short Break').value).toBe('17');
    expect(input('Long Break').value).toBe('20');
    expect(input('Long break every').value).toBe('3');
    expect(screen.getByTestId('auto-start-breaks')).toBeChecked();
    expect(screen.getByTestId('auto-start-focus')).not.toBeChecked();
  });

  it('AC-12.1: saving 45 minutes shows 45:00 at once on an idle timer', () => {
    open();
    fireEvent.change(input('Focus'), { target: { value: '45' } });
    fireEvent.click(save());

    expect(useTimerStore.getState()).toMatchObject({ remainingSeconds: 2700, mode: 'custom' });
    expect(useTimerStore.getState().durations.focus).toBe(2700);
    expect(useUiStore.getState().isClockSettingsOpen).toBe(false);
  });

  it.each(['0', '-10', '181', ''])('AC-12.2: "%s" shows the warning and disables Save', (value) => {
    open();
    fireEvent.change(input('Focus'), { target: { value } });

    expect(input('Focus')).toHaveAttribute('aria-invalid', 'true');
    expect(input('Focus').className).toContain('border-red-500');
    expect(screen.getByRole('alert')).toHaveTextContent('Must be between 1 and 180 mins');
    expect(save()).toBeDisabled();

    fireEvent.submit(screen.getByTestId('clock-settings-popover'));
    expect(useTimerStore.getState().durations.focus).toBe(1500);
  });

  it('validates the long break interval (1..24)', () => {
    open();
    fireEvent.change(input('Long break every'), { target: { value: '25' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Must be between 1 and 24 sessions');
    expect(save()).toBeDisabled();
  });

  it('FR-05: saves the long break interval and both auto-start switches', () => {
    open();
    fireEvent.change(input('Long break every'), { target: { value: '2' } });
    fireEvent.click(screen.getByTestId('auto-start-breaks'));
    fireEvent.click(screen.getByTestId('auto-start-focus'));
    fireEvent.click(save());

    expect(useTimerStore.getState()).toMatchObject({
      longBreakInterval: 2,
      autoStartBreaks: true,
      autoStartFocus: true,
    });
  });

  it('changes the clock style and position at once and saves them', async () => {
    open();
    await act(async () => {
      fireEvent.click(screen.getByTestId('visual-retro_flip'));
      fireEvent.click(screen.getByTestId('position-mini_corner'));
    });

    expect(useSettingsStore.getState().settings).toMatchObject({
      clockVisualMode: 'retro_flip',
      clockPosition: 'mini_corner',
    });
    expect(screen.getByTestId('visual-retro_flip')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('position-mini_corner')).toHaveAttribute('aria-pressed', 'true');
    // Persisted through the repository (guest: localStorage).
    expect(JSON.parse(localStorage.getItem('focusflow_settings') ?? '{}')).toMatchObject({
      clockVisualMode: 'retro_flip',
      clockPosition: 'mini_corner',
    });
  });

  it('closes with Escape, the close button or a click outside, without saving', () => {
    const first = open();
    fireEvent.change(input('Focus'), { target: { value: '45' } });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useUiStore.getState().isClockSettingsOpen).toBe(false);
    expect(useTimerStore.getState().durations.focus).toBe(1500);
    first.unmount();

    const second = open();
    fireEvent.click(screen.getByLabelText('Close timer settings'));
    expect(useUiStore.getState().isClockSettingsOpen).toBe(false);
    second.unmount();

    open();
    fireEvent.mouseDown(screen.getByTestId('clock-settings-popover').parentElement as HTMLElement);
    expect(useUiStore.getState().isClockSettingsOpen).toBe(false);
  });

  it('a click inside the panel does not close it', () => {
    open();
    fireEvent.mouseDown(screen.getByTestId('clock-settings-popover'));
    expect(useUiStore.getState().isClockSettingsOpen).toBe(true);
  });

  it('focuses the first field when opened', () => {
    open();
    expect(document.activeElement).toBe(input('Focus'));
  });
});
