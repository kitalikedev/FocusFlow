import { createContext, useContext } from 'react';

/** localStorage key of the theme the website pages wear (a built-in theme id, for example `nebula`). */
export const SITE_PRESET_KEY = 'focusflow-site-preset';

export const DEFAULT_SITE_PRESET = 'nebula';

export interface SitePresetContextValue {
  presetId: string;
  setPresetId: (id: string) => void;
}

/**
 * The built-in theme the website pages are dressed in. It is only a look for the website:
 * it never changes the theme of the workspace at /app.
 */
export const SitePresetContext = createContext<SitePresetContextValue>({
  presetId: DEFAULT_SITE_PRESET,
  setPresetId: () => {},
});

export function useSitePreset(): SitePresetContextValue {
  return useContext(SitePresetContext);
}

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown };

/**
 * Runs a theme change so the new colors spread as a circle from the clicked element (styles in site.css).
 * Browsers without the View Transitions API, and visitors who prefer less motion, get the change at once.
 * `update` must apply the change synchronously (wrap React state updates in flushSync).
 */
export function spreadThemeChange(origin: Element | null, update: () => void): void {
  const doc = document as ViewTransitionDocument;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || reduceMotion) {
    update();
    return;
  }
  if (origin) {
    const box = origin.getBoundingClientRect();
    document.documentElement.style.setProperty('--spread-x', `${box.left + box.width / 2}px`);
    document.documentElement.style.setProperty('--spread-y', `${box.top + box.height / 2}px`);
  }
  doc.startViewTransition(update);
}
