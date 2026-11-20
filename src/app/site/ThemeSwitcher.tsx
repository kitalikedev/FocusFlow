import React from 'react';
import { flushSync } from 'react-dom';
import { THEME_PRESETS } from '@/features/theme-wallpaper';
import { SITE_FOCUS } from '@/core/ui/siteStyles';
import { spreadThemeChange, useSitePreset } from '@/core/ui/siteTheme';

/**
 * One dot per built-in theme. Picking one dresses the whole website in that theme;
 * the workspace theme does not change.
 */
export const ThemeSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { presetId, setPresetId } = useSitePreset();
  const current = THEME_PRESETS.find((preset) => preset.id === presetId) ?? THEME_PRESETS[0];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        role="group"
        aria-label="Website theme"
        className="flex flex-wrap justify-center gap-3 rounded-[28px] border border-site-line bg-site-surface p-2.5"
      >
        {THEME_PRESETS.map((preset) => {
          const isActive = preset.id === presetId;
          return (
            <button
              key={preset.id}
              type="button"
              data-testid={`site-preset-${preset.id}`}
              aria-pressed={isActive}
              aria-label={preset.name}
              title={preset.name}
              onClick={(event) => {
                if (isActive) return;
                spreadThemeChange(event.currentTarget, () =>
                  flushSync(() => setPresetId(preset.id))
                );
              }}
              className={`group/dot relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 motion-reduce:transition-none ${SITE_FOCUS} ${
                isActive
                  ? 'shadow-[0_0_0_2px_var(--site-bg),0_0_0_4px_var(--site-accent)]'
                  : 'hover:shadow-[0_0_0_2px_var(--site-bg),0_0_0_3px_var(--site-line)]'
              }`}
              style={{ backgroundColor: preset.config.tokens.bgSolidColor }}
            >
              {/* The theme color as a glowing dot on the theme background. */}
              <span
                aria-hidden="true"
                className={`rounded-full transition-[width,height] duration-300 motion-reduce:transition-none ${
                  isActive ? 'h-5 w-5' : 'h-3.5 w-3.5 group-hover/dot:h-5 group-hover/dot:w-5'
                }`}
                style={{
                  backgroundColor: preset.config.tokens.colorAccent,
                  boxShadow: `0 0 12px ${preset.config.tokens.colorAccent}`,
                }}
              />
            </button>
          );
        })}
      </div>
      <p className="text-sm text-site-muted" aria-live="polite">
        Wearing <span className="font-semibold text-site-text">{current.name}</span>. Pick a dot to
        change the whole site.
      </p>
    </div>
  );
};
