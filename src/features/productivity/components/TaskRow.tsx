import React, { useState } from 'react';
import { Calendar, Check, Pencil, Trash2, X } from 'lucide-react';
import type { TaskItem, TaskPriority } from '@/shared/types/contracts';
import { LIMITS } from '@/core/data/defaults';
import { dateInputToIso, exceedsLabelQuota, formatDueDate, isOverdue, isoToDateInput, parseLabels, USER_LABELS_MAX } from '../lib/tasks';
import { useTasksStore } from '../store/useTasksStore';

export const PRIORITY_BADGE: Record<Exclude<TaskPriority, 'none'>, { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-red-500/20 text-red-300' },
  medium: { label: 'Medium', className: 'bg-amber-500/20 text-amber-200' },
  low: { label: 'Low', className: 'bg-sky-500/20 text-sky-200' },
};

const FIELD_CLASS =
  'rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';
const ICON_BUTTON =
  'rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

const TaskEditor: React.FC<{ task: TaskItem; onDone: () => void }> = ({ task, onDone }) => {
  const updateTask = useTasksStore((state) => state.updateTask);
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [due, setDue] = useState(isoToDateInput(task.dueDate));
  const [labels, setLabels] = useState(task.labels.join(', '));
  const [error, setError] = useState<string | null>(null);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const parsedLabels = parseLabels(labels);
    if (!cleanTitle || cleanTitle.length > LIMITS.taskTitleMax) {
      setError(`Title must be 1 to ${LIMITS.taskTitleMax} characters.`);
      return;
    }
    if (parsedLabels.length > LIMITS.taskLabelsMax || parsedLabels.some((l) => l.length > LIMITS.taskLabelLengthMax)) {
      setError(`Up to ${LIMITS.taskLabelsMax} labels, ${LIMITS.taskLabelLengthMax} characters each.`);
      return;
    }
    if (exceedsLabelQuota(useTasksStore.getState().tasks, task.id, parsedLabels)) {
      setError(`You can use up to ${USER_LABELS_MAX} different labels.`);
      return;
    }
    const ok = await updateTask(task.id, {
      title: cleanTitle,
      priority,
      dueDate: due ? dateInputToIso(due) : null,
      labels: parsedLabels,
    });
    if (ok) onDone();
  };

  return (
    <form onSubmit={save} aria-label={`Edit ${task.title}`} className="flex flex-col gap-2 rounded-xl bg-white/5 p-3">
      <label className="sr-only" htmlFor={`title-${task.id}`}>
        Title
      </label>
      <input
        id={`title-${task.id}`}
        value={title}
        maxLength={LIMITS.taskTitleMax}
        onChange={(event) => setTitle(event.target.value)}
        className={FIELD_CLASS}
        autoFocus
      />
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Priority
          <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className={FIELD_CLASS}>
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Due date
          <input type="date" value={due} onChange={(event) => setDue(event.target.value)} className={FIELD_CLASS} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs text-white/60">
        Labels (comma separated)
        <input
          value={labels}
          onChange={(event) => setLabels(event.target.value)}
          placeholder="Work, Urgent"
          className={FIELD_CLASS}
        />
      </label>
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-lg px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">
          Cancel
        </button>
        <button type="submit" className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-contrast">
          Save
        </button>
      </div>
    </form>
  );
};

export const TaskRow: React.FC<{ task: TaskItem; onLabelClick: (label: string) => void }> = ({ task, onLabelClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const updateTask = useTasksStore((state) => state.updateTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);

  if (isEditing) return <TaskEditor task={task} onDone={() => setIsEditing(false)} />;

  const badge = task.priority === 'none' ? null : PRIORITY_BADGE[task.priority];
  const overdue = isOverdue(task);

  return (
    <li data-testid="task-row" className="group flex animate-row-in items-start gap-3 rounded-xl px-2 py-2 hover:bg-white/5">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.isCompleted}
        aria-label={task.isCompleted ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        onClick={() => void updateTask(task.id, { isCompleted: !task.isCompleted })}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          task.isCompleted ? 'border-accent bg-accent text-accent-contrast' : 'border-white/40 hover:border-white'
        }`}
      >
        {task.isCompleted && <Check className="h-3 w-3 animate-pop" aria-hidden="true" />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          data-testid="task-title"
          className={`break-words text-sm ${task.isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}
        >
          {task.title}
        </p>
        {(badge || task.dueDate || task.labels.length > 0) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {badge && (
              <span data-testid="priority-badge" className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                {badge.label}
              </span>
            )}
            {task.dueDate && (
              <span
                data-testid="due-date"
                className={`flex items-center gap-1 text-[11px] ${overdue ? 'text-red-300' : 'text-white/50'}`}
              >
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {formatDueDate(task.dueDate)}
              </span>
            )}
            {task.labels.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => onLabelClick(label)}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70 hover:bg-white/20"
              >
                #{label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <button type="button" aria-label={`Edit "${task.title}"`} onClick={() => setIsEditing(true)} className={ICON_BUTTON}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Delete "${task.title}"`}
          onClick={() => void deleteTask(task.id)}
          className={ICON_BUTTON}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
};

export const ClearLabelButton: React.FC<{ label: string; onClear: () => void }> = ({ label, onClear }) => (
  <button
    type="button"
    onClick={onClear}
    aria-label={`Stop filtering by ${label}`}
    className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-white"
  >
    #{label}
    <X className="h-3 w-3" aria-hidden="true" />
  </button>
);
