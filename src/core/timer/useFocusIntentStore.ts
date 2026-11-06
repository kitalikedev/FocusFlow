import { create } from 'zustand';

export interface FocusIntentState {
  intentTitle: string;
  taskId: string | null;
  /** Written by the productivity module (FR-29); read by the timer when a focus session is recorded. */
  setIntent: (intentTitle: string, taskId?: string | null) => void;
  /** AC-29.3: the task was deleted, keep the text but drop the link. */
  clearTaskLink: () => void;
}

export const useFocusIntentStore = create<FocusIntentState>((set) => ({
  intentTitle: '',
  taskId: null,
  setIntent: (intentTitle, taskId = null) => set({ intentTitle, taskId }),
  clearTaskLink: () => set({ taskId: null }),
}));
