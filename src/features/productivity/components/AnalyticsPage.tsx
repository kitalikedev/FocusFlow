import React, { lazy, Suspense } from 'react';
import { PageShell } from '@/core/ui/PageShell';

const AnalyticsContent = lazy(() => import('./AnalyticsContent'));

/** Full page Focus Analytics (FR-21), data comes from the `focus_sessions` table (or the browser in Guest Mode). */
export const AnalyticsPage: React.FC = () => (
  <PageShell
    title="Focus Analytics"
    testId="analytics-page"
    description="Your focus minutes, daily streak and recent sessions. Sign in to keep them on every device."
  >
    <Suspense fallback={<p className="py-6 text-sm text-site-muted">Loading…</p>}>
      <AnalyticsContent />
    </Suspense>
  </PageShell>
);

export default AnalyticsPage;
