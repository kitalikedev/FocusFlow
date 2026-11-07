import { useEffect } from 'react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useNoteStore } from '../store/useNoteStore';
import { useTasksStore } from '../store/useTasksStore';

/** Loads tasks and the note once auth is known and again whenever the data source changes (sign in / out). */
export function useProductivityData(): void {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isGuest = useAuthStore((state) => state.isGuest);
  const userId = useAuthStore((state) => state.user?.id);
  const dataVersion = useAuthStore((state) => state.dataVersion);

  useEffect(() => {
    if (isLoading) return;
    void useTasksStore.getState().load();
    void useNoteStore.getState().load();
  }, [isLoading, isGuest, userId, dataVersion]);

  // Never lose the last keystrokes when the tab is hidden or closed.
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === 'hidden') void useNoteStore.getState().flush();
    };
    document.addEventListener('visibilitychange', flush);
    return () => document.removeEventListener('visibilitychange', flush);
  }, []);
}
