import React, { lazy, Suspense } from 'react';
import { useUiStore } from '@/core/ui/useUiStore';
import { useProductivityData } from '../hooks/useProductivityData';

// Panels load on first open so they never weigh on the initial bundle.
const TasksPanel = lazy(() => import('./TasksPanel'));
const NotePanel = lazy(() => import('./NotePanel'));

/** Tasks and Notepad floating tools opened from the dock (FR-19, FR-20); bottom sheets on phones (FR-22). */
export const ToolPanels: React.FC = () => {
  useProductivityData();
  const isZen = useUiStore((state) => state.isZen);
  const isTasksOpen = useUiStore((state) => state.isTasksOpen);
  const isNoteOpen = useUiStore((state) => state.isNoteOpen);
  const togglePanel = useUiStore((state) => state.togglePanel);

  if (isZen) return null;

  return (
    <Suspense fallback={null}>
      {isTasksOpen && <TasksPanel onClose={() => togglePanel('tasks')} />}
      {isNoteOpen && <NotePanel onClose={() => togglePanel('note')} />}
    </Suspense>
  );
};
