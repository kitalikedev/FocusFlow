import { useUiStore } from '../ui/useUiStore';

export interface HudData {
  cycleDots: number;
  completedDots: number;
  streakCount: number;
  isZen: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  toggleZen: () => void;
}

export function useHud(): HudData {
  const isZen = useUiStore((state) => state.isZen);
  const isFullscreen = useUiStore((state) => state.isFullscreen);
  const toggleFullscreen = useUiStore((state) => state.toggleFullscreen);
  const toggleZen = useUiStore((state) => state.toggleZen);

  return {
    cycleDots: 4,
    completedDots: 1,
    streakCount: 3,
    isZen,
    isFullscreen,
    toggleFullscreen,
    toggleZen,
  };
}
