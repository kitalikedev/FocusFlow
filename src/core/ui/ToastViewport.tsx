import React from 'react';
import { useToastStore, ToastVariant } from './useToastStore';

const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: 'text-accent',
  info: 'text-accent',
  error: 'text-red-300',
};

export const ToastViewport: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-24 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          data-testid="toast"
          className={`pointer-events-auto flex w-full items-center justify-between gap-3 rounded-capsule border border-capsule-border bg-capsule-bg px-4 py-2 text-sm backdrop-blur-capsule animate-toast-in ${VARIANT_CLASS[toast.variant]}`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
            className="rounded px-1 text-xs opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
