import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import App from '../app/App';
import { useAuthStore } from '../core/auth/useAuthStore';

describe('Application Smoke Test', () => {
  beforeEach(() => {
    // CI and fresh clones have no .env.local: the app must still start as a guest.
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
    // The workspace lives at /app.
    window.history.pushState({}, '', '/app');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    window.history.pushState({}, '', '/');
  });

  it('renders App shell, Frosted Glass Capsule, default time 25:00, and HUD', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByRole('link', { name: 'FocusFlow' })).toHaveAttribute('href', '/');
    expect(screen.getByTestId('clock-capsule')).toBeInTheDocument();
    expect(screen.getByTestId('clock-time')).toHaveTextContent('25:00');
    expect(screen.getByTestId('control-bar')).toBeInTheDocument();
    expect(screen.getByTestId('wallpaper-layer')).toBeInTheDocument();
  });

  it('stays usable as a guest when Supabase environment variables are missing', async () => {
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => expect(useAuthStore.getState().isLoading).toBe(false));

    expect(useAuthStore.getState()).toMatchObject({ isGuest: true, isConfigured: false });
    expect(screen.getByTestId('clock-time')).toHaveTextContent('25:00');
    expect(screen.getByTestId('login-btn')).toBeDisabled();
  });
});
