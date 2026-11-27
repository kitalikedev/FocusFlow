import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// The slots pull in every feature (audio, wallpapers...); the routing test only needs a marker for each.
vi.mock('../slots', () => {
  const stub = (testId: string): React.FC<{ children?: React.ReactNode }> => {
    const Stub: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
      <div data-testid={testId}>{children}</div>
    );
    return Stub;
  };
  return {
    WallpaperLayerSlot: stub('wallpaper'),
    EffectsLayerSlot: stub('effects'),
    HudSlot: stub('hud'),
    FocusIntentSlot: stub('focus-intent'),
    ClockDisplaySlot: stub('clock'),
    ClockSettingsSlot: stub('clock-settings'),
    WallpaperPickerSlot: stub('wallpaper-picker'),
    ThemeCustomizerSlot: stub('theme-customizer'),
    ControlBarSlot: stub('control-bar'),
    SoundPanelSlot: stub('sound-panel'),
    MiniPlayerSlot: stub('mini-player'),
    ToolPanelsSlot: stub('tool-panels'),
    ThemesPageSlot: stub('themes-page'),
    AnalyticsPageSlot: stub('analytics-page'),
    QuoteSlot: stub('quotes'),
  };
});

import { Layout } from '../layout';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { SITE_THEME_KEY } from '../site/useSiteTheme';
import { SITE_PRESET_KEY } from '@/core/ui/siteTheme';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Layout />
    </MemoryRouter>
  );
}

beforeEach(() => {
  cleanup();
  useAuthStore.setState({ isAuthModalOpen: false, mergePrompt: 'hidden' });
});

describe('website pages', () => {
  it('shows the home page with a way into the workspace', async () => {
    renderAt('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'A calm place to get more done' })
    ).toBeInTheDocument();
    const [open] = screen.getAllByRole('link', { name: /Open FocusFlow/ });
    expect(open).toHaveAttribute('href', '/app');
    expect(screen.getByTestId('app-shell')).toHaveAttribute('hidden');
    // Titles are set by an effect that can run just after the page appears.
    await waitFor(() => expect(document.title).toBe('FocusFlow'));
  });

  it('moves the workspace pictures with the arrows and shows the neighbours on both sides', async () => {
    window.localStorage.removeItem(SITE_PRESET_KEY);
    renderAt('/');
    const slideshow = within(await screen.findByTestId('theme-slideshow'));
    expect(slideshow.getByRole('img', { name: /Nebula theme/ })).toBeInTheDocument();
    // The current picture plus one on each side.
    expect(screen.getByTestId('theme-slideshow').querySelectorAll('img')).toHaveLength(3);

    fireEvent.click(slideshow.getByRole('button', { name: 'Next picture' }));
    expect(slideshow.getByRole('img', { name: /Obsidian Minimal theme/ })).toBeInTheDocument();

    fireEvent.click(slideshow.getByRole('button', { name: 'Previous picture' }));
    fireEvent.click(slideshow.getByRole('button', { name: 'Previous picture' }));
    expect(slideshow.getByRole('img', { name: /Vaporwave theme/ })).toBeInTheDocument();
  });

  it('shows the workspace with your own picture as the wallpaper', async () => {
    renderAt('/');
    const block = within(
      await screen.findByRole('region', {
        name: 'Make it fully yours with your own picture or GIF',
      })
    );
    expect(block.getByRole('img', { name: /black and white drawing uploaded/ })).toHaveAttribute(
      'loading',
      'lazy'
    );
    expect(block.getByText('Your picture')).toBeInTheDocument();
  });

  it.each([
    ['/themes', 'themes-page'],
    ['/analytics', 'analytics-page'],
  ])('shows the page for %s inside the website frame', async (path, testId) => {
    renderAt(path);
    expect(await screen.findByTestId(testId)).toBeInTheDocument();
    expect(screen.getByTestId('site-layout')).toBeInTheDocument();
  });

  it('scrolls inside its own container, because the page body is locked for the workspace', async () => {
    renderAt('/');
    await screen.findByTestId('home-page');
    expect(screen.getByTestId('site-layout')).toHaveClass('h-screen', 'overflow-y-auto');
  });

  it('has no separate Tasks page: tasks live in the workspace, so the old address goes home', async () => {
    renderAt('/tasks');
    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  });

  it('shows the Tracking page as coming soon', async () => {
    renderAt('/tracking');
    expect(await screen.findByRole('heading', { level: 1, name: 'Tracking' })).toBeInTheDocument();
    expect(screen.getByTestId('coming-soon')).toHaveTextContent('Coming soon');
    await waitFor(() => expect(document.title).toBe('Tracking · FocusFlow'));
  });

  it('shows the About page with the team', async () => {
    renderAt('/about');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'About FocusFlow' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đàm Huỳnh Hoài Nam/ })).toHaveAttribute(
      'href',
      'https://github.com/kitalikedev'
    );
    await waitFor(() => expect(document.title).toBe('About FocusFlow'));
  });

  it('has the contact details only on the home page, with a footer link to them from every page', async () => {
    renderAt('/');
    const contact = within(await screen.findByRole('region', { name: 'Contact us' }));
    expect(contact.getByRole('link', { name: /damnam2456@gmail.com/ })).toHaveAttribute(
      'href',
      'mailto:damnam2456@gmail.com'
    );
    expect(contact.getByRole('link', { name: /Open an issue on GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/kitalikedev/FocusFlow/issues'
    );
    cleanup();

    renderAt('/about');
    await screen.findByTestId('about-page');
    expect(screen.queryByRole('region', { name: 'Contact us' })).not.toBeInTheDocument();
    const footer = screen.getByRole('navigation', { name: 'Footer' });
    expect(within(footer).getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      '/#contact'
    );
  });

  it('sends unknown addresses back to the home page', async () => {
    renderAt('/does-not-exist');
    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  });

  it('has the page links next to the brand and marks the current page', async () => {
    renderAt('/tracking');
    await screen.findByTestId('tracking-page');
    const nav = screen.getByRole('navigation', { name: 'Pages' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Themes', 'Analytics', 'Tracking', 'About']);
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('Tracking');
  });

  it('navigates between the pages and back home through the brand', async () => {
    renderAt('/');
    await screen.findByTestId('home-page');
    const nav = screen.getByRole('navigation', { name: 'Pages' });

    fireEvent.click(within(nav).getByRole('link', { name: 'Analytics' }));
    expect(await screen.findByTestId('analytics-page')).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole('link', { name: 'About' }));
    expect(await screen.findByTestId('about-page')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'FocusFlow' }));
    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  });
});

describe('light and dark mode', () => {
  beforeEach(() => {
    window.localStorage.removeItem(SITE_THEME_KEY);
    window.localStorage.removeItem(SITE_PRESET_KEY);
  });

  it('dresses the whole website in the theme picked on the home page and remembers it', async () => {
    renderAt('/');
    await screen.findByTestId('home-page');
    const site = screen.getByTestId('site-layout');
    expect(site).toHaveAttribute('data-preset', 'nebula');

    fireEvent.click(screen.getByRole('button', { name: 'Retro Terminal' }));
    expect(site).toHaveAttribute('data-preset', 'retro-terminal');
    expect(screen.getByRole('button', { name: 'Retro Terminal' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(site.style.getPropertyValue('--theme-accent')).not.toBe('');
    expect(window.localStorage.getItem(SITE_PRESET_KEY)).toBe('retro-terminal');
    // The workspace picture follows the website theme.
    expect(
      within(screen.getByTestId('theme-slideshow')).getByRole('img', {
        name: /Retro Terminal theme/,
      })
    ).toBeInTheDocument();

    cleanup();
    renderAt('/about');
    await screen.findByTestId('about-page');
    expect(screen.getByTestId('site-layout')).toHaveAttribute('data-preset', 'retro-terminal');
  });

  it('switches the website between dark and light and remembers the choice', async () => {
    renderAt('/');
    await screen.findByTestId('home-page');
    const site = screen.getByTestId('site-layout');
    const button = screen.getByTestId('site-theme-btn');
    expect(site).toHaveAttribute('data-theme', 'dark');
    expect(button).toHaveAccessibleName('Switch to light mode');

    fireEvent.click(button);
    expect(site).toHaveAttribute('data-theme', 'light');
    expect(button).toHaveAccessibleName('Switch to dark mode');
    expect(window.localStorage.getItem(SITE_THEME_KEY)).toBe('light');

    cleanup();
    renderAt('/about');
    await screen.findByTestId('about-page');
    expect(screen.getByTestId('site-layout')).toHaveAttribute('data-theme', 'light');
  });
});

describe('menu for small screens', () => {
  it('opens and closes with the menu button', async () => {
    renderAt('/');
    await screen.findByTestId('home-page');
    const button = screen.getByTestId('site-menu-btn');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('site-menu')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    // The four pages plus the "Open FocusFlow" button that only the menu shows on phones.
    expect(
      within(screen.getByTestId('site-menu'))
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Themes', 'Analytics', 'Tracking', 'About', 'Open FocusFlow']);

    fireEvent.click(button);
    expect(screen.queryByTestId('site-menu')).not.toBeInTheDocument();
  });

  it('closes with Escape and after choosing a page', async () => {
    renderAt('/');
    await screen.findByTestId('home-page');
    fireEvent.click(screen.getByTestId('site-menu-btn'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('site-menu')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('site-menu-btn'));
    fireEvent.click(
      within(screen.getByTestId('site-menu')).getByRole('link', { name: 'Tracking' })
    );
    expect(await screen.findByTestId('tracking-page')).toBeInTheDocument();
    expect(screen.queryByTestId('site-menu')).not.toBeInTheDocument();
  });

  it('closes when clicking outside the header', async () => {
    renderAt('/');
    await screen.findByTestId('home-page');
    fireEvent.click(screen.getByTestId('site-menu-btn'));
    fireEvent.pointerDown(screen.getByTestId('home-page'));
    expect(screen.queryByTestId('site-menu')).not.toBeInTheDocument();
  });
});

describe('workspace at /app', () => {
  it('shows the workspace and no website frame', async () => {
    renderAt('/app');
    const shell = screen.getByTestId('app-shell');
    expect(shell).not.toHaveAttribute('hidden');
    expect(within(shell).getByTestId('clock')).toBeInTheDocument();
    expect(within(shell).getByTestId('tool-dock')).toBeInTheDocument();
    expect(screen.queryByTestId('site-layout')).not.toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Workspace · FocusFlow'));
  });

  it('keeps the workspace mounted while a website page is shown so the timer and sounds keep going', async () => {
    renderAt('/analytics');
    await screen.findByTestId('analytics-page');
    const shell = screen.getByTestId('app-shell');
    expect(shell).toHaveAttribute('hidden');
    expect(within(shell).getByTestId('control-bar')).toBeInTheDocument();
    expect(within(shell).getByTestId('sound-panel')).toBeInTheDocument();
  });
});
