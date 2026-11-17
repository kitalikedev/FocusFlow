import React from 'react';
import { Sparkles } from 'lucide-react';
import { PageShell } from '@/core/ui/PageShell';
import { THEME_PRESETS } from '../lib/presets';
import { useThemeLibraryStore } from '../store/useThemeLibraryStore';
import { ThemeCard } from './ThemeCard';

const GRID_CLASS = 'grid grid-cols-2 gap-4 sm:grid-cols-3';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/50">{children}</h2>
);

/** Preview of every built-in theme (FR-27) and of the themes the signed-in user saved. Preview only: nothing is applied here. */
export const ThemesPage: React.FC = () => {
  const savedThemes = useThemeLibraryStore((state) => state.savedThemes);

  return (
    <PageShell
      title="Themes"
      testId="themes-page"
      wide
      description="A look at the themes that come with FocusFlow. Open the workspace to apply one."
    >
      <div className="flex flex-col gap-8 p-5">
        <section aria-labelledby="built-in-themes">
          <span id="built-in-themes" className="sr-only">
            Built-in themes
          </span>
          <SectionTitle>Built-in themes ({THEME_PRESETS.length})</SectionTitle>
          <ul className={GRID_CLASS}>
            {THEME_PRESETS.map((preset) => (
              <li key={preset.id}>
                <ThemeCard testId={`theme-preview-${preset.id}`} name={preset.name} config={preset.config} />
              </li>
            ))}
            <li data-testid="more-themes" className="flex flex-col gap-1.5">
              <span className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/25 text-white/60">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs">More themes coming soon</span>
              </span>
              <span className="text-xs text-white/40">New themes are added over time</span>
            </li>
          </ul>
        </section>

        {savedThemes.length > 0 && (
          <section aria-labelledby="saved-themes">
            <span id="saved-themes" className="sr-only">
              Your saved themes
            </span>
            <SectionTitle>Your saved themes ({savedThemes.length})</SectionTitle>
            <ul className={GRID_CLASS}>
              {savedThemes.map((theme) => (
                <li key={theme.id}>
                  <ThemeCard testId={`saved-preview-${theme.id}`} name={theme.name} config={theme.config} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageShell>
  );
};

export default ThemesPage;
