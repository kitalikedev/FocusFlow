import { useCallback, useState } from 'react';

export type SiteTheme = 'dark' | 'light';

export const SITE_THEME_KEY = 'focusflow-site-theme';

/** The saved choice, else the system setting. The website is dark unless the system or the visitor asks for light. */
function readInitialTheme(): SiteTheme {
  try {
    const saved = window.localStorage.getItem(SITE_THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Storage can be blocked (private mode); fall back to the system setting.
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Light or dark mode of the website pages, remembered in this browser. It never changes the workspace theme. */
export function useSiteTheme() {
  const [theme, setTheme] = useState<SiteTheme>(readInitialTheme);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: SiteTheme = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(SITE_THEME_KEY, next);
      } catch {
        // Not saved, but the switch still works for this visit.
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
