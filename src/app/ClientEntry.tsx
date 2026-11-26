import React, { useEffect } from 'react';
import App from './App';
import { initAnalytics } from '@/shared/lib/analytics';
import { initMonitoring, sendTestMessage } from '@/shared/lib/monitoring';

/** Browser entry of the app, loaded by the Next.js route in app/[[...slug]]. */
export default function ClientEntry() {
  useEffect(() => {
    // Both start in the background and do nothing without their environment variable.
    initMonitoring();
    initAnalytics();
    // Opening /?sentry_test sends one harmless message, to check the Sentry setup from the dashboard.
    if (new URLSearchParams(window.location.search).has('sentry_test')) sendTestMessage();
  }, []);

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
