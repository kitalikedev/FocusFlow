import React, { lazy, Suspense, useCallback } from 'react';
import { SlideOver } from '@/core/ui/SlideOver';
import { usePresence } from '@/core/ui/usePresence';
import { useUiStore } from '@/core/ui/useUiStore';

const AnalyticsContent = lazy(() => import('./AnalyticsContent'));

/** Focus Analytics panel (FR-21), opened from the quick controls. */
export const AnalyticsModal: React.FC = () => {
  const isOpen = useUiStore((state) => state.isAnalyticsOpen);
  const setOpen = useUiStore((state) => state.setAnalyticsOpen);
  const close = useCallback(() => setOpen(false), [setOpen]);

  const { mounted, closing } = usePresence(isOpen);

  if (!mounted) return null;

  return (
    <SlideOver title="Focus Analytics" testId="analytics-panel" closing={closing} onClose={close}>
      <Suspense fallback={<p className="p-5 text-xs text-white/50">Loading…</p>}>
        <AnalyticsContent />
      </Suspense>
    </SlideOver>
  );
};
