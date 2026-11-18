import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initAnalytics } from '@/shared/lib/analytics';
import { initMonitoring, sendTestMessage } from '@/shared/lib/monitoring';

// Both start in the background and do nothing without their environment variable.
initMonitoring();
initAnalytics();
// Opening /?sentry_test sends one harmless message, to check the Sentry setup from the dashboard.
if (new URLSearchParams(window.location.search).has('sentry_test')) sendTestMessage();

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
