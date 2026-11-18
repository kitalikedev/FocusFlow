import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';

const analytics = vi.hoisted(() => ({ trackPageView: vi.fn() }));
vi.mock('@/shared/lib/analytics', () => analytics);
const monitoring = vi.hoisted(() => ({ captureError: vi.fn() }));
vi.mock('@/shared/lib/monitoring', () => monitoring);

import { PageTracker } from '../PageTracker';
import { SlotErrorBoundary } from '../slots';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PageTracker', () => {
  it('sends a page view with a fixed name for each page, once per change', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PageTracker />
        <Link to="/themes">themes</Link>
        <Link to="/app">workspace</Link>
        <Link to="/somewhere-else">other</Link>
      </MemoryRouter>,
    );
    expect(analytics.trackPageView).toHaveBeenLastCalledWith('/', 'Home');

    fireEvent.click(screen.getByText('themes'));
    expect(analytics.trackPageView).toHaveBeenLastCalledWith('/themes', 'Themes');
    fireEvent.click(screen.getByText('workspace'));
    expect(analytics.trackPageView).toHaveBeenLastCalledWith('/app', 'Workspace');
    fireEvent.click(screen.getByText('other'));
    expect(analytics.trackPageView).toHaveBeenLastCalledWith('/somewhere-else', 'Other');
    expect(analytics.trackPageView).toHaveBeenCalledTimes(4);
  });
});

describe('SlotErrorBoundary', () => {
  const Broken: React.FC = () => {
    throw new Error('slot exploded');
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hides the broken slot, keeps the rest and reports the error', () => {
    render(
      <SlotErrorBoundary>
        <Broken />
        <span>never shown</span>
      </SlotErrorBoundary>,
    );
    expect(screen.queryByText('never shown')).not.toBeInTheDocument();
    expect(monitoring.captureError).toHaveBeenCalledTimes(1);
    const [error, context] = monitoring.captureError.mock.calls[0];
    expect((error as Error).message).toBe('slot exploded');
    expect(context).toHaveProperty('componentStack');
  });

  it('does not report anything when nothing breaks', () => {
    render(
      <SlotErrorBoundary>
        <span>fine</span>
      </SlotErrorBoundary>,
    );
    expect(screen.getByText('fine')).toBeInTheDocument();
    expect(monitoring.captureError).not.toHaveBeenCalled();
  });
});
