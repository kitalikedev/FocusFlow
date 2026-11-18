import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { ThemesPage } from '../index';
import { THEME_PRESETS } from '../lib/presets';
import { useThemeLibraryStore } from '../store/useThemeLibraryStore';

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

  it('is preview only: the cards are not buttons', async () => {
    render(<ThemesPage />);
    await screen.findByTestId('themes-page');
    expect(within(screen.getByTestId('themes-page')).queryAllByRole('button')).toHaveLength(0);
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
      }),
    );
    render(<ThemesPage />);
    expect(await screen.findByText('Your saved themes (1)')).toBeInTheDocument();
    expect(screen.getByTestId('saved-preview-saved-1')).toHaveTextContent('My focus night');
  });
});
