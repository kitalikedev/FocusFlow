import React, { useEffect, useId, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './useAuthStore';
import { validateCredentials } from './validation';

const INPUT_CLASS =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300';

const AuthForm: React.FC = () => {
  const tab = useAuthStore((state) => state.authModalTab);
  const authError = useAuthStore((state) => state.authError);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const setTab = useAuthStore((state) => state.setAuthModalTab);
  const close = useAuthStore((state) => state.closeAuthModal);
  const login = useAuthStore((state) => state.loginWithPassword);
  const signUp = useAuthStore((state) => state.signUpWithPassword);

  const titleId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  const isSignUp = tab === 'signUp';
  const errorMessage = localError ?? authError?.message ?? null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateCredentials(email, password);
    setLocalError(problem);
    if (problem) return;
    const trimmedEmail = email.trim();
    await (isSignUp ? signUp(trimmedEmail, password) : login(trimmedEmail, password));
  };

  const switchTab = (next: 'signIn' | 'signUp') => {
    setLocalError(null);
    setTab(next);
  };

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
      active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
    }`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
      data-testid="auth-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-capsule border border-white/10 bg-zinc-900 p-6 text-white shadow-xl"
      >
        <h2 id={titleId} className="mb-4 text-lg font-semibold">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>

        <div role="tablist" aria-label="Authentication mode" className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            className={tabClass(!isSignUp)}
            onClick={() => switchTab('signIn')}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            className={tabClass(isSignUp)}
            onClick={() => switchTab('signUp')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-white/70">
            Email
            <input
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={INPUT_CLASS}
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-white/70">
            Password
            <input
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={INPUT_CLASS}
              placeholder="At least 6 characters"
            />
          </label>

          {errorMessage && (
            <p role="alert" className="text-xs text-red-400">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          type="button"
          onClick={close}
          className="mt-3 w-full rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
        >
          Continue as guest
        </button>
      </div>
    </div>
  );
};

/** Authentication dialog (PRD component #8). Rendering the form only while open resets its fields on close. */
export const AuthModal: React.FC = () => {
  const isOpen = useAuthStore((state) => state.isAuthModalOpen);
  return isOpen ? <AuthForm /> : null;
};

export default AuthModal;
