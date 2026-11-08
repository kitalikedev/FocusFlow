import React from 'react';
import { MessageSquareQuote, RefreshCw, X } from 'lucide-react';
import { useUiStore } from '@/core/ui/useUiStore';
import { QUOTES } from '../lib/quotes';
import { useQuoteStore } from '../store/useQuoteStore';

const ICON_BUTTON =
  'pointer-events-auto rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

/**
 * Random quote under the HUD (FR-31). It is off by default: while off, only a small icon is shown and no
 * sentence appears anywhere (AC-31.1). Hidden completely in Zen mode.
 */
export const QuoteDisplay: React.FC = () => {
  const isZen = useUiStore((state) => state.isZen);
  const enabled = useQuoteStore((state) => state.enabled);
  const index = useQuoteStore((state) => state.index);
  const setEnabled = useQuoteStore((state) => state.setEnabled);
  const next = useQuoteStore((state) => state.next);

  if (isZen) return null;

  if (!enabled || index === null) {
    return (
      <button
        type="button"
        data-testid="quotes-enable"
        aria-label="Show quotes"
        title="Show quotes"
        onClick={() => setEnabled(true)}
        className={ICON_BUTTON}
      >
        <MessageSquareQuote className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  const quote = QUOTES[index];

  return (
    <figure data-testid="quote" className="flex flex-col items-end gap-1">
      <blockquote
        // The key restarts the fade whenever the quote changes.
        key={index}
        className="animate-fade-in text-sm font-medium leading-snug text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]"
      >
        “{quote.text}”
      </blockquote>
      {quote.author && (
        <figcaption className="text-xs text-white/70 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">{quote.author}</figcaption>
      )}
      <div className="flex">
        <button type="button" data-testid="quotes-next" aria-label="Another quote" title="Another quote" onClick={next} className={ICON_BUTTON}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button type="button" data-testid="quotes-disable" aria-label="Hide quotes" title="Hide quotes" onClick={() => setEnabled(false)} className={ICON_BUTTON}>
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </figure>
  );
};
