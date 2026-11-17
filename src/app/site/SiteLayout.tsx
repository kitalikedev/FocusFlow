import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { OpenAppButton } from './OpenAppButton';

const SITE_LINKS = [
  { to: '/tasks', label: 'Tasks' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/tracking', label: 'Tracking' },
  { to: '/about', label: 'About' },
];

const REPO_URL = 'https://github.com/kitalikedev/FocusFlow';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

/** Website header: brand with the page links next to it; on tablets and phones the links move into a menu. */
const SiteHeader: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const headerRef = useRef<HTMLElement>(null);

  // Close the menu after moving to another page.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Close it with Escape or a click anywhere outside the header.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [isMenuOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm transition-colors ${FOCUS_RING} ${
      isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'
    }`;

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0a14]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className={`rounded-lg text-lg font-semibold tracking-wide text-white ${FOCUS_RING}`}>
            FocusFlow
          </Link>
          <nav aria-label="Pages" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {SITE_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={linkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <OpenAppButton className="max-sm:hidden" />
          <button
            type="button"
            data-testid="site-menu-btn"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={`rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white lg:hidden ${FOCUS_RING}`}
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="site-menu"
          data-testid="site-menu"
          aria-label="Pages menu"
          className="animate-panel-in border-t border-white/10 px-4 pb-4 pt-2 motion-reduce:animate-none lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {SITE_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={(state) => `block ${linkClass(state)}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <OpenAppButton className="mt-3 w-full justify-center sm:hidden" />
        </nav>
      )}
    </header>
  );
};

const SiteFooter: React.FC = () => (
  <footer className="border-t border-white/10">
    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <span>© 2026 FocusFlow · Group 1, class 24SE1</span>
      <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={`rounded hover:text-white ${FOCUS_RING}`}>
        Source code on GitHub
      </a>
    </div>
  </footer>
);

/** Frame of the website pages (home, tasks, analytics, tracking, about); the workspace lives at /app. */
export const SiteLayout: React.FC = () => (
  <div data-testid="site-layout" className="flex min-h-screen flex-col bg-[#0b0a14] text-white">
    <SiteHeader />
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <Suspense fallback={<p className="text-center text-xs text-white/60">Loading…</p>}>
        <Outlet />
      </Suspense>
    </main>
    <SiteFooter />
  </div>
);
