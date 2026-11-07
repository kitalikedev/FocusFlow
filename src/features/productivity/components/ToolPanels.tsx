import React, { lazy, Suspense } from 'react';
import { usePresence } from '@/core/ui/usePresence';
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

  const tasks = usePresence(isTasksOpen);
  const note = usePresence(isNoteOpen);

  if (isZen) return null;

  return (
    <Suspense fallback={null}>
      {tasks.mounted && <TasksPanel closing={tasks.closing} onClose={() => togglePanel('tasks')} />}
      {note.mounted && <NotePanel closing={note.closing} onClose={() => togglePanel('note')} />}
    </Suspense>
  );
};
