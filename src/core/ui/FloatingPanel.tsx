import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface FloatingPanelProps {
  title: string;
  icon?: React.ReactNode;
  /** Shown on the right of the header, before the close button. */
  actions?: React.ReactNode;
  onClose: () => void;
  testId?: string;
  /** True while the exit animation plays (see usePresence). */
  closing?: boolean;
  /** Desktop width class, 340 px by default. */
  widthClass?: string;
  children: React.ReactNode;
}

const PANEL_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--panel-bg)',
  backdropFilter: 'blur(var(--capsule-blur))',
  WebkitBackdropFilter: 'blur(var(--capsule-blur))',
  borderColor: 'var(--capsule-border-color)',
};

/**
 * Shared shell of the dock tools (Tasks, Note, Sound): a floating card on desktop and a bottom sheet that
 * covers 85 % of the screen on phones (AC-22.1). It is deliberately not a dialog, so keyboard shortcuts keep
 * working while a tool is open. Esc closes it unless the focus is inside a text field.
 */
export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  title,
  icon,
  actions,
  onClose,
  testId,
  closing = false,
  widthClass = 'sm:w-[340px]',
  children,
}) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // An open dialog (Themes, Analytics) owns Esc; the tool stays open behind it.
      if (document.querySelector('[role="dialog"]')) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('input, textarea, select')) return;
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <section
      data-testid={testId}
      aria-label={title}
      className={`${closing ? 'pointer-events-none animate-panel-out max-sm:animate-sheet-out' : 'pointer-events-auto animate-panel-in max-sm:animate-sheet-in'} flex flex-col overflow-hidden border text-white shadow-2xl shadow-black/50 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-40 max-sm:h-[85vh] max-sm:rounded-t-2xl sm:max-h-[min(70vh,560px)] sm:rounded-2xl ${widthClass}`}
      style={PANEL_STYLE}
    >
      <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        {icon && (
          <span aria-hidden="true" className="text-white/70">
            {icon}
          </span>
        )}
        <h2 className="flex-1 text-sm font-semibold">{title}</h2>
        {actions}
        <button
          type="button"
          aria-label={`Close ${title}`}
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </section>
  );
};
