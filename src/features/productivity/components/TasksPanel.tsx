import React from 'react';
import { ListChecks } from 'lucide-react';
import { FloatingPanel } from '@/core/ui/FloatingPanel';
import { useOpenTaskCount } from '../hooks/useOpenTaskCount';
import { TasksContent } from './TasksContent';

/** Floating task manager opened from the dock (FR-19). */
export const TasksPanel: React.FC<{ onClose: () => void; closing?: boolean }> = ({ onClose, closing }) => {
  const openCount = useOpenTaskCount();

  return (
    <FloatingPanel
      title="Tasks"
      testId="tasks-panel"
      closing={closing}
      icon={<ListChecks className="h-4 w-4" />}
      onClose={onClose}
      actions={<span className="text-xs text-white/50">{openCount} open</span>}
    >
      <TasksContent />
    </FloatingPanel>
  );
};

export default TasksPanel;
