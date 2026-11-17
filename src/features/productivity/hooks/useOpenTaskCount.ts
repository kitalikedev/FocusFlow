import { useTasksStore } from '../store/useTasksStore';

/** Number of tasks that are not completed yet. */
export function useOpenTaskCount(): number {
  return useTasksStore((state) => state.tasks.filter((task) => !task.isCompleted).length);
}
