import { create } from 'zustand';
import { pickQuoteIndex } from '../lib/quotes';

export const QUOTES_STORAGE_KEY = 'focusflow_quotes';

export interface QuoteState {
  /** Off by default: nothing is written on the screen until the user asks for it (AC-31.1). */
  enabled: boolean;
  index: number | null;
  setEnabled: (enabled: boolean) => void;
  next: () => void;
}

/** Only the on / off choice is remembered; the quote itself is new on every visit. */
export function readQuotesEnabled(): boolean {
  try {
    const raw = JSON.parse(localStorage.getItem(QUOTES_STORAGE_KEY) ?? 'null') as { enabled?: unknown } | null;
    return raw?.enabled === true;
  } catch {
    return false;
  }
}

function writeQuotesEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify({ enabled }));
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
}

const initiallyEnabled = readQuotesEnabled();

export const useQuoteStore = create<QuoteState>((set, get) => ({
  enabled: initiallyEnabled,
  index: initiallyEnabled ? pickQuoteIndex(null) : null,

  setEnabled: (enabled) => {
    writeQuotesEnabled(enabled);
    set({ enabled, index: enabled ? pickQuoteIndex(get().index) : get().index });
  },

  next: () => set({ index: pickQuoteIndex(get().index) }),
}));
