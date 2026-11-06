import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/shared/lib/web-audio', () => ({
  initAudioContext: vi.fn().mockResolvedValue(undefined),
  toggleMasterMute: vi.fn(),
}));

import { HudSlot } from '../HudSlot';
import { useUiStore, watchFullscreen } from '../../ui/useUiStore';
import { useAuthStore } from '../../auth/useAuthStore';
import { useFocusSessionsStore } from '../../data/useFocusSessionsStore';
import { useSyncStatusStore, watchConnectivity } from '../../data/useSyncStatusStore';
import { createInitialTimerState, useTimerStore } from '../../timer/useTimerStore';

let requestFullscreen: ReturnType<typeof vi.fn>;

function session(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return { id: crypto.randomUUID(), durationMinutes: 25, completedAt: date.toISOString() };
}

beforeEach(() => {
  requestFullscreen = vi.fn().mockResolvedValue(undefined);
  document.documentElement.requestFullscreen = requestFullscreen as unknown as typeof document.documentElement.requestFullscreen;
  useUiStore.setState({ isZen: false, isFullscreen: false });
  useAuthStore.setState({ user: null, isGuest: true, isConfigured: true });
  useTimerStore.setState(createInitialTimerState());
  useFocusSessionsStore.setState({ sessions: [] });
  useSyncStatusStore.setState({ isOnline: true, pendingWrites: 0 });
});
afterEach(() => {
  Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
  Object.defineProperty(document, 'fullscreenEnabled', { value: undefined, configurable: true });
});

describe('HudSlot', () => {
  it('renders brand, cycle dots, session counter, streak badge and fullscreen button', () => {
    render(<HudSlot />);

    expect(screen.getByText('FocusFlow')).toBeInTheDocument();
    expect(screen.getAllByTestId(/cycle-dot-/)).toHaveLength(4);
    expect(screen.getByTestId('sessions-today')).toHaveTextContent('0 today');
    expect(screen.getByTestId('streak-badge')).toHaveTextContent('0');
    expect(screen.getByTestId('fullscreen-btn')).toBeInTheDocument();
  });

  it('AC-30.1: 2 of 4 dots are lit after two focus sessions', () => {
    useTimerStore.setState({ cyclesCompleted: 2, sessionType: 'short_break' });
    render(<HudSlot />);
    const dots = screen.getAllByTestId(/cycle-dot-/);
    expect(dots.map((dot) => dot.getAttribute('data-filled'))).toEqual(['true', 'true', 'false', 'false']);
    expect(screen.getByTestId('cycle-dots')).toHaveAttribute('aria-label', '2 of 4 focus sessions done in this cycle');
  });

  it('follows a custom long break interval and fills every dot during the long break', () => {
    useTimerStore.setState({ longBreakInterval: 3, cyclesCompleted: 3, sessionType: 'long_break' });
    render(<HudSlot />);
    const dots = screen.getAllByTestId(/cycle-dot-/);
    expect(dots).toHaveLength(3);
    expect(dots.every((dot) => dot.getAttribute('data-filled') === 'true')).toBe(true);
  });

  it('shows the real session count and streak', () => {
    useFocusSessionsStore.setState({ sessions: [session(0), session(0), session(1)] });
    render(<HudSlot />);
    expect(screen.getByTestId('sessions-today')).toHaveTextContent('2 today');
    expect(screen.getByTestId('streak-badge')).toHaveTextContent('2');
  });

  it('updates live when a session is added', () => {
    render(<HudSlot />);
    act(() => useFocusSessionsStore.getState().add(session(0)));
    expect(screen.getByTestId('sessions-today')).toHaveTextContent('1 today');
  });

  it('AC-30.3: the fullscreen button requests fullscreen and the state follows the browser event', () => {
    const stop = watchFullscreen();
    render(<HudSlot />);

    fireEvent.click(screen.getByTestId('fullscreen-btn'));
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(useUiStore.getState().isFullscreen).toBe(false); // not until the browser confirms

    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, configurable: true });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(screen.getByTestId('fullscreen-btn')).toHaveAttribute('title', 'Exit Fullscreen (Shift+F)');
    stop();
  });

  it('hides the fullscreen button where the browser cannot do it', () => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: false, configurable: true });
    render(<HudSlot />);
    expect(screen.queryByTestId('fullscreen-btn')).not.toBeInTheDocument();
  });

  it('shows the Login button for guests (FR-01 entry point)', () => {
    render(<HudSlot />);
    expect(screen.getByTestId('login-btn')).toBeInTheDocument();
  });

  it('shows the account menu for signed-in users', () => {
    useAuthStore.setState({ user: { id: 'u1', email: 'a@b.co' }, isGuest: false });
    render(<HudSlot />);
    expect(screen.getByTestId('account-btn')).toBeInTheDocument();
  });

  it('renders nothing when isZen is true', () => {
    useUiStore.setState({ isZen: true });
    const { container } = render(<HudSlot />);
    expect(container.firstChild).toBeNull();
  });
});

describe('sync indicator (AC-30.2, plan Q7)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: { id: 'u1', email: 'a@b.co' }, isGuest: false });
  });

  it('is hidden for guests', () => {
    useAuthStore.setState({ user: null, isGuest: true });
    render(<HudSlot />);
    expect(screen.queryByTestId('sync-indicator')).not.toBeInTheDocument();
  });

  it('shows Synced for a signed-in user that is online', () => {
    render(<HudSlot />);
    expect(screen.getByTestId('sync-indicator')).toHaveAttribute('data-status', 'synced');
    expect(screen.getByTestId('sync-indicator')).toHaveAttribute('title', 'Synced');
  });

  it('shows Syncing while a write is in flight', () => {
    useSyncStatusStore.setState({ pendingWrites: 1 });
    render(<HudSlot />);
    expect(screen.getByTestId('sync-indicator')).toHaveAttribute('data-status', 'syncing');
  });

  it('switches to Offline as soon as the window goes offline', () => {
    const stop = watchConnectivity();
    render(<HudSlot />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    const indicator = screen.getByTestId('sync-indicator');
    expect(indicator).toHaveAttribute('data-status', 'offline');
    expect(indicator).toHaveAttribute('title', 'Offline — changes saved locally');

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.getByTestId('sync-indicator')).toHaveAttribute('data-status', 'synced');
    stop();
  });
});
