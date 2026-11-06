import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HudSlot } from '../HudSlot';
import { useUiStore } from '../../ui/useUiStore';
import { useAuthStore } from '../../auth/useAuthStore';

describe('HudSlot', () => {
  beforeEach(() => {
    useUiStore.setState({
      isZen: false,
      isFullscreen: false,
    });
    useAuthStore.setState({ user: null, isGuest: true, isConfigured: true });
  });

  it('renders brand, 4 cycle dots, streak badge, and fullscreen button', () => {
    render(<HudSlot />);

    expect(screen.getByText('FocusFlow')).toBeInTheDocument();
    expect(screen.getByTestId('cycle-dots')).toBeInTheDocument();
    expect(screen.getAllByTestId(/cycle-dot-/)).toHaveLength(4);
    expect(screen.getByTestId('streak-badge')).toBeInTheDocument();
    expect(screen.getByTestId('fullscreen-btn')).toBeInTheDocument();
  });

  it('toggles fullscreen state when button is clicked', () => {
    render(<HudSlot />);
    const btn = screen.getByTestId('fullscreen-btn');

    expect(useUiStore.getState().isFullscreen).toBe(false);
    fireEvent.click(btn);
    expect(useUiStore.getState().isFullscreen).toBe(true);
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
