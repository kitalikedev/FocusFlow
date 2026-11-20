import { create } from 'zustand';

export const ZEN_TIME_ONLY_KEY = 'focusflow_zen_time_only';

/** Off by default: Zen keeps the clock frame unless the user asks for the time alone. */
export function readZenTimeOnly(): boolean {
  try {
    return localStorage.getItem(ZEN_TIME_ONLY_KEY) === 'true';
  } catch {
    return false;
  }
}

interface ZenTimeOnlyState {
  /** In Zen mode, also hide the clock frame (background, border, shadow) and the ring: only the time stays. */
  timeOnly: boolean;
  setTimeOnly: (timeOnly: boolean) => void;
}

/** A look of this device only (no database column), like the quotes switch. */
export const useZenTimeOnly = create<ZenTimeOnlyState>((set) => ({
  timeOnly: readZenTimeOnly(),
  setTimeOnly: (timeOnly) => {
    try {
      localStorage.setItem(ZEN_TIME_ONLY_KEY, String(timeOnly));
    } catch {
      // Storage blocked: the choice still applies for this visit.
    }
    set({ timeOnly });
  },
}));
