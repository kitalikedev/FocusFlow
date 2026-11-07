import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { SavedTheme, ThemeConfig } from '@/shared/types/contracts';
import { themeLimit, useThemeLibraryStore } from '../store/useThemeLibraryStore';
import { ThemeCard } from './ThemeCard';

const RenameForm: React.FC<{ theme: SavedTheme; onDone: () => void }> = ({ theme, onDone }) => {
  const [name, setName] = useState(theme.name);
  return (
    <form
      className="flex gap-1"
      onSubmit={async (event) => {
        event.preventDefault();
        if (name.trim() && (await useThemeLibraryStore.getState().renameTheme(theme.id, name.trim()))) onDone();
      }}
    >
      <input
        aria-label={`New name for ${theme.name}`}
        value={name}
        maxLength={50}
        autoFocus
        onChange={(event) => setName(event.target.value)}
        className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
      />
      <button type="submit" className="rounded-md bg-white/10 px-2 text-xs text-white">
        OK
      </button>
    </form>
  );
};

/** Saved themes (FR-27): apply, rename and delete; 10 for accounts, 3 for guests. */
export const SavedThemesTab: React.FC<{ activeConfig: ThemeConfig; onApply: (config: ThemeConfig) => void }> = ({
  activeConfig,
  onApply,
}) => {
  const themes = useThemeLibraryStore((state) => state.savedThemes);
  const [renaming, setRenaming] = useState<string | null>(null);
  const limit = themeLimit();

  return (
    <div className="flex flex-col gap-4 p-5 pt-1">
      <p className="text-xs text-white/50">
        {themes.length}/{limit} saved. Create one from the Customize tab with “Save as New Theme”.
      </p>
      {themes.length === 0 ? (
        <p className="py-8 text-center text-xs text-white/50">No saved theme yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {themes.map((theme) => (
            <li key={theme.id} data-testid="saved-theme" className="flex flex-col gap-1.5">
              <ThemeCard
                name={theme.name}
                config={theme.config}
                isActive={JSON.stringify(theme.config.tokens) === JSON.stringify(activeConfig.tokens) &&
                  JSON.stringify(theme.config.wallpaperRef) === JSON.stringify(activeConfig.wallpaperRef)}
                onSelect={() => onApply(theme.config)}
              />
              {renaming === theme.id ? (
                <RenameForm theme={theme} onDone={() => setRenaming(null)} />
              ) : (
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    aria-label={`Rename ${theme.name}`}
                    onClick={() => setRenaming(theme.id)}
                    className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${theme.name}`}
                    onClick={() => void useThemeLibraryStore.getState().deleteTheme(theme.id)}
                    className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
