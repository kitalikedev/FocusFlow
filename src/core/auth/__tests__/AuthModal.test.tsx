import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppError } from '@/shared/lib/errors';
import { AuthModal } from '../AuthModal';
import { useAuthStore } from '../useAuthStore';

vi.mock('@/shared/lib/supabase');

function open(tab: 'signIn' | 'signUp' = 'signIn'): void {
  useAuthStore.setState({
    isAuthModalOpen: true,
    authModalTab: tab,
    authError: null,
    isSubmitting: false,
  });
}

function fill(email: string, password: string): void {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
}

describe('AuthModal', () => {
  const login = vi.fn();
  const signUp = vi.fn();

  beforeEach(() => {
    login.mockReset().mockResolvedValue(undefined);
    signUp.mockReset().mockResolvedValue(undefined);
    useAuthStore.setState({ isAuthModalOpen: false, loginWithPassword: login, signUpWithPassword: signUp });
  });

  it('renders nothing while closed', () => {
    render(<AuthModal />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the sign in form with accessible tabs', () => {
    open();
    render(<AuthModal />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sign In' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Sign In', hidden: false })).toBeInTheDocument();
  });

  it('switches to the Sign Up tab', () => {
    open();
    render(<AuthModal />);
    fireEvent.click(screen.getByRole('tab', { name: 'Sign Up' }));
    expect(useAuthStore.getState().authModalTab).toBe('signUp');
  });

  it('shows Create Account on the sign up tab', () => {
    open('signUp');
    render(<AuthModal />);
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('validates the email format before submitting', () => {
    open();
    render(<AuthModal />);
    fill('not-an-email', '123456');
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.');
    expect(login).not.toHaveBeenCalled();
  });

  it('requires at least 6 characters for the password', () => {
    open('signUp');
    render(<AuthModal />);
    fill('a@b.co', '12345');
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 6 characters.');
    expect(signUp).not.toHaveBeenCalled();
  });

  it('submits trimmed credentials to sign in and sign up', async () => {
    open();
    const { unmount } = render(<AuthModal />);
    fill(' a@b.co ', 'secret1');
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(login).toHaveBeenCalledWith('a@b.co', 'secret1'));
    unmount();

    open('signUp');
    render(<AuthModal />);
    fill('a@b.co', 'secret1');
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => expect(signUp).toHaveBeenCalledWith('a@b.co', 'secret1'));
  });

  it('keeps the email and shows the server error under the form (AC-01.2)', () => {
    open();
    useAuthStore.setState({ authError: new AppError('AUTH_INVALID_CREDENTIALS') });
    render(<AuthModal />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid login credentials');
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('');

    fill('keep@me.co', 'wrong-pass');
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('keep@me.co');
  });

  it('disables the submit button while a request is running', () => {
    open();
    useAuthStore.setState({ isSubmitting: true });
    render(<AuthModal />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeDisabled();
  });

  it('closes with Escape, the backdrop and the guest button, but not on dialog clicks', () => {
    open();
    const { unmount } = render(<AuthModal />);
    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(useAuthStore.getState().isAuthModalOpen).toBe(true);

    fireEvent.keyDown(window, { key: 'a' });
    expect(useAuthStore.getState().isAuthModalOpen).toBe(true);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
    unmount();

    open();
    const second = render(<AuthModal />);
    fireEvent.mouseDown(screen.getByTestId('auth-overlay'));
    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
    second.unmount();

    open();
    render(<AuthModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue as guest' }));
    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
  });
});
