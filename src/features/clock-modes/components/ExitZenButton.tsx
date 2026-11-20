import React, { useEffect, useState } from 'react';
import { Minimize } from 'lucide-react';
import { useUiStore } from '@/core/ui/useUiStore';
import { zenHiddenProps } from '@/core/ui/zen';

export const EXIT_ZEN_HIDE_DELAY_MS = 3000;

/** AC-11.2: in Zen mode, moving the mouse or touching the screen reveals "Exit Zen" at the top for 3 seconds. */
export const ExitZenButton: React.FC = () => {
  const isZen = useUiStore((state) => state.isZen);
  const toggleZen = useUiStore((state) => state.toggleZen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isZen) {
      setIsVisible(false);
      return;
    }
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const reveal = () => {
      setIsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsVisible(false), EXIT_ZEN_HIDE_DELAY_MS);
    };
    window.addEventListener('mousemove', reveal);
    window.addEventListener('touchstart', reveal);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', reveal);
      window.removeEventListener('touchstart', reveal);
    };
  }, [isZen]);

  if (!isZen) return null;

  // It fades in and out instead of popping, and leaving Zen fades every control back in place (AC-11.2).
  return (
    <button
      type="button"
      data-testid="exit-zen-btn"
      onClick={toggleZen}
      {...zenHiddenProps(
        !isVisible,
        'fixed left-1/2 top-4 z-50 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/90 backdrop-blur hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300'
      )}
    >
      <Minimize className="h-3.5 w-3.5" aria-hidden="true" />
      Exit Zen
    </button>
  );
};
