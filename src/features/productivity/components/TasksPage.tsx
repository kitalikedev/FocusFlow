import React, { lazy, Suspense } from 'react';
import { PageShell } from '@/core/ui/PageShell';
import { useOpenTaskCount } from '../hooks/useOpenTaskCount';

const TasksContent = lazy(() => import('./TasksContent'));

/** Full page version of the task manager (FR-19), data comes from the `tasks` table (or the browser in Guest Mode). */
export const TasksPage: React.FC = () => {
  const openCount = useOpenTaskCount();

  return (
    <PageShell
      title="Tasks"
      testId="tasks-page"
      description={`${openCount} open. Search, filter and sort your tasks, then pick one as your next focus goal.`}
    >
      <Suspense fallback={<p className="p-5 text-xs text-white/50">Loading…</p>}>
        <TasksContent />
      </Suspense>
    </PageShell>
  );
};

export default TasksPage;
