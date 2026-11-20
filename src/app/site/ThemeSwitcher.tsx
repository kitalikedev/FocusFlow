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
        className="flex flex-wrap justify-center gap-2.5"
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
              className={`relative h-8 w-8 rounded-full border-2 transition-transform duration-300 hover:scale-125 motion-reduce:transition-none ${SITE_FOCUS} ${
                isActive ? 'scale-110 border-site-text' : 'border-transparent'
              }`}
              style={{
                background: `linear-gradient(135deg, ${preset.config.tokens.bgSolidColor} 50%, ${preset.config.tokens.colorAccent} 50%)`,
              }}
            />
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
