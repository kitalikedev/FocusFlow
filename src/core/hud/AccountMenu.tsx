import React, { useEffect, useState } from 'react';
import { LogIn, UserRound } from 'lucide-react';
import { AUTH_MESSAGES } from '@/shared/lib/messages';
import { useAuthStore } from '@/core/auth/useAuthStore';

const BUTTON_CLASS =
  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50';

/** Login button for guests, account menu with Log Out for signed-in users (PRD section 4.1). */
export const AccountMenu: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isConfigured = useAuthStore((state) => state.isConfigured);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const logout = useAuthStore((state) => state.logout);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  if (isGuest || !user) {
    return (
      <button
        type="button"
        data-testid="login-btn"
        disabled={!isConfigured}
        title={isConfigured ? 'Sign in to sync your data' : AUTH_MESSAGES.cloudUnavailable}
        aria-label="Open sign in"
        onClick={() => openAuthModal('signIn')}
        className={BUTTON_CLASS}
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        <span>Login</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        data-testid="account-btn"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        aria-label="Open account menu"
        onClick={() => setIsMenuOpen((open) => !open)}
        className={BUTTON_CLASS}
      >
        <UserRound className="h-4 w-4" aria-hidden="true" />
        <span className="max-w-[8rem] truncate">{user.email}</span>
      </button>
      {isMenuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 min-w-[8rem] rounded-lg border border-white/10 bg-zinc-900 p-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            data-testid="logout-btn"
            aria-label="Log Out"
            onClick={() => {
              setIsMenuOpen(false);
              void logout();
            }}
            className="w-full rounded-md px-3 py-1.5 text-left text-xs text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};
