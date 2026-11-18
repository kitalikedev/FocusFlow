import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initAnalytics,
  isAnalyticsActive,
  resetAnalyticsForTests,
  trackEvent,
  trackPageView,
} from '../analytics';

function setDoNotTrack(value: string | null) {
  Object.defineProperty(window.navigator, 'doNotTrack', { value, configurable: true });
}

beforeEach(() => {
  resetAnalyticsForTests();
  delete window.gtag;
  delete window.dataLayer;
  document.head.querySelectorAll('script[src*="googletagmanager"]').forEach((node) => node.remove());
  setDoNotTrack(null);
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Google Analytics', () => {
  it('does nothing without a Measurement ID', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
    initAnalytics();
    trackPageView('/', 'Home');
    trackEvent('focus_session_completed', { minutes: 25 });

    expect(isAnalyticsActive()).toBe(false);
    expect(window.gtag).toBeUndefined();
    expect(document.head.querySelector('script[src*="googletagmanager"]')).toBeNull();
  });

  it('ignores a value that is not a Measurement ID', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'UA-123');
    initAnalytics();
    expect(isAnalyticsActive()).toBe(false);
  });

  it('stays off when the browser sends Do Not Track', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST12345');
    setDoNotTrack('1');
    initAnalytics();
    expect(isAnalyticsActive()).toBe(false);
    expect(window.gtag).toBeUndefined();
  });

  it('configures gtag without automatic page views or ad features and loads the script once the page is loaded', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST12345');
    initAnalytics();
    initAnalytics(); // calling twice must not start it twice

    expect(isAnalyticsActive()).toBe(true);
    const calls = (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toBe('js');
    expect(calls[1]).toEqual([
      'config',
      'G-TEST12345',
      { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false },
    ]);

    // jsdom starts as "complete", so the script is added right away.
    const scripts = document.head.querySelectorAll('script[src*="googletagmanager"]');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].getAttribute('src')).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST12345');
  });

  it('sends page views with a path and a fixed name', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST12345');
    initAnalytics();
    trackPageView('/themes', 'Themes');

    const last = Array.from((window.dataLayer ?? []).at(-1) as ArrayLike<unknown>);
    expect(last).toEqual([
      'event',
      'page_view',
      { page_path: '/themes', page_title: 'Themes', page_location: `${window.location.origin}/themes` },
    ]);
  });

  it('sends the allowed events with their numbers only', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST12345');
    initAnalytics();
    trackEvent('focus_session_completed', { minutes: 25 });

    const last = Array.from((window.dataLayer ?? []).at(-1) as ArrayLike<unknown>);
    expect(last).toEqual(['event', 'focus_session_completed', { minutes: 25 }]);
  });
});
