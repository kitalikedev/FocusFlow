import React, { useEffect, useId, useRef, useState } from 'react';
import { ListChecks, X } from 'lucide-react';
import { LIMITS } from '@/core/data/defaults';
import { useFocusIntentStore } from '@/core/timer/useFocusIntentStore';
import { useUiStore } from '@/core/ui/useUiStore';
import { useTasksStore } from '../store/useTasksStore';

export const INTENT_DRAFT_KEY = 'focusflow_focus_intent';

/** The draft only lives on this device (FR-29); the timer records it with the finished session. */
export function readIntentDraft(): { intentTitle: string; taskId: string | null } {
  try {
    const raw = JSON.parse(localStorage.getItem(INTENT_DRAFT_KEY) ?? 'null') as Record<string, unknown> | null;
    const intentTitle = typeof raw?.intentTitle === 'string' ? raw.intentTitle.slice(0, LIMITS.intentTitleMax) : '';
    const taskId = typeof raw?.taskId === 'string' ? raw.taskId : null;
    return { intentTitle, taskId };
  } catch {
    return { intentTitle: '', taskId: null };
  }
}

function writeIntentDraft(intentTitle: string, taskId: string | null): void {
  try {
    localStorage.setItem(INTENT_DRAFT_KEY, JSON.stringify({ intentTitle, taskId }));
  } catch {
    // Storage blocked: the intent still works for this visit.
  }
}

/** "What do you want to focus on?" (FR-29): free text up to 80 characters or one of the open tasks. */
export const FocusIntent: React.FC = () => {
  const intentTitle = useFocusIntentStore((state) => state.intentTitle);
  const taskId = useFocusIntentStore((state) => state.taskId);
  const setIntent = useFocusIntentStore((state) => state.setIntent);
  const isZen = useUiStore((state) => state.isZen);
  const tasks = useTasksStore((state) => state.tasks);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const draft = readIntentDraft();
    if (draft.intentTitle) setIntent(draft.intentTitle, draft.taskId);
  }, [setIntent]);

  useEffect(() => writeIntentDraft(intentTitle, taskId), [intentTitle, taskId]);

  useEffect(() => {
    if (!isPickerOpen) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [isPickerOpen]);

  if (isZen) return null;

  const openTasks = tasks.filter((task) => !task.isCompleted && !task.id.startsWith('temp-')).slice(0, 8);

  return (
    <div data-testid="focus-intent" ref={pickerRef} className="relative flex w-full max-w-md items-center gap-2">
      <label htmlFor="focus-intent-input" className="sr-only">
        Focus intent
      </label>
      <input
        id="focus-intent-input"
        type="text"
        value={intentTitle}
        maxLength={LIMITS.intentTitleMax}
        // Typing replaces the task link: the text no longer names that task.
        onChange={(event) => setIntent(event.target.value, null)}
        placeholder="What do you want to focus on?"
        className="w-full border-b border-transparent bg-transparent px-2 py-2 text-center text-lg font-medium text-white placeholder:text-white/70 hover:border-white/20 focus:border-white/40 focus:outline-none [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"
      />
      {intentTitle && (
        <button
          type="button"
          aria-label="Clear focus intent"
          onClick={() => setIntent('', null)}
          className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        data-testid="pick-task-btn"
        aria-label="Pick a task"
        aria-expanded={isPickerOpen}
        aria-controls={listId}
        onClick={() => setPickerOpen((open) => !open)}
        className={`rounded-lg p-1.5 hover:bg-white/10 hover:text-white ${taskId ? 'text-accent' : 'text-white/60'}`}
      >
        <ListChecks className="h-4 w-4" aria-hidden="true" />
      </button>
      {isPickerOpen && (
        <div
          id={listId}
          role="listbox"
          aria-label="Open tasks"
          className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border p-1 shadow-2xl"
          style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--capsule-border-color)', backdropFilter: 'blur(var(--capsule-blur))' }}
        >
          {openTasks.length === 0 ? (
            <p className="px-3 py-2 text-xs text-white/50">No open tasks. Add one from the Tasks tool.</p>
          ) : (
            openTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                role="option"
                aria-selected={task.id === taskId}
                onClick={() => {
                  setIntent(task.title.slice(0, LIMITS.intentTitleMax), task.id);
                  setPickerOpen(false);
                }}
                className="block w-full truncate rounded-lg px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10"
              >
                {task.title}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
