import React, { useMemo, useState } from 'react';
import { ListChecks, Plus, Search } from 'lucide-react';
import type { TaskPriority } from '@/shared/types/contracts';
import { LIMITS } from '@/core/data/defaults';
import { FloatingPanel } from '@/core/ui/FloatingPanel';
import { applyView, type TaskSort } from '../lib/tasks';
import { useTasksStore } from '../store/useTasksStore';
import { ClearLabelButton, TaskRow } from './TaskRow';

const FIELD_CLASS =
  'rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

/** Task manager (FR-19): quick add, edit, complete, delete, search, filter and sort. */
export const TasksPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const tasks = useTasksStore((state) => state.tasks);
  const status = useTasksStore((state) => state.status);
  const view = useTasksStore((state) => state.view);
  const setView = useTasksStore((state) => state.setView);
  const addTask = useTasksStore((state) => state.addTask);
  const [title, setTitle] = useState('');

  const visible = useMemo(() => applyView(tasks, view), [tasks, view]);
  const openCount = tasks.filter((task) => !task.isCompleted).length;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    setTitle('');
    const ok = await addTask(clean);
    if (!ok) setTitle(clean);
  };

  return (
    <FloatingPanel
      title="Tasks"
      testId="tasks-panel"
      icon={<ListChecks className="h-4 w-4" />}
      onClose={onClose}
      actions={<span className="text-xs text-white/50">{openCount} open</span>}
    >
      <div className="flex flex-col gap-3 p-3">
        <form onSubmit={submit} className="flex gap-2">
          <label htmlFor="new-task" className="sr-only">
            New task
          </label>
          <input
            id="new-task"
            value={title}
            maxLength={LIMITS.taskTitleMax}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task and press Enter"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          />
          <button type="submit" aria-label="Add task" className="rounded-lg bg-white/10 px-2.5 text-white hover:bg-white/20">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        {tasks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search tasks"
                value={view.search}
                onChange={(event) => setView({ search: event.target.value })}
                placeholder="Search"
                className={`${FIELD_CLASS} w-full pl-7`}
              />
            </div>
            <select
              aria-label="Filter by priority"
              value={view.priority}
              onChange={(event) => setView({ priority: event.target.value as TaskPriority | 'all' })}
              className={FIELD_CLASS}
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="none">No priority</option>
            </select>
            <select
              aria-label="Sort tasks"
              value={view.sort}
              onChange={(event) => setView({ sort: event.target.value as TaskSort })}
              className={FIELD_CLASS}
            >
              <option value="newest">Newest</option>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
            </select>
            {view.label && <ClearLabelButton label={view.label} onClear={() => setView({ label: null })} />}
          </div>
        )}

        {status === 'loading' && tasks.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-white/50">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-white/50">
            {tasks.length === 0 ? 'No tasks yet. What needs to get done?' : 'No task matches these filters.'}
          </p>
        ) : (
          <ul aria-label="Task list" className="flex flex-col">
            {visible.map((task) => (
              <TaskRow key={task.id} task={task} onLabelClick={(label) => setView({ label })} />
            ))}
          </ul>
        )}
      </div>
    </FloatingPanel>
  );
};

export default TasksPanel;
