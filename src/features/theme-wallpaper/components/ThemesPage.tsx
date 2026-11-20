import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/core/ui/PageShell';
import { APP_PATH } from '@/core/ui/routes';
import { SITE_BUTTON_PRIMARY, SITE_FOCUS } from '@/core/ui/siteStyles';
import type { ThemeConfig } from '@/shared/types/contracts';
import { THEME_PRESETS } from '../lib/presets';
import { useThemeLibraryStore } from '../store/useThemeLibraryStore';

const GRID_CLASS = 'grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

interface ThemeTileProps {
  testId: string;
  name: string;
  config: ThemeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

/** One theme drawn with its own colors and clock font. Selecting it only changes the preview on this page. */
const ThemeTile: React.FC<ThemeTileProps> = ({ testId, name, config, isSelected, onSelect }) => (
  <button
    type="button"
    data-testid={testId}
    aria-pressed={isSelected}
    onClick={onSelect}
    className={`group flex w-full flex-col overflow-hidden rounded-xl border bg-site-surface text-left transition-colors ${SITE_FOCUS} ${
      isSelected ? 'border-site-accent ring-1 ring-inset ring-site-accent' : 'border-site-line hover:border-site-text'
    }`}
  >
    <span
      aria-hidden="true"
      className="flex h-[150px] w-full items-center justify-center text-[34px] font-bold tracking-[-0.02em]"
      style={{
        backgroundColor: config.tokens.bgSolidColor,
        color: config.tokens.colorAccent,
        fontFamily: config.tokens.fontClock,
      }}
    >
      <span className="transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none">
        25:00
      </span>
    </span>
    <span className="flex items-center justify-between gap-2 border-t border-site-line px-3.5 py-3 text-sm font-medium">
      <span className="truncate">{name}</span>
      <span
        aria-hidden="true"
        className="h-3 w-3 shrink-0 rounded-full border border-site-line"
        style={{ backgroundColor: config.tokens.colorAccent }}
      />
    </span>
  </button>
);

/**
 * Preview of every built-in theme (FR-27) and of the themes the signed-in user saved.
 * Preview only: picking a theme here changes nothing in the workspace.
 */
export const ThemesPage: React.FC = () => {
  const savedThemes = useThemeLibraryStore((state) => state.savedThemes);
  const first = THEME_PRESETS[0];
  const [selected, setSelected] = useState({ key: `preset-${first.id}`, name: first.name, accent: first.config.tokens.colorAccent });

  const select = (key: string, name: string, config: ThemeConfig) => () =>
    setSelected({ key, name, accent: config.tokens.colorAccent });

  return (
    <PageShell
      title="Themes"
      testId="themes-page"
      description="12 built-in themes. Each one sets the colors, the clock font and the wallpaper. Pick one to preview it here, then apply it in the workspace."
    >
      <div
        role="status"
        className="mb-8 flex flex-wrap items-center gap-4 border-y border-site-line py-3.5 text-[15px]"
      >
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 rounded border border-site-line"
          style={{ backgroundColor: selected.accent }}
        />
        <span>
          Previewing <strong data-testid="theme-preview-name">{selected.name}</strong>
        </span>
        <Link to={APP_PATH} className={`${SITE_BUTTON_PRIMARY} ml-auto`}>
          Apply it in the workspace
        </Link>
      </div>

      <section aria-labelledby="built-in-themes" className="flex flex-col gap-4">
        <h2 id="built-in-themes" className="font-display text-[22px] font-medium">
          Built-in themes ({THEME_PRESETS.length})
        </h2>
        <ul className={GRID_CLASS}>
          {THEME_PRESETS.map((preset) => (
            <li key={preset.id}>
              <ThemeTile
                testId={`theme-preview-${preset.id}`}
                name={preset.name}
                config={preset.config}
                isSelected={selected.key === `preset-${preset.id}`}
                onSelect={select(`preset-${preset.id}`, preset.name, preset.config)}
              />
            </li>
          ))}
          <li
            data-testid="more-themes"
            className="flex min-h-[196px] flex-col justify-center gap-1.5 rounded-xl border border-dashed border-site-line p-5 text-sm text-site-muted"
          >
            <span className="text-[15px] font-semibold text-site-text">More themes coming soon</span>
            <span>
              Have one in mind?{' '}
              <Link to="/#contact" className={`underline underline-offset-[3px] hover:text-site-text ${SITE_FOCUS}`}>
                Tell us
              </Link>
            </span>
          </li>
        </ul>
      </section>

      {savedThemes.length > 0 && (
        <section aria-labelledby="saved-themes" className="mt-12 flex flex-col gap-4">
          <h2 id="saved-themes" className="font-display text-[22px] font-medium">
            Your saved themes ({savedThemes.length})
          </h2>
          <ul className={GRID_CLASS}>
            {savedThemes.map((theme) => (
              <li key={theme.id}>
                <ThemeTile
                  testId={`saved-preview-${theme.id}`}
                  name={theme.name}
                  config={theme.config}
                  isSelected={selected.key === `saved-${theme.id}`}
                  onSelect={select(`saved-${theme.id}`, theme.name, theme.config)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
};

export default ThemesPage;
