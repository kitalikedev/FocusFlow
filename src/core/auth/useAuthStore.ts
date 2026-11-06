import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { AuthState, AuthUser } from '@/shared/types/contracts';
import { AppError, classifyAuthError, toAppError } from '@/shared/lib/errors';
import { AUTH_MESSAGES } from '@/shared/lib/messages';
import { getSupabaseClient, isSupabaseConfigured } from '@/shared/lib/supabase';
import { migrateGuestData } from '@/core/data/migrateGuestData';
import { clearGuestData, hasGuestData, hasGuestSettings } from '@/core/data/storageKeys';
import { useToastStore } from '@/core/ui/useToastStore';

export type AuthModalTab = 'signIn' | 'signUp';
export type MergePromptState = 'hidden' | 'open' | 'running';

export interface AuthStoreState extends AuthState {
  isConfigured: boolean;
  isSubmitting: boolean;
  authError: AppError | null;
  isAuthModalOpen: boolean;
  authModalTab: AuthModalTab;
  mergePrompt: MergePromptState;
  /** Incremented whenever the active data source or its content changed, so dependants can reload. */
  dataVersion: number;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: AuthModalTab) => void;
  resolveGuestMerge: (choice: 'merge' | 'discard') => Promise<void>;
}

// Guards against double migration (ARCHITECTURE 7.2) and tells sign-up apart from sign-in.
let migrationAttemptedInSession = false;
let pendingFlow: 'signup' | 'signin' | null = null;
let stopListening: (() => void) | null = null;

function mapUser(user: User): AuthUser {
  const avatar: unknown = user.user_metadata?.avatar_url;
  return {
    id: user.id,
    email: user.email ?? '',
    avatarUrl: typeof avatar === 'string' ? avatar : undefined,
  };
}

function toastError(error: unknown): void {
  useToastStore.getState().showToast(toAppError(error).message, { variant: 'error' });
}

export const useAuthStore = create<AuthStoreState>((set, get) => {
  return {
    user: null,
    isGuest: true,
    isLoading: true,
    isConfigured: isSupabaseConfigured(),
    isSubmitting: false,
    authError: null,
    isAuthModalOpen: false,
    authModalTab: 'signIn',
    mergePrompt: 'hidden',
    dataVersion: 0,

    openAuthModal: (tab = 'signIn') => {
      if (!get().isConfigured) {
        useToastStore.getState().showToast(AUTH_MESSAGES.cloudUnavailable, { variant: 'info' });
        return;
      }
      set({ isAuthModalOpen: true, authModalTab: tab, authError: null });
    },

    closeAuthModal: () => set({ isAuthModalOpen: false, authError: null }),

    setAuthModalTab: (tab) => set({ authModalTab: tab, authError: null }),

    loginWithPassword: async (email, password) => {
      set({ isSubmitting: true, authError: null });
      pendingFlow = 'signin';
      try {
        const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) applySession(data.session);
        pendingFlow = null;
        set({ isSubmitting: false, isAuthModalOpen: false });
      } catch (error) {
        pendingFlow = null;
        set({ isSubmitting: false, authError: classifyAuthError(error) });
      }
    },

    signUpWithPassword: async (email, password) => {
      set({ isSubmitting: true, authError: null });
      pendingFlow = 'signup';
      try {
        const { data, error } = await getSupabaseClient().auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) throw new AppError('AUTH_CONFIRMATION_REQUIRED');
        applySession(data.session);
        pendingFlow = null;
        set({ isSubmitting: false, isAuthModalOpen: false });
        useToastStore
          .getState()
          .showToast(AUTH_MESSAGES.accountCreated, { variant: 'success', durationMs: 3000 });
      } catch (error) {
        pendingFlow = null;
        set({ isSubmitting: false, authError: classifyAuthError(error) });
      }
    },

    signInWithGoogle: async () => {
      // FR-03 is a P2 feature; the contract requires the method to exist.
      throw new AppError('FEATURE_UNAVAILABLE');
    },

    logout: async () => {
      // Update the UI first so the app is back in Guest Mode immediately (AC-01.3, < 300 ms).
      migrationAttemptedInSession = false;
      pendingFlow = null;
      set({ user: null, isGuest: true, mergePrompt: 'hidden', authError: null });
      bumpDataVersion();
      try {
        const { error } = await getSupabaseClient().auth.signOut();
        if (error) console.warn('Sign out request failed; local session was cleared.');
      } catch {
        console.warn('Sign out request failed; local session was cleared.');
      }
    },

    resolveGuestMerge: async (choice) => {
      if (get().mergePrompt !== 'open') return;

      if (choice === 'discard') {
        clearGuestData();
        set({ mergePrompt: 'hidden' });
        useToastStore.getState().showToast(AUTH_MESSAGES.guestDiscarded, { variant: 'info' });
        bumpDataVersion();
        return;
      }

      set({ mergePrompt: 'running' });
      try {
        await migrateGuestData('merge');
        set({ mergePrompt: 'hidden' });
        useToastStore.getState().showToast(AUTH_MESSAGES.guestMerged, { variant: 'success' });
        bumpDataVersion();
      } catch (error) {
        // Nothing was removed: reopen the prompt so the user can retry or discard.
        set({ mergePrompt: 'open' });
        toastError(error);
      }
    },
  };
});

function bumpDataVersion(): void {
  useAuthStore.setState((state) => ({ dataVersion: state.dataVersion + 1 }));
}

async function runSignupMigration(): Promise<void> {
  try {
    await migrateGuestData('signup');
    useToastStore.getState().showToast(AUTH_MESSAGES.guestMigrated, { variant: 'success' });
    bumpDataVersion();
  } catch (error) {
    // Guest data is untouched on failure; allow a retry on the next sign-in event.
    migrationAttemptedInSession = false;
    toastError(error);
  }
}

/** Decides whether signed-in guest data needs migrating; never awaits inside the auth callback. */
function scheduleMigration(): void {
  if (migrationAttemptedInSession) return;
  const isSignup = pendingFlow === 'signup';
  const needsWork = isSignup ? hasGuestData() || hasGuestSettings() : hasGuestData();
  if (!needsWork) return;

  migrationAttemptedInSession = true;
  pendingFlow = null;
  setTimeout(() => {
    if (isSignup) {
      void runSignupMigration();
    } else {
      useAuthStore.setState({ mergePrompt: 'open' });
    }
  }, 0);
}

function applySession(session: Session): void {
  useAuthStore.setState({ user: mapUser(session.user), isGuest: false });
  scheduleMigration();
}

/**
 * Restores the session and subscribes to auth events. Safe to call repeatedly; returns a cleanup function.
 * Without Supabase environment variables the app simply stays in Guest Mode.
 */
export function initializeAuth(): () => void {
  if (!isSupabaseConfigured()) {
    useAuthStore.setState({ isConfigured: false, isLoading: false, isGuest: true });
    return () => undefined;
  }
  if (stopListening) return stopListening;

  const client = getSupabaseClient();
  useAuthStore.setState({ isConfigured: true });

  client.auth
    .getSession()
    .then(({ data }) => {
      if (data.session) applySession(data.session);
      useAuthStore.setState({ isLoading: false });
    })
    .catch(() => useAuthStore.setState({ isLoading: false }));

  // Callback stays synchronous: awaiting Supabase calls here can deadlock GoTrue (ARCHITECTURE 7.2).
  const { data } = client.auth.onAuthStateChange((event, session) => {
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
      applySession(session);
    } else if (event === 'SIGNED_OUT') {
      migrationAttemptedInSession = false;
      pendingFlow = null;
      useAuthStore.setState({ user: null, isGuest: true, mergePrompt: 'hidden' });
    }
  });

  stopListening = () => {
    data.subscription.unsubscribe();
    stopListening = null;
  };
  return stopListening;
}
