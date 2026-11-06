import { create } from 'zustand';
import { FocusSessionRecord } from '@/shared/types/contracts';
import { toAppError } from '@/shared/lib/errors';
import { useToastStore } from '@/core/ui/useToastStore';
import { getDataRepository } from './useDataRepository';

export interface FocusSessionsState {
  sessions: FocusSessionRecord[];
  load: () => Promise<void>;
  add: (record: FocusSessionRecord) => void;
}

// Drops responses of outdated load() calls (the data source may change while a request is in flight).
let loadSequence = 0;

export const useFocusSessionsStore = create<FocusSessionsState>((set) => ({
  sessions: [],

  load: async () => {
    const sequence = ++loadSequence;
    set({ sessions: [] });
    try {
      const sessions = await getDataRepository().getFocusSessions();
      if (sequence === loadSequence) set({ sessions });
    } catch (error) {
      if (sequence !== loadSequence) return;
      useToastStore.getState().showToast(toAppError(error).message, { variant: 'error' });
    }
  },

  add: (record) => set((state) => ({ sessions: [record, ...state.sessions] })),
}));
