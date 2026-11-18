import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ErrorEvent } from '@sentry/react';

const sentry = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));
vi.mock('@sentry/react', () => sentry);

import {
  captureError,
  initMonitoring,
  isMonitoringConfigured,
  resetMonitoringForTests,
  scrubEvent,
  sendTestMessage,
} from '../monitoring';

const DSN = 'https://key@o1.ingest.us.sentry.io/1';

beforeEach(() => {
  vi.clearAllMocks();
  resetMonitoringForTests();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('error logging without a DSN', () => {
  it('does nothing at all', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    initMonitoring();
    captureError(new Error('boom'));
    sendTestMessage();
    await Promise.resolve();

    expect(isMonitoringConfigured()).toBe(false);
    expect(sentry.init).not.toHaveBeenCalled();
    expect(sentry.captureException).not.toHaveBeenCalled();
    expect(sentry.captureMessage).not.toHaveBeenCalled();
  });
});

describe('error logging with a DSN', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SENTRY_DSN', DSN);
  });

  it('starts once with errors only and no personal data', async () => {
    initMonitoring();
    initMonitoring();
    await vi.waitFor(() => expect(sentry.init).toHaveBeenCalledTimes(1));

    const options = sentry.init.mock.calls[0][0];
    expect(options).toMatchObject({ dsn: DSN, sendDefaultPii: false, tracesSampleRate: 0 });
    expect(options.beforeSend).toBe(scrubEvent);
    expect(options.beforeBreadcrumb()).toBeNull();
    expect(options.replaysSessionSampleRate).toBeUndefined();
  });

  it('keeps errors that happen while loading and sends them once ready', async () => {
    initMonitoring();
    const error = new Error('early');
    captureError(error, { where: 'slot' });
    expect(sentry.captureException).not.toHaveBeenCalled();

    await vi.waitFor(() => expect(sentry.captureException).toHaveBeenCalledTimes(1));
    expect(sentry.captureException).toHaveBeenCalledWith(error, { extra: { where: 'slot' } });
  });

  it('sends errors straight away once started, and the test message as info', async () => {
    initMonitoring();
    await vi.waitFor(() => expect(sentry.init).toHaveBeenCalled());
    await Promise.resolve();

    const error = new Error('later');
    captureError(error);
    expect(sentry.captureException).toHaveBeenCalledWith(error, { extra: undefined });

    sendTestMessage();
    expect(sentry.captureMessage).toHaveBeenCalledWith('Sentry test message from FocusFlow', 'info');
  });

  it('keeps at most 10 errors while loading', async () => {
    initMonitoring();
    for (let index = 0; index < 15; index += 1) captureError(new Error(`e${index}`));
    await vi.waitFor(() => expect(sentry.captureException).toHaveBeenCalled());
    expect(sentry.captureException).toHaveBeenCalledTimes(10);
  });
});

describe('scrubEvent', () => {
  it('removes the user, cookies, headers, request data and breadcrumbs', () => {
    const event = {
      message: 'boom',
      user: { id: 'u1', email: 'a@b.c' },
      request: {
        url: 'https://focus-flow-two-wheat.vercel.app/app',
        cookies: { sb: 'x' },
        headers: { 'User-Agent': 'x' },
        data: 'secret',
        query_string: 'a=1',
      },
      breadcrumbs: [{ message: 'clicked "Write the report"' }],
    } as unknown as ErrorEvent;

    const cleaned = scrubEvent(event);
    expect(cleaned.user).toBeUndefined();
    expect(cleaned.request).toEqual({ url: 'https://focus-flow-two-wheat.vercel.app/app' });
    expect(cleaned.breadcrumbs).toEqual([]);
    expect(cleaned.message).toBe('boom');
  });

  it('copes with an event that has no request', () => {
    expect(scrubEvent({ message: 'x' } as ErrorEvent)).toEqual({ message: 'x', breadcrumbs: [] });
  });
});
