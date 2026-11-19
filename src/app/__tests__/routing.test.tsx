import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// The slots pull in every feature (audio, wallpapers...); the routing test only needs a marker for each.
vi.mock('../slots', () => {
  const stub = (testId: string): React.FC<{ children?: React.ReactNode }> => {
    const Stub: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div data-testid={testId}>{children}</div>;
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
    ToolPanelsSlot: stub('tool-panels'),
    ThemesPageSlot: stub('themes-page'),
    AnalyticsPageSlot: stub('analytics-page'),
    QuoteSlot: stub('quotes'),
  };
});

import { Layout } from '../layout';
import { useAuthStore } from '@/core/auth/useAuthStore';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Layout />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  cleanup();
  useAuthStore.setState({ isAuthModalOpen: false, mergePrompt: 'hidden' });
});

describe('website pages', () => {
  it('shows the home page with a way into the workspace', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'A calm place to get more done' })).toBeInTheDocument();
    const [open] = screen.getAllByRole('link', { name: /Open FocusFlow/ });
    expect(open).toHaveAttribute('href', '/app');
    expect(screen.getByTestId('app-shell')).toHaveAttribute('hidden');
    // Titles are set by an effect that can run just after the page appears.
    await waitFor(() => expect(document.title).toBe('FocusFlow'));
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

  it('shows the About page with the team and a contact link', async () => {
    renderAt('/about');
    expect(await screen.findByRole('heading', { level: 1, name: 'About FocusFlow' })).toBeInTheDocument();
    expect(screen.getByText('Đàm Huỳnh Hoài Nam')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/kitalikedev/FocusFlow/issues');
    await waitFor(() => expect(document.title).toBe('About FocusFlow · FocusFlow'));
  });

  it('sends unknown addresses back to the home page', async () => {
    renderAt('/does-not-exist');
    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  });

  it('has the page links next to the brand and marks the current page', async () => {
    renderAt('/tracking');
    await screen.findByTestId('tracking-page');
    const nav = screen.getByRole('navigation', { name: 'Pages' });
    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Themes',
      'Analytics',
      'Tracking',
      'About',
    ]);
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
    expect(within(screen.getByTestId('site-menu')).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Themes',
      'Analytics',
      'Tracking',
      'About',
      'Open FocusFlow',
    ]);

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
    fireEvent.click(within(screen.getByTestId('site-menu')).getByRole('link', { name: 'Tracking' }));
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
