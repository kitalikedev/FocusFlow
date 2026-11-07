import { useEffect, useState } from 'react';
import { REDUCED_MOTION_QUERY } from './useMediaQuery';

export const EXIT_MS = 180;

/**
 * Keeps a panel mounted for a short moment after it is closed so its exit animation can play.
 * With reduced motion it unmounts at once. `closing` is true during that moment.
 */
export function usePresence(isOpen: boolean, exitMs: number = EXIT_MS): { mounted: boolean; closing: boolean } {
  const [mounted, setMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (reduced) {
      setMounted(false);
      return;
    }
    const timer = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer);
  }, [isOpen, exitMs]);

  return { mounted: isOpen || mounted, closing: !isOpen && mounted };
}
