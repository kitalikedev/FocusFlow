import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getSupabaseClient } from '@/shared/lib/supabase';
import { MockSupabase } from '@/shared/lib/__mocks__/supabase';
import { AppError } from '@/shared/lib/errors';
import { useToastStore } from '@/core/ui/useToastStore';
import { GUEST_STORAGE_KEYS } from '@/core/data/storageKeys';
import { migrateGuestData } from '@/core/data/migrateGuestData';
import { initializeAuth, useAuthStore } from '../useAuthStore';

vi.mock('@/shared/lib/supabase');
vi.mock('@/core/data/migrateGuestData', () => ({ migrateGuestData: vi.fn() }));

const sb = getSupabaseClient() as unknown as MockSupabase;
const migrate = vi.mocked(migrateGuestData);

const USER = { id: 'u1', email: 'a@b.co', user_metadata: { avatar_url: 'https://img/a.png' } };
const SESSION = { user: USER };

type AuthListener = (event: string, session: unknown) => void;

function seedGuestTasks(): void {
  window.localStorage.setItem(GUEST_STORAGE_KEYS.tasks, JSON.stringify([{ id: 't1' }]));
}

function resetStore(): void {
  useAuthStore.setState({
    user: null,
    isGuest: true,
    isLoading: true,
    isConfigured: true,
    isSubmitting: false,
    authError: null,
    isAuthModalOpen: false,
    authModalTab: 'signIn',
    mergePrompt: 'hidden',
    dataVersion: 0,
  });
}

async function flushTimers(): Promise<void> {
  await vi.advanceTimersByTimeAsync(1);
}

describe('useAuthStore', () => {
  let stop: (() => void) | undefined;
  let listener: AuthListener;
  const unsubscribe = vi.fn();

  beforeEach(async () => {
    vi.useFakeTimers();
    window.localStorage.clear();
    useToastStore.setState({ toasts: [] });
    resetStore();
    migrate.mockReset();
    migrate.mockResolvedValue({ tasks: 0, note: false, savedThemes: 0, sessions: 0 });
    unsubscribe.mockReset();

    sb.auth.getSession.mockReset();
    sb.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    sb.auth.signInWithPassword.mockReset();
    sb.auth.signUp.mockReset();
    sb.auth.signOut.mockReset();
    sb.auth.signOut.mockResolvedValue({ error: null });
    sb.auth.onAuthStateChange.mockReset();
    sb.auth.onAuthStateChange.mockImplementation((cb: AuthListener) => {
      listener = cb;
      return { data: { subscription: { unsubscribe } } };
    });

    // logout() resets the module-level migration guard that survives between tests.
    await useAuthStore.getState().logout();
    resetStore();
  });

  afterEach(() => {
    stop?.();
    stop = undefined;
    vi.useRealTimers();
  });

  async function start(): Promise<void> {
    stop = initializeAuth();
    await vi.advanceTimersByTimeAsync(0);
  }

  describe('initializeAuth', () => {
    it('restores a stored session and finishes loading', async () => {
      sb.auth.getSession.mockResolvedValue({ data: { session: SESSION }, error: null });
      await start();
      const state = useAuthStore.getState();
      expect(state.user).toEqual({ id: 'u1', email: 'a@b.co', avatarUrl: 'https://img/a.png' });
      expect(state.isGuest).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('stays a guest when there is no session', async () => {
      await start();
      expect(useAuthStore.getState()).toMatchObject({ user: null, isGuest: true, isLoading: false });
    });

    it('finishes loading even when getSession fails', async () => {
      sb.auth.getSession.mockRejectedValue(new Error('boom'));
      await start();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('is idempotent and unsubscribes on cleanup', async () => {
      await start();
      const again = initializeAuth();
      expect(again).toBe(stop);
      expect(sb.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
      stop?.();
      stop = undefined;
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('maps users without email or avatar metadata', async () => {
      sb.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u2', user_metadata: {} } } }, error: null });
      await start();
      expect(useAuthStore.getState().user).toEqual({ id: 'u2', email: '', avatarUrl: undefined });
    });

    it('reacts to SIGNED_IN, INITIAL_SESSION and SIGNED_OUT events', async () => {
      await start();
      listener('SIGNED_IN', SESSION);
      expect(useAuthStore.getState().isGuest).toBe(false);
      listener('SIGNED_OUT', null);
      expect(useAuthStore.getState()).toMatchObject({ user: null, isGuest: true, mergePrompt: 'hidden' });
      listener('INITIAL_SESSION', SESSION);
      expect(useAuthStore.getState().user?.id).toBe('u1');
      listener('TOKEN_REFRESHED', SESSION);
      expect(useAuthStore.getState().user?.id).toBe('u1');
    });
  });

  describe('without Supabase configuration', () => {
    it('stays in Guest Mode and opening the modal explains why', async () => {
      useAuthStore.setState({ isConfigured: false });
      const cleanup = initializeAuth();
      expect(cleanup()).toBeUndefined();
      // initializeAuth reads the real environment helper (mocked as configured), so force the flag again
      useAuthStore.setState({ isConfigured: false, isLoading: false });

      useAuthStore.getState().openAuthModal();
      expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
      expect(useToastStore.getState().toasts[0].message).toBe('Cloud sync unavailable');
    });
  });

  describe('modal state', () => {
    it('opens on the requested tab, switches tabs and clears errors on close', () => {
      useAuthStore.getState().openAuthModal('signUp');
      expect(useAuthStore.getState()).toMatchObject({ isAuthModalOpen: true, authModalTab: 'signUp' });

      useAuthStore.setState({ authError: new AppError('UNKNOWN_ERROR') });
      useAuthStore.getState().setAuthModalTab('signIn');
      expect(useAuthStore.getState().authError).toBeNull();

      useAuthStore.setState({ authError: new AppError('UNKNOWN_ERROR') });
      useAuthStore.getState().closeAuthModal();
      expect(useAuthStore.getState()).toMatchObject({ isAuthModalOpen: false, authError: null });

      useAuthStore.getState().openAuthModal();
      expect(useAuthStore.getState().authModalTab).toBe('signIn');
    });
  });

  describe('signUpWithPassword (AC-01.1)', () => {
    it('creates the account, closes the modal and shows a 3 second toast', async () => {
      sb.auth.signUp.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });
      useAuthStore.getState().openAuthModal('signUp');

      await useAuthStore.getState().signUpWithPassword('a@b.co', 'secret1');

      const state = useAuthStore.getState();
      expect(sb.auth.signUp).toHaveBeenCalledWith({ email: 'a@b.co', password: 'secret1' });
      expect(state).toMatchObject({ isGuest: false, isAuthModalOpen: false, isSubmitting: false, authError: null });
      expect(state.user?.id).toBe('u1');
      expect(useToastStore.getState().toasts[0]).toMatchObject({ message: 'Account created successfully', variant: 'success' });

      await vi.advanceTimersByTimeAsync(3000);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('migrates guest data automatically for a new account (AC-02.2)', async () => {
      seedGuestTasks();
      sb.auth.signUp.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });

      await useAuthStore.getState().signUpWithPassword('a@b.co', 'secret1');
      expect(migrate).not.toHaveBeenCalled(); // deferred with setTimeout(0)
      await flushTimers();

      expect(migrate).toHaveBeenCalledWith('signup');
      expect(useAuthStore.getState().dataVersion).toBe(1);
      expect(useAuthStore.getState().mergePrompt).toBe('hidden');
      expect(useToastStore.getState().toasts.some((t) => t.variant === 'success' && t.message.includes('đồng bộ'))).toBe(true);
    });

    it('migrates guest settings even when there are no tasks', async () => {
      window.localStorage.setItem(GUEST_STORAGE_KEYS.settings, JSON.stringify({ autoStartFocus: true }));
      sb.auth.signUp.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });
      await useAuthStore.getState().signUpWithPassword('a@b.co', 'secret1');
      await flushTimers();
      expect(migrate).toHaveBeenCalledWith('signup');
    });

    it('does not migrate twice when the SIGNED_IN event repeats', async () => {
      await start();
      seedGuestTasks();
      sb.auth.signUp.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });
      await useAuthStore.getState().signUpWithPassword('a@b.co', 'secret1');
      listener('SIGNED_IN', SESSION);
      listener('SIGNED_IN', SESSION);
      await flushTimers();
      expect(migrate).toHaveBeenCalledTimes(1);
    });

    it('falls back to the Merge/Discard prompt after a failed automatic migration and keeps the user signed in', async () => {
      seedGuestTasks();
      migrate.mockRejectedValueOnce(new AppError('NETWORK_DISCONNECTED'));
      sb.auth.signUp.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });

      await useAuthStore.getState().signUpWithPassword('a@b.co', 'secret1');
      await flushTimers();
      expect(useAuthStore.getState().isGuest).toBe(false);
      expect(useToastStore.getState().toasts.some((t) => t.variant === 'error')).toBe(true);

      await start();
      listener('SIGNED_IN', SESSION);
      await flushTimers();
      // Guest data is still there, so the user is asked; the merge skips records already uploaded.
      expect(useAuthStore.getState().mergePrompt).toBe('open');
      expect(migrate).toHaveBeenCalledTimes(1);
    });

    it('reports errors from Supabase and keeps the modal open', async () => {
      sb.auth.signUp.mockResolvedValue({ data: { session: null, user: null }, error: { code: 'user_already_exists', message: 'x' } });
      useAuthStore.getState().openAuthModal('signUp');
      await useAuthStore.getState().signUpWithPassword('a@b.co', 'secret1');
      expect(useAuthStore.getState()).toMatchObject({ isAuthModalOpen: true, isSubmitting: false, isGuest: true });
      expect(useAuthStore.getState().authError?.code).toBe('AUTH_USER_EXISTS');
    });

    it('explains when email confirmation is unexpectedly required', async () => {
      sb.auth.signUp.mockResolvedValue({ data: { session: null, user: USER }, error: null });
      await useAuthStore.getState().signUpWithPassword('a@b.co', 'secret1');
      expect(useAuthStore.getState().authError?.code).toBe('AUTH_CONFIRMATION_REQUIRED');
    });
  });

  describe('loginWithPassword (AC-01.2, AC-02.3)', () => {
    it('signs in and closes the modal without touching guest data when there is none', async () => {
      sb.auth.signInWithPassword.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });
      useAuthStore.getState().openAuthModal();

      await useAuthStore.getState().loginWithPassword('a@b.co', 'secret1');
      await flushTimers();

      expect(useAuthStore.getState()).toMatchObject({ isGuest: false, isAuthModalOpen: false, mergePrompt: 'hidden' });
      expect(migrate).not.toHaveBeenCalled();
    });

    it('shows "Invalid login credentials" and keeps the guest state on failure', async () => {
      sb.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { code: 'invalid_credentials', message: 'Invalid login credentials', status: 400 },
      });
      useAuthStore.getState().openAuthModal();

      await useAuthStore.getState().loginWithPassword('a@b.co', 'wrong');

      const state = useAuthStore.getState();
      expect(state.authError?.message).toBe('Invalid login credentials');
      expect(state).toMatchObject({ isGuest: true, isAuthModalOpen: true, isSubmitting: false });
    });

    it('handles a thrown network failure', async () => {
      sb.auth.signInWithPassword.mockRejectedValue(new TypeError('Failed to fetch'));
      await useAuthStore.getState().loginWithPassword('a@b.co', 'x');
      expect(useAuthStore.getState().authError?.code).toBe('NETWORK_DISCONNECTED');
    });

    it('asks Merge or Discard when guest data exists, without migrating by itself', async () => {
      seedGuestTasks();
      sb.auth.signInWithPassword.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });

      await useAuthStore.getState().loginWithPassword('a@b.co', 'secret1');
      await flushTimers();

      expect(useAuthStore.getState().mergePrompt).toBe('open');
      expect(migrate).not.toHaveBeenCalled();
    });

    it('does not prompt for guest settings alone', async () => {
      window.localStorage.setItem(GUEST_STORAGE_KEYS.settings, JSON.stringify({ autoStartFocus: true }));
      sb.auth.signInWithPassword.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });
      await useAuthStore.getState().loginWithPassword('a@b.co', 'secret1');
      await flushTimers();
      expect(useAuthStore.getState().mergePrompt).toBe('hidden');
    });

    it('prompts again after a page reload while guest data is still present', async () => {
      seedGuestTasks();
      sb.auth.getSession.mockResolvedValue({ data: { session: SESSION }, error: null });
      await start();
      await flushTimers();
      expect(useAuthStore.getState().mergePrompt).toBe('open');
    });
  });

  describe('resolveGuestMerge', () => {
    beforeEach(() => {
      useAuthStore.setState({ user: { id: 'u1', email: 'a@b.co' }, isGuest: false, mergePrompt: 'open' });
    });

    it('Merge runs the migration, hides the prompt and refreshes dependants', async () => {
      seedGuestTasks();
      await useAuthStore.getState().resolveGuestMerge('merge');
      expect(migrate).toHaveBeenCalledWith('merge');
      expect(useAuthStore.getState()).toMatchObject({ mergePrompt: 'hidden', dataVersion: 1 });
    });

    it('shows a running state while merging', async () => {
      let release: () => void = () => undefined;
      migrate.mockReturnValue(
        new Promise((resolve) => {
          release = () => resolve({ tasks: 0, note: false, savedThemes: 0, sessions: 0 });
        }),
      );
      const pending = useAuthStore.getState().resolveGuestMerge('merge');
      expect(useAuthStore.getState().mergePrompt).toBe('running');
      release();
      await pending;
    });

    it('reopens the prompt and reports the error when merging fails, leaving guest data intact', async () => {
      seedGuestTasks();
      migrate.mockRejectedValueOnce(new AppError('TASK_LIMIT_EXCEEDED'));
      await useAuthStore.getState().resolveGuestMerge('merge');
      expect(useAuthStore.getState().mergePrompt).toBe('open');
      expect(window.localStorage.getItem(GUEST_STORAGE_KEYS.tasks)).not.toBeNull();
      expect(useToastStore.getState().toasts[0].variant).toBe('error');
    });

    it('Discard clears guest data without calling the cloud', async () => {
      seedGuestTasks();
      await useAuthStore.getState().resolveGuestMerge('discard');
      expect(migrate).not.toHaveBeenCalled();
      expect(window.localStorage.getItem(GUEST_STORAGE_KEYS.tasks)).toBeNull();
      expect(useAuthStore.getState()).toMatchObject({ mergePrompt: 'hidden', dataVersion: 1 });
    });

    it('ignores choices when no prompt is open', async () => {
      useAuthStore.setState({ mergePrompt: 'hidden' });
      await useAuthStore.getState().resolveGuestMerge('merge');
      expect(migrate).not.toHaveBeenCalled();
    });
  });

  describe('logout (AC-01.3)', () => {
    it('returns to Guest Mode immediately, before the network call finishes', async () => {
      useAuthStore.setState({ user: { id: 'u1', email: 'a@b.co' }, isGuest: false, mergePrompt: 'open' });
      let release: () => void = () => undefined;
      sb.auth.signOut.mockReturnValue(new Promise((resolve) => { release = () => resolve({ error: null }); }));

      const pending = useAuthStore.getState().logout();
      expect(useAuthStore.getState()).toMatchObject({ user: null, isGuest: true, mergePrompt: 'hidden', dataVersion: 1 });
      release();
      await pending;
      expect(sb.auth.signOut).toHaveBeenCalled();
    });

    it('tolerates sign-out failures and resets the migration guard', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      sb.auth.signOut.mockResolvedValueOnce({ error: { message: 'x' } });
      await useAuthStore.getState().logout();
      sb.auth.signOut.mockRejectedValueOnce(new Error('offline'));
      await useAuthStore.getState().logout();
      expect(warn).toHaveBeenCalledTimes(2);
      warn.mockRestore();

      // After logging out, a new sign-in with guest data may migrate again.
      seedGuestTasks();
      sb.auth.signInWithPassword.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });
      await useAuthStore.getState().loginWithPassword('a@b.co', 'secret1');
      await flushTimers();
      expect(useAuthStore.getState().mergePrompt).toBe('open');
    });
  });

  it('signInWithGoogle is not available yet (FR-03 is P2)', async () => {
    await expect(useAuthStore.getState().signInWithGoogle()).rejects.toMatchObject({ code: 'FEATURE_UNAVAILABLE' });
  });

  it('never awaits Supabase inside the auth callback (deadlock rule)', async () => {
    await start();
    seedGuestTasks();
    useAuthStore.setState({ isGuest: true });
    listener('SIGNED_IN', SESSION);
    // The callback returned synchronously; the prompt appears only after the deferred timer.
    expect(useAuthStore.getState().mergePrompt).toBe('hidden');
    await flushTimers();
    expect(useAuthStore.getState().mergePrompt).toBe('open');
  });
});
