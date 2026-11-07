import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ThemeConfig } from '@/shared/types/contracts';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { SlideOver } from '@/core/ui/SlideOver';
import { applyAndSaveTheme, readableConfig, useThemeLibraryStore } from '../store/useThemeLibraryStore';
import { CustomizeTab } from './CustomizeTab';
import { LibraryTab } from './LibraryTab';
import { SavedThemesTab } from './SavedThemesTab';

export type ThemeTab = 'library' | 'customize' | 'saved';

const TABS: { id: ThemeTab; label: string }[] = [
  { id: 'library', label: 'Library' },
  { id: 'customize', label: 'Customize' },
  { id: 'saved', label: 'My Themes' },
];

/**
 * Themes panel. Library and My Themes apply and save at once; Customize edits a draft shown live
 * (AC-25.1) that only Apply saves. Revert, or closing without Apply, restores the saved theme.
 */
export const ThemePanel: React.FC<{ initialTab?: ThemeTab; closing?: boolean; onClose: () => void }> = ({
  initialTab = 'library',
  closing = false,
  onClose,
}) => {
  const [tab, setTab] = useState<ThemeTab>(initialTab);
  const [saved, setSaved] = useState<ThemeConfig>(() => useThemeStore.getState().config);
  const [draft, setDraft] = useState<ThemeConfig>(saved);
  const [isDirty, setDirty] = useState(false);
  const pending = useRef({ isDirty, saved });
  pending.current = { isDirty, saved };

  // Closing with unapplied edits brings the saved theme back, at once and not after the exit animation.
  useEffect(() => {
    if (closing && pending.current.isDirty) {
      useThemeStore.getState().setConfig(pending.current.saved);
      setDirty(false);
    }
  }, [closing]);
  useEffect(
    () => () => {
      if (pending.current.isDirty) useThemeStore.getState().setConfig(pending.current.saved);
    },
    [],
  );

  const applyNow = useCallback((config: ThemeConfig) => {
    const readable = readableConfig(config, useThemeLibraryStore.getState().customWallpapers);
    setSaved(readable);
    setDraft(readable);
    setDirty(false);
    void applyAndSaveTheme(readable);
  }, []);

  const preview = (next: ThemeConfig) => {
    setDraft(next);
    setDirty(true);
    useThemeStore.getState().setConfig(readableConfig(next, useThemeLibraryStore.getState().customWallpapers));
  };

  const revert = () => {
    useThemeStore.getState().setConfig(saved);
    setDraft(saved);
    setDirty(false);
  };

  return (
    <SlideOver
      title="Themes"
      testId="theme-panel"
      closing={closing}
      onClose={onClose}
      toolbar={
        <div role="tablist" aria-label="Theme sections" className="flex gap-1 rounded-xl bg-white/5 p-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                tab === item.id ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      {tab === 'library' && <LibraryTab onApply={applyNow} />}
      {tab === 'customize' && (
        <CustomizeTab
          draft={draft}
          isDirty={isDirty}
          onChange={preview}
          onApply={() => applyNow(draft)}
          onRevert={revert}
          onSaveAsNew={(name) =>
            useThemeLibraryStore
              .getState()
              .saveTheme(name, readableConfig(draft, useThemeLibraryStore.getState().customWallpapers))
          }
        />
      )}
      {tab === 'saved' && <SavedThemesTab activeConfig={saved} onApply={applyNow} />}
    </SlideOver>
  );
};

export default ThemePanel;
