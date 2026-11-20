import { describe, it, expect, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { act, fireEvent, render as baseRender, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemesPage } from '../index';
import { THEME_PRESETS } from '../lib/presets';
import { useThemeLibraryStore } from '../store/useThemeLibraryStore';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { DEFAULT_SITE_PRESET, SitePresetContext } from '@/core/ui/siteTheme';

// Stands in for the website frame, which holds the theme the website wears.
const SiteFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [presetId, setPresetId] = useState(DEFAULT_SITE_PRESET);
  return (
    <SitePresetContext.Provider value={{ presetId, setPresetId }}>
      <div data-testid="site-frame" data-preset={presetId}>
        {children}
      </div>
    </SitePresetContext.Provider>
  );
};

// The page links back to the workspace and the contact section, so it needs a router.
const render = (ui: React.ReactElement) =>
  baseRender(
    <MemoryRouter>
      <SiteFrame>{ui}</SiteFrame>
    </MemoryRouter>
  );

beforeEach(() => {
  useThemeLibraryStore.setState({ customWallpapers: [], savedThemes: [], isUploading: false });
});

describe('ThemesPage (FR-27)', () => {
  it('lists every built-in theme as a preview, plus a note that more are coming', async () => {
    render(<ThemesPage />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Themes' })).toBeInTheDocument();
    for (const preset of THEME_PRESETS) {
      expect(screen.getByTestId(`theme-preview-${preset.id}`)).toHaveTextContent(preset.name);
    }
    expect(screen.getByText(`Built-in themes (${THEME_PRESETS.length})`)).toBeInTheDocument();
    expect(screen.getByTestId('more-themes')).toHaveTextContent('More themes coming soon');
    // The title is set by an effect that can run just after the page appears.
    await waitFor(() => expect(document.title).toBe('Themes · FocusFlow'));
  });

  it('dresses the website in the theme you pick without changing the workspace theme', async () => {
    render(<ThemesPage />);
    await screen.findByTestId('themes-page');
    const before = useThemeStore.getState();
    expect(screen.getByTestId('theme-preview-name')).toHaveTextContent(THEME_PRESETS[0].name);

    const last = THEME_PRESETS[THEME_PRESETS.length - 1];
    fireEvent.click(screen.getByTestId(`theme-preview-${last.id}`));
    expect(screen.getByTestId(`theme-preview-${last.id}`)).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId(`theme-preview-${THEME_PRESETS[0].id}`)).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByTestId('theme-preview-name')).toHaveTextContent(last.name);
    expect(screen.getByTestId('site-frame')).toHaveAttribute('data-preset', last.id);
    expect(screen.getByRole('img', { name: new RegExp(last.name) })).toHaveAttribute(
      'src',
      `/images/home/theme-${last.id}.webp`
    );
    expect(useThemeStore.getState()).toBe(before);
  });

  it('shows the themes the user saved only when there are some', async () => {
    const { unmount } = render(<ThemesPage />);
    await screen.findByTestId('themes-page');
    expect(screen.queryByText(/Your saved themes/)).not.toBeInTheDocument();
    unmount();

    act(() =>
      useThemeLibraryStore.setState({
        savedThemes: [
          {
            id: 'saved-1',
            name: 'My focus night',
            config: THEME_PRESETS[0].config,
            createdAt: '2026-11-17T00:00:00.000Z',
            updatedAt: '2026-11-17T00:00:00.000Z',
          },
        ],
      })
    );
    render(<ThemesPage />);
    expect(await screen.findByText('Your saved themes (1)')).toBeInTheDocument();
    expect(screen.getByTestId('saved-preview-saved-1')).toHaveTextContent('My focus night');
  });
});
