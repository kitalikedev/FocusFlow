import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { SITE_CONTAINER, SITE_FOCUS } from '@/core/ui/siteStyles';
import { OpenAppButton } from './OpenAppButton';
import { useSiteTheme, type SiteTheme } from './useSiteTheme';
import './site.css';

const SITE_LINKS = [
  { to: '/themes', label: 'Themes' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/tracking', label: 'Tracking' },
  { to: '/about', label: 'About' },
];

const REPO_URL = 'https://github.com/kitalikedev/FocusFlow';

const ICON_BUTTON = `inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-site-line text-site-text transition-colors hover:border-site-muted ${SITE_FOCUS}`;

const ThemeButton: React.FC<{ theme: SiteTheme; onToggle: () => void }> = ({ theme, onToggle }) => {
  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <button
      type="button"
      data-testid="site-theme-btn"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
      className={`group ${ICON_BUTTON}`}
    >
      <Icon
        className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-[25deg] motion-reduce:transition-none"
        aria-hidden="true"
      />
    </button>
  );
};

/** Website header: brand with the page links next to it; on tablets and phones the links move into a menu. */
const SiteHeader: React.FC<{ theme: SiteTheme; onToggleTheme: () => void }> = ({ theme, onToggleTheme }) => {
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
    `rounded-lg px-3 py-2 text-sm transition-colors ${SITE_FOCUS} ${
      isActive
        ? 'text-site-text underline decoration-[1.5px] underline-offset-[6px]'
        : 'text-site-muted hover:text-site-text'
    }`;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-site-line bg-site-bg transition-colors duration-300"
    >
      <div className={`${SITE_CONTAINER} px-4 sm:px-6 flex h-16 items-center justify-between gap-4`}>
        <div className="flex items-center gap-6">
          <Link to="/" className={`rounded-lg font-display text-xl font-semibold tracking-[-0.01em] ${SITE_FOCUS}`}>
            FocusFlow
          </Link>
          <nav aria-label="Pages" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
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
          <ThemeButton theme={theme} onToggle={onToggleTheme} />
          <OpenAppButton className="max-sm:hidden" />
          <button
            type="button"
            data-testid="site-menu-btn"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={`${ICON_BUTTON} lg:hidden`}
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
          className="animate-row-in border-t border-site-line motion-reduce:animate-none lg:hidden"
        >
          <ul className={`${SITE_CONTAINER} px-4 sm:px-6 flex flex-col pb-4 pt-1`}>
            {SITE_LINKS.map((link) => (
              <li key={link.to} className="border-b border-site-line">
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `block py-3.5 transition-colors ${SITE_FOCUS} ${isActive ? 'text-site-text' : 'text-site-muted hover:text-site-text'}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className={`${SITE_CONTAINER} px-4 sm:px-6 pb-4 sm:hidden`}>
            <OpenAppButton className="w-full" />
          </div>
        </nav>
      )}
    </header>
  );
};

const FOOTER_LINK = `rounded transition-colors hover:text-site-text ${SITE_FOCUS}`;

const SiteFooter: React.FC = () => (
  <footer className="border-t border-site-line">
    <div
      className={`${SITE_CONTAINER} px-4 sm:px-6 flex flex-col gap-3 py-7 text-sm text-site-muted sm:flex-row sm:items-center sm:justify-between`}
    >
      <span>© 2026 FocusFlow, by Group 1, class 24SE1</span>
      <nav aria-label="Footer" className="flex flex-wrap gap-5">
        <Link to="/#contact" className={FOOTER_LINK}>
          Contact
        </Link>
        <Link to="/about" className={FOOTER_LINK}>
          About
        </Link>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={FOOTER_LINK}>
          Source code
        </a>
      </nav>
    </div>
  </footer>
);

/**
 * Frame of the website pages (home, themes, analytics, tracking, about); the workspace lives at /app.
 * The page body is locked (`overflow: hidden`) for the full-screen workspace, so the website scrolls inside
 * this container instead of the browser window.
 */
export const SiteLayout: React.FC = () => {
  const { theme, toggleTheme } = useSiteTheme();

  return (
    <div
      data-testid="site-layout"
      data-theme={theme}
      className="site h-screen overflow-y-auto bg-site-bg text-site-text transition-colors duration-300 motion-reduce:transition-none"
    >
      <div className="flex min-h-full flex-col">
        <SiteHeader theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1 px-4 sm:px-6">
          <Suspense fallback={<p className="py-12 text-center text-sm text-site-muted">Loading…</p>}>
            <Outlet />
          </Suspense>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
};
