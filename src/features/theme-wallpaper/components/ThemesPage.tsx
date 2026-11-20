import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { PageShell } from '@/core/ui/PageShell';
import { Reveal } from '@/core/ui/Reveal';
import { APP_PATH } from '@/core/ui/routes';
import { SITE_BUTTON_PRIMARY, SITE_FOCUS } from '@/core/ui/siteStyles';
import { spreadThemeChange, useSitePreset } from '@/core/ui/siteTheme';
import type { ThemeConfig } from '@/shared/types/contracts';
import { THEME_PRESETS } from '../lib/presets';
import { useThemeLibraryStore } from '../store/useThemeLibraryStore';

const GRID_CLASS = 'grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

interface ThemeTileProps {
  testId: string;
  name: string;
  config: ThemeConfig;
  isSelected: boolean;
  onSelect: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/** One theme drawn with its own colors and clock font. */
const ThemeTile: React.FC<ThemeTileProps> = ({ testId, name, config, isSelected, onSelect }) => (
  <button
    type="button"
    data-testid={testId}
    aria-pressed={isSelected}
    onClick={onSelect}
    className={`site-lift group flex w-full flex-col overflow-hidden rounded-xl border bg-site-surface text-left ${SITE_FOCUS} ${
      isSelected ? 'border-site-accent ring-2 ring-inset ring-site-accent' : 'border-site-line'
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
      <span className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
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
 * Picking a built-in theme dresses the whole website in it and shows the workspace in that theme;
 * nothing changes in the workspace itself until the visitor applies a theme there.
 */
export const ThemesPage: React.FC = () => {
  const savedThemes = useThemeLibraryStore((state) => state.savedThemes);
  const { presetId, setPresetId } = useSitePreset();
  const [savedId, setSavedId] = useState<string | null>(null);

  const sitePreset = THEME_PRESETS.find((preset) => preset.id === presetId) ?? THEME_PRESETS[0];
  const saved = savedThemes.find((theme) => theme.id === savedId);
  const selectedName = saved?.name ?? sitePreset.name;
  const selectedAccent = (saved?.config ?? sitePreset.config).tokens.colorAccent;

  const selectPreset = (id: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    setSavedId(null);
    if (id === presetId) return;
    spreadThemeChange(event.currentTarget, () => flushSync(() => setPresetId(id)));
  };

  return (
    <PageShell
      title="Themes"
      testId="themes-page"
      description="12 built-in themes. Each one sets the colors, the clock font and the wallpaper. Pick one and this whole site wears it, then apply it in the workspace."
    >
      <Reveal className="mb-6">
        {saved ? (
          <div
            className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-site-line text-[18vw] font-bold sm:text-[140px]"
            style={{
              backgroundColor: saved.config.tokens.bgSolidColor,
              color: saved.config.tokens.colorAccent,
              fontFamily: saved.config.tokens.fontClock,
            }}
            aria-hidden="true"
          >
            25:00
          </div>
        ) : (
          <div className="site-lift relative aspect-[16/10] overflow-hidden rounded-2xl border border-site-line bg-site-surface">
            <img
              key={sitePreset.id}
              src={`/images/home/theme-${sitePreset.id}.webp`}
              srcSet={`/images/home/theme-${sitePreset.id}-720.webp 720w, /images/home/theme-${sitePreset.id}.webp 1440w`}
              sizes="(min-width: 1200px) 1160px, 100vw"
              alt={`The FocusFlow workspace with the ${sitePreset.name} theme`}
              width={1440}
              height={900}
              decoding="async"
              className="site-slide-in absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
      </Reveal>

      <div
        role="status"
        className="mb-12 flex flex-wrap items-center gap-4 rounded-2xl border border-site-line bg-site-surface px-5 py-4 text-[15px]"
      >
        <span
          aria-hidden="true"
          className="h-4 w-4 rounded-full border border-site-line"
          style={{ backgroundColor: selectedAccent }}
        />
        <span>
          Previewing <strong data-testid="theme-preview-name">{selectedName}</strong>
        </span>
        <Link to={APP_PATH} className={`${SITE_BUTTON_PRIMARY} ml-auto`}>
          Apply it in the workspace
        </Link>
      </div>

      <section aria-labelledby="built-in-themes" className="flex flex-col gap-5">
        <h2
          id="built-in-themes"
          className="font-display text-[26px] font-semibold tracking-[-0.02em]"
        >
          Built-in themes ({THEME_PRESETS.length})
        </h2>
        <ul className={GRID_CLASS}>
          {THEME_PRESETS.map((preset, index) => (
            <Reveal as="li" key={preset.id} index={index % 4}>
              <ThemeTile
                testId={`theme-preview-${preset.id}`}
                name={preset.name}
                config={preset.config}
                isSelected={!saved && preset.id === presetId}
                onSelect={selectPreset(preset.id)}
              />
            </Reveal>
          ))}
          <li
            data-testid="more-themes"
            className="flex min-h-[196px] flex-col justify-center gap-1.5 rounded-xl border border-dashed border-site-line p-5 text-sm text-site-muted"
          >
            <span className="text-[15px] font-semibold text-site-text">
              More themes coming soon
            </span>
            <span>
              Have one in mind?{' '}
              <Link
                to="/#contact"
                className={`underline underline-offset-[3px] hover:text-site-text ${SITE_FOCUS}`}
              >
                Tell us
              </Link>
            </span>
          </li>
        </ul>
      </section>

      {savedThemes.length > 0 && (
        <section aria-labelledby="saved-themes" className="mt-14 flex flex-col gap-5">
          <h2
            id="saved-themes"
            className="font-display text-[26px] font-semibold tracking-[-0.02em]"
          >
            Your saved themes ({savedThemes.length})
          </h2>
          <ul className={GRID_CLASS}>
            {savedThemes.map((theme) => (
              <li key={theme.id}>
                <ThemeTile
                  testId={`saved-preview-${theme.id}`}
                  name={theme.name}
                  config={theme.config}
                  isSelected={savedId === theme.id}
                  onSelect={() => setSavedId(theme.id)}
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
