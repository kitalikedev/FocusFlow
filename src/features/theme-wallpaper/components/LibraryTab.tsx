import React, { useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import type { ThemeConfig } from '@/shared/types/contracts';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { CATEGORY_LABELS, WALLPAPER_CATALOG, type WallpaperCategory } from '../lib/catalog';
import { THEME_PRESETS } from '../lib/presets';
import { ACCEPTED_TYPES } from '../lib/sampleImage';
import { useThemeLibraryStore, wallpaperLimit } from '../store/useThemeLibraryStore';
import { ThemeCard, WallpaperSwatch } from './ThemeCard';
import { backgroundFor } from './WallpaperLayer';

type Filter = 'all' | 'presets' | WallpaperCategory | 'uploads';

const SOLID_COLORS = ['#09090b', '#121214', '#0f172a', '#1c1917', '#14532d', '#312e81'];

interface LibraryTabProps {
  onApply: (config: ThemeConfig) => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div className="mb-2 flex items-center justify-between">
    <h3 className="text-xs font-medium uppercase tracking-wider text-white/50">{children}</h3>
    {action}
  </div>
);

/** Theme library (FR-13, FR-14, FR-27): presets, wallpapers by category, uploads and solid colors. */
export const LibraryTab: React.FC<LibraryTabProps> = ({ onApply }) => {
  const config = useThemeStore((state) => state.config);
  const customs = useThemeLibraryStore((state) => state.customWallpapers);
  const isUploading = useThemeLibraryStore((state) => state.isUploading);
  const [filter, setFilter] = useState<Filter>('all');
  const fileInput = useRef<HTMLInputElement>(null);

  const categories = (Object.keys(CATEGORY_LABELS) as WallpaperCategory[]).filter((category) =>
    WALLPAPER_CATALOG.some((wallpaper) => wallpaper.category === category),
  );
  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'presets', label: 'Themes' },
    ...categories.map((category) => ({ id: category, label: CATEGORY_LABELS[category] })),
    { id: 'uploads', label: 'My uploads' },
  ];
  const show = (section: Filter) => filter === 'all' || filter === section;
  const ref = config.wallpaperRef;
  const setWallpaper = (wallpaperRef: ThemeConfig['wallpaperRef']) =>
    onApply({ ...config, presetId: undefined, wallpaperRef });

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const uploaded = await useThemeLibraryStore.getState().uploadWallpaper(file);
    if (uploaded) setWallpaper({ type: 'custom', idOrColor: uploaded.id });
  };

  return (
    <div className="flex flex-col gap-6 p-5 pt-1">
      <div role="group" aria-label="Filter the library" className="flex flex-wrap gap-1.5">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              filter === item.id ? 'bg-accent text-accent-contrast' : 'bg-white/10 text-white/75 hover:bg-white/20'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {show('presets') && (
        <section>
          <SectionTitle>Themes</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {THEME_PRESETS.map((preset) => (
              <ThemeCard
                key={preset.id}
                testId={`preset-${preset.id}`}
                name={preset.name}
                config={preset.config}
                isActive={config.presetId === preset.id}
                onSelect={() => onApply(preset.config)}
              />
            ))}
          </div>
        </section>
      )}

      {categories.filter(show).map((category) => (
        <section key={category}>
          <SectionTitle>{CATEGORY_LABELS[category]}</SectionTitle>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {WALLPAPER_CATALOG.filter((wallpaper) => wallpaper.category === category).map((wallpaper) => {
              const background = backgroundFor({ type: 'preset', idOrColor: wallpaper.id }, customs, '#000', false);
              return (
                <WallpaperSwatch
                  key={wallpaper.id}
                  testId={`wallpaper-${wallpaper.id}`}
                  label={wallpaper.name}
                  style={background.style}
                  isActive={ref.type === 'preset' && ref.idOrColor === wallpaper.id}
                  onSelect={() => setWallpaper({ type: 'preset', idOrColor: wallpaper.id })}
                />
              );
            })}
          </div>
        </section>
      ))}

      {show('uploads') && (
        <section>
          <SectionTitle
            action={
              <span className="text-[11px] text-white/40">
                {customs.length}/{wallpaperLimit()} · max 5 MB
              </span>
            }
          >
            My uploads
          </SectionTitle>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {customs.map((wallpaper) => (
              <WallpaperSwatch
                key={wallpaper.id}
                testId={`custom-${wallpaper.id}`}
                label={wallpaper.name}
                style={{ backgroundImage: `url("${wallpaper.url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                isActive={ref.type === 'custom' && ref.idOrColor === wallpaper.id}
                onSelect={() => setWallpaper({ type: 'custom', idOrColor: wallpaper.id })}
              >
                <button
                  type="button"
                  aria-label={`Delete ${wallpaper.name}`}
                  onClick={() => void useThemeLibraryStore.getState().deleteWallpaper(wallpaper.id)}
                  className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white/80 hover:text-white"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </button>
              </WallpaperSwatch>
            ))}
            <button
              type="button"
              data-testid="upload-wallpaper-btn"
              onClick={() => fileInput.current?.click()}
              disabled={isUploading}
              className="flex aspect-video flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/25 text-[11px] text-white/60 hover:border-white/50 hover:text-white disabled:opacity-50"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {isUploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
          <input
            ref={fileInput}
            data-testid="wallpaper-file-input"
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={upload}
          />
        </section>
      )}

      {show('colors') && (
        <section>
          <SectionTitle>Solid color</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {SOLID_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Solid ${color}`}
                aria-pressed={ref.type === 'solid' && ref.idOrColor === color}
                onClick={() =>
                  onApply({
                    ...config,
                    presetId: undefined,
                    tokens: { ...config.tokens, bgSolidColor: color },
                    wallpaperRef: { type: 'solid', idOrColor: color },
                  })
                }
                className={`h-8 w-8 rounded-full ${
                  ref.type === 'solid' && ref.idOrColor === color ? 'ring-2 ring-white' : 'ring-1 ring-white/20'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
