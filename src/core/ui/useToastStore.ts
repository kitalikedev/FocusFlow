import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

export interface ToastOptions {
  variant?: ToastVariant;
  durationMs?: number;
}

export interface ToastStoreState {
  toasts: Toast[];
  showToast: (message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const DEFAULT_DURATION_MS = 3000;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastStoreState>((set, get) => ({
  toasts: [],

  showToast: (message, options = {}) => {
    const id = crypto.randomUUID();
    const toast: Toast = { id, message, variant: options.variant ?? 'info' };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    timers.set(
      id,
      setTimeout(() => get().dismissToast(id), options.durationMs ?? DEFAULT_DURATION_MS),
    );
    return id;
  },

  dismissToast: (id) => {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));
