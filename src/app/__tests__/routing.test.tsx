import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    TasksPageSlot: stub('tasks-page'),
    AnalyticsPageSlot: stub('analytics-page'),
    QuoteSlot: stub('quotes'),
  };
});

import { Layout } from '../layout';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useUiStore } from '@/core/ui/useUiStore';

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
  useUiStore.setState({ isZen: false });
});

describe('pages and navigation', () => {
  it('shows the clock on the home page and no other page', () => {
    renderAt('/');
    expect(screen.getByTestId('clock')).toBeInTheDocument();
    expect(screen.queryByTestId('tasks-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('analytics-page')).not.toBeInTheDocument();
    expect(document.title).toBe('FocusFlow');
  });

  it.each([
    ['/tasks', 'tasks-page'],
    ['/analytics', 'analytics-page'],
  ])('shows the page for %s instead of the clock', (path, testId) => {
    renderAt(path);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
    expect(screen.queryByTestId('clock')).not.toBeInTheDocument();
  });

  it('shows the About page with the team and a contact link', async () => {
    renderAt('/about');
    expect(await screen.findByRole('heading', { level: 1, name: 'About FocusFlow' })).toBeInTheDocument();
    expect(screen.getByText('Đàm Huỳnh Hoài Nam')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/kitalikedev/FocusFlow/issues');
    expect(document.title).toBe('About FocusFlow · FocusFlow');
  });

  it('sends unknown addresses back to the home page', () => {
    renderAt('/does-not-exist');
    expect(screen.getByTestId('clock')).toBeInTheDocument();
  });

  it('keeps the docks and sounds mounted on every page so nothing stops while navigating', () => {
    renderAt('/tasks');
    expect(screen.getByTestId('tool-dock')).toBeInTheDocument();
    expect(screen.getByTestId('control-bar')).toBeInTheDocument();
    expect(screen.getByTestId('sound-panel')).toBeInTheDocument();
  });

  it('navigates with the page links and marks the current page', async () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Pages' });
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('Workspace');

    fireEvent.click(screen.getByRole('link', { name: 'Tasks' }));
    expect(screen.getByTestId('tasks-page')).toBeInTheDocument();
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('Tasks');

    fireEvent.click(screen.getByRole('link', { name: 'Analytics' }));
    expect(screen.getByTestId('analytics-page')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'About' }));
    expect(await screen.findByTestId('about-page')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Workspace' }));
    expect(screen.getByTestId('clock')).toBeInTheDocument();
  });

  it('hides the navigation in Zen mode', () => {
    useUiStore.setState({ isZen: true });
    renderAt('/');
    expect(screen.queryByTestId('page-nav')).not.toBeInTheDocument();
  });
});
