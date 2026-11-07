import { create } from 'zustand';
import type { TaskItem } from '@/shared/types/contracts';
import { getDataRepository } from '@/core/data/useDataRepository';
import { trackWrite } from '@/core/data/useSyncStatusStore';
import { useFocusIntentStore } from '@/core/timer/useFocusIntentStore';
import { useToastStore } from '@/core/ui/useToastStore';
import { toAppError } from '@/shared/lib/errors';
import { DEFAULT_VIEW, type TaskView } from '../lib/tasks';

export type TaskUpdates = Partial<Pick<TaskItem, 'title' | 'isCompleted' | 'priority' | 'dueDate' | 'labels'>>;

export interface TasksState {
  tasks: TaskItem[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  view: TaskView;
  load: () => Promise<void>;
  addTask: (title: string) => Promise<boolean>;
  updateTask: (id: string, updates: TaskUpdates) => Promise<boolean>;
  deleteTask: (id: string) => Promise<void>;
  setView: (partial: Partial<TaskView>) => void;
}

function showError(error: unknown): void {
  useToastStore.getState().showToast(toAppError(error).message, { variant: 'error' });
}

let loadSequence = 0;

/** Tasks of the current data source (FR-19); every change is applied optimistically and rolled back on error. */
export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  status: 'idle',
  view: DEFAULT_VIEW,

  load: async () => {
    const sequence = ++loadSequence;
    set({ status: 'loading' });
    try {
      const tasks = await getDataRepository().getTasks();
      if (sequence === loadSequence) set({ tasks, status: 'ready' });
    } catch (error) {
      if (sequence !== loadSequence) return;
      set({ status: 'error' });
      showError(error);
    }
  },

  addTask: async (title) => {
    const now = new Date().toISOString();
    const temp: TaskItem = {
      id: `temp-${crypto.randomUUID()}`,
      title: title.trim(),
      isCompleted: false,
      priority: 'none',
      dueDate: null,
      labels: [],
      createdAt: now,
      updatedAt: now,
    };
    // AC-19.1: the task shows at the top immediately, the stored copy replaces it when saved.
    set((state) => ({ tasks: [temp, ...state.tasks] }));
    try {
      const created = await trackWrite(() => getDataRepository().createTask(title));
      set((state) => ({ tasks: state.tasks.map((task) => (task.id === temp.id ? created : task)) }));
      return true;
    } catch (error) {
      set((state) => ({ tasks: state.tasks.filter((task) => task.id !== temp.id) }));
      showError(error);
      return false;
    }
  },

  updateTask: async (id, updates) => {
    const previous = get().tasks.find((task) => task.id === id);
    if (!previous || id.startsWith('temp-')) return false;
    set((state) => ({ tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)) }));
    try {
      const saved = await trackWrite(() => getDataRepository().updateTask(id, updates));
      set((state) => ({ tasks: state.tasks.map((task) => (task.id === id ? saved : task)) }));
      if (updates.title !== undefined && useFocusIntentStore.getState().taskId === id) {
        useFocusIntentStore.getState().setIntent(saved.title, id);
      }
      return true;
    } catch (error) {
      set((state) => ({ tasks: state.tasks.map((task) => (task.id === id ? previous : task)) }));
      showError(error);
      return false;
    }
  },

  deleteTask: async (id) => {
    const index = get().tasks.findIndex((task) => task.id === id);
    if (index === -1 || id.startsWith('temp-')) return;
    const removed = get().tasks[index];
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
    // AC-29.3: the intent keeps its text but loses the link to the deleted task.
    if (useFocusIntentStore.getState().taskId === id) useFocusIntentStore.getState().clearTaskLink();
    try {
      await trackWrite(() => getDataRepository().deleteTask(id));
    } catch (error) {
      set((state) => {
        const tasks = [...state.tasks];
        tasks.splice(Math.min(index, tasks.length), 0, removed);
        return { tasks };
      });
      showError(error);
    }
  },

  setView: (partial) => set((state) => ({ view: { ...state.view, ...partial } })),
}));
