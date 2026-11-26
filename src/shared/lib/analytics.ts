/**
 * Google Analytics 4 (Task 4b). A no-op unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set, and also when the browser sends
 * "Do Not Track". Page views are sent by us on every route change; only a fixed list of events with numbers or
 * fixed words is ever sent. Never titles, notes, goals or any other text the user typed.
 */

export type AnalyticsEvent = 'focus_session_completed';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const GA_ID_PATTERN = /^G-[A-Z0-9]{4,}$/;

let started = false;

function measurementId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id && GA_ID_PATTERN.test(id) ? id : null;
}

function isDoNotTrack(): boolean {
  return typeof navigator !== 'undefined' && navigator.doNotTrack === '1';
}

/** True once Google Analytics is running. */
export function isAnalyticsActive(): boolean {
  return started;
}

function loadScript(id: string): void {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

/** Starts Google Analytics after the page finished loading, so it never slows the first paint. */
export function initAnalytics(): void {
  const id = measurementId();
  if (!id || started || isDoNotTrack()) return;
  started = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js expects the real `arguments` object, not an array.
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, {
    send_page_view: false, // sent by trackPageView on each route change
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  if (document.readyState === 'complete') loadScript(id);
  else window.addEventListener('load', () => loadScript(id), { once: true });
}

/** Records that the user opened a page; `path` has no query string or hash. */
export function trackPageView(path: string, title: string): void {
  if (!started || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: `${window.location.origin}${path}`,
  });
}

/** Records one of the allowed events; parameters must be numbers or fixed words. */
export function trackEvent(name: AnalyticsEvent, params: Record<string, number | string> = {}): void {
  if (!started || !window.gtag) return;
  window.gtag('event', name, params);
}

/** Test helper: forgets that analytics was started. */
export function resetAnalyticsForTests(): void {
  started = false;
}
