/**
 * Error logging with Sentry (Task 4b). Everything here is a no-op unless NEXT_PUBLIC_SENTRY_DSN is set, so a fresh clone,
 * the tests and Guest Mode keep working without it. The SDK is loaded on demand so it never weighs on the first page.
 *
 * Privacy: only the error itself (message, stack, browser and page address) is sent. No user, cookies, headers,
 * clicks, typed text or request data, so task titles, notes and goals never leave the browser.
 */
import type { ErrorEvent } from '@sentry/react';

type SentryModule = typeof import('@sentry/react');

const MAX_PENDING = 10;

let sentry: SentryModule | null = null;
let isStarting = false;
// Errors that happen while the SDK is still loading are kept and sent once it is ready.
const pending: Array<(module: SentryModule) => void> = [];

/** True when a Sentry DSN was provided at build time. */
export function isMonitoringConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

/** Removes everything that could identify the user from an event before it is sent. */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  delete event.user;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.data;
    delete event.request.query_string;
  }
  event.breadcrumbs = [];
  return event;
}

function whenReady(action: (module: SentryModule) => void): void {
  if (!isMonitoringConfigured()) return;
  if (sentry) action(sentry);
  else if (pending.length < MAX_PENDING) pending.push(action);
}

/** Starts Sentry in the background; safe to call more than once. */
export function initMonitoring(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || sentry || isStarting) return;
  isStarting = true;

  void import('@sentry/react')
    .then((module) => {
      module.init({
        dsn,
        environment: process.env.NODE_ENV,
        sendDefaultPii: false,
        // Error logging only: no performance tracing and no session replay.
        tracesSampleRate: 0,
        beforeSend: scrubEvent,
        // Clicks, typed text, console and network calls can contain what the user is working on.
        beforeBreadcrumb: () => null,
      });
      sentry = module;
      for (const action of pending.splice(0)) action(module);
    })
    .catch(() => {
      // Blocked by an ad blocker or a network error: the app must keep working without logging.
      isStarting = false;
      pending.length = 0;
    });
}

/** Reports an error that the app caught itself (for example in a slot error boundary). */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  whenReady((module) => {
    module.captureException(error, { extra: context });
  });
}

/** Sends one harmless message so the setup can be checked in the Sentry dashboard. */
export function sendTestMessage(): void {
  whenReady((module) => {
    module.captureMessage('Sentry test message from FocusFlow', 'info');
  });
}

/** Test helper: forgets the loaded SDK and the queue. */
export function resetMonitoringForTests(): void {
  sentry = null;
  isStarting = false;
  pending.length = 0;
}
