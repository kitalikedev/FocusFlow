import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export interface SlideOverProps {
  title: string;
  onClose: () => void;
  testId?: string;
  /** True while the exit animation plays (see usePresence). */
  closing?: boolean;
  /** Rendered under the title (tabs, actions). */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Modal side panel: slides over the right edge on desktop, 85 % bottom sheet on phones (FR-22, FR-25).
 * Esc or a click on the backdrop closes it; focus moves into the panel and back to the opener on close.
 */
export const SlideOver: React.FC<SlideOverProps> = ({ title, onClose, testId, closing = false, toolbar, children }) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end max-sm:items-end">
      <div
        data-testid="slide-over-backdrop"
        aria-hidden="true"
        className={`absolute inset-0 bg-black/40 ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        data-testid={testId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`${closing ? 'pointer-events-none animate-slide-out-right max-sm:animate-sheet-out' : 'animate-slide-in-right max-sm:animate-sheet-in'} relative flex h-full w-full flex-col overflow-hidden border-l text-white shadow-2xl outline-none sm:w-[440px] max-sm:h-[85vh] max-sm:rounded-t-2xl max-sm:border-l-0 max-sm:border-t`}
        style={{
          backgroundColor: 'var(--panel-bg)',
          backdropFilter: 'blur(var(--capsule-blur))',
          WebkitBackdropFilter: 'blur(var(--capsule-blur))',
          borderColor: 'var(--capsule-border-color)',
        }}
      >
        <header className="flex items-center gap-2 px-5 pb-3 pt-5">
          <h2 id={titleId} className="flex-1 text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        {toolbar && <div className="px-5 pb-3">{toolbar}</div>}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
