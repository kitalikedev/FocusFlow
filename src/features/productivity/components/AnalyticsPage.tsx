import React from 'react';
import { PageShell } from '@/core/ui/PageShell';
import { AnalyticsContent } from './AnalyticsContent';

/**
 * Full page Focus Analytics (FR-21), data comes from the `focus_sessions` table (or the browser in Guest Mode).
 * The content is small and ships with the page: loading it later showed "Loading…" first and then pushed the
 * page down when it arrived (layout shift, Lighthouse issue #30).
 */
export const AnalyticsPage: React.FC = () => (
  <PageShell
    title="Focus Analytics"
    testId="analytics-page"
    description="Your focus minutes, daily streak and recent sessions. Sign in to keep them on every device."
  >
    <AnalyticsContent />
  </PageShell>
);

export default AnalyticsPage;
