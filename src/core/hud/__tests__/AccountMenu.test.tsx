import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useToastStore } from '@/core/ui/useToastStore';
import { AccountMenu } from '../AccountMenu';

vi.mock('@/shared/lib/supabase');

describe('AccountMenu', () => {
  const logout = vi.fn();

  beforeEach(() => {
    logout.mockReset().mockResolvedValue(undefined);
    useToastStore.setState({ toasts: [] });
    useAuthStore.setState({
      user: null,
      isGuest: true,
      isConfigured: true,
      isAuthModalOpen: false,
      logout,
    });
  });

  it('guests see a Login button that opens the sign in dialog', () => {
    render(<AccountMenu />);
    fireEvent.click(screen.getByTestId('login-btn'));
    expect(useAuthStore.getState()).toMatchObject({ isAuthModalOpen: true, authModalTab: 'signIn' });
  });

  it('disables Login with an explanation when Supabase is not configured', () => {
    useAuthStore.setState({ isConfigured: false });
    render(<AccountMenu />);
    const button = screen.getByTestId('login-btn');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'Cloud sync unavailable');
  });

  it('signed-in users see their email and can log out (AC-01.3)', () => {
    useAuthStore.setState({ user: { id: 'u1', email: 'a@b.co' }, isGuest: false });
    render(<AccountMenu />);
    expect(screen.queryByTestId('login-btn')).toBeNull();
    expect(screen.getByText('a@b.co')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.click(screen.getByTestId('account-btn'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Log Out' }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes the menu with Escape and toggles it by clicking the account button', () => {
    useAuthStore.setState({ user: { id: 'u1', email: 'a@b.co' }, isGuest: false });
    render(<AccountMenu />);
    const button = screen.getByTestId('account-btn');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(window, { key: 'a' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
