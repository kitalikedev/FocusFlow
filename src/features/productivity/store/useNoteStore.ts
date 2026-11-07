import { create } from 'zustand';
import { getDataRepository } from '@/core/data/useDataRepository';
import { trackWrite } from '@/core/data/useSyncStatusStore';
import { useToastStore } from '@/core/ui/useToastStore';
import { toAppError } from '@/shared/lib/errors';

export const NOTE_SAVE_DELAY_MS = 500;

export type NoteSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface NoteState {
  content: string;
  status: NoteSaveStatus;
  isLoaded: boolean;
  load: () => Promise<void>;
  setContent: (content: string) => void;
  /** Saves immediately (panel closed, page hidden). */
  flush: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let loadSequence = 0;

function clearTimer(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
}

/** Notepad with debounced auto-save (AC-20.1): one save 500 ms after the last keystroke. */
export const useNoteStore = create<NoteState>((set, get) => ({
  content: '',
  status: 'idle',
  isLoaded: false,

  load: async () => {
    clearTimer();
    const sequence = ++loadSequence;
    set({ isLoaded: false, status: 'idle' });
    try {
      const note = await getDataRepository().getNote();
      if (sequence === loadSequence) set({ content: note.content, isLoaded: true });
    } catch (error) {
      if (sequence !== loadSequence) return;
      set({ isLoaded: true, status: 'error' });
      useToastStore.getState().showToast(toAppError(error).message, { variant: 'error' });
    }
  },

  setContent: (content) => {
    set({ content, status: 'pending' });
    clearTimer();
    saveTimer = setTimeout(() => void get().flush(), NOTE_SAVE_DELAY_MS);
  },

  flush: async () => {
    clearTimer();
    if (get().status !== 'pending') return;
    const content = get().content;
    set({ status: 'saving' });
    try {
      await trackWrite(() => getDataRepository().saveNote(content));
      // A keystroke typed while saving already scheduled its own save; only report "Saved" when up to date.
      if (get().content === content) set({ status: 'saved' });
    } catch (error) {
      set({ status: 'error' });
      useToastStore.getState().showToast(toAppError(error).message, { variant: 'error' });
    }
  },
}));
