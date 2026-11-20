import { useCallback, useState } from 'react';
import { THEME_PRESETS } from '@/features/theme-wallpaper';
import { DEFAULT_SITE_PRESET, SITE_PRESET_KEY } from '@/core/ui/siteTheme';

export type SiteTheme = 'dark' | 'light';

export const SITE_THEME_KEY = 'focusflow-site-theme';

function readSaved(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage can be blocked (private mode).
    return null;
  }
}

function save(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not saved, but the change still works for this visit.
  }
}

/** The saved choice, else the system setting. The website is dark unless the system or the visitor asks for light. */
function readInitialTheme(): SiteTheme {
  const saved = readSaved(SITE_THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function readInitialPreset(): string {
  const saved = readSaved(SITE_PRESET_KEY);
  return saved && THEME_PRESETS.some((preset) => preset.id === saved) ? saved : DEFAULT_SITE_PRESET;
}

/**
 * Light or dark mode and the built-in theme the website pages wear, both remembered in this browser.
 * Neither one changes the workspace theme.
 */
export function useSiteTheme() {
  const [theme, setTheme] = useState<SiteTheme>(readInitialTheme);
  const [presetId, setPreset] = useState<string>(readInitialPreset);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: SiteTheme = current === 'dark' ? 'light' : 'dark';
      save(SITE_THEME_KEY, next);
      return next;
    });
  }, []);

  const setPresetId = useCallback((id: string) => {
    if (!THEME_PRESETS.some((preset) => preset.id === id)) return;
    setPreset(id);
    save(SITE_PRESET_KEY, id);
  }, []);

  const preset = THEME_PRESETS.find((item) => item.id === presetId) ?? THEME_PRESETS[0];

  return { theme, toggleTheme, presetId, setPresetId, preset };
}
