import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquareQuote, RefreshCw, X } from 'lucide-react';
import { REDUCED_MOTION_QUERY, useMediaQuery } from '@/core/ui/useMediaQuery';
import { useUiStore } from '@/core/ui/useUiStore';
import { nextGapMs, ROLL_SECONDS, STATIC_VISIBLE_MS } from '../lib/credits';
import { QUOTES } from '../lib/quotes';
import { useQuoteStore } from '../store/useQuoteStore';
import './credits.css';

const ICON_BUTTON =
  'pointer-events-auto rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

/**
 * Random quotes as "end credits" (FR-31). Off by default: while off, only a small icon is shown and no sentence
 * appears anywhere (AC-31.1). When on, one quote rolls up the screen like the credits of a film, then after a
 * random pause (20 to 45 s) the next one follows. Hidden completely in Zen mode; with reduced motion the quote
 * stays in place for a few seconds instead of moving.
 */
export const QuoteDisplay: React.FC = () => {
  const isZen = useUiStore((state) => state.isZen);
  const enabled = useQuoteStore((state) => state.enabled);
  const index = useQuoteStore((state) => state.index);
  const setEnabled = useQuoteStore((state) => state.setEnabled);
  const next = useQuoteStore((state) => state.next);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  /** Whether a quote is on screen right now (rolling) or we are in the pause between two quotes. */
  const [rolling, setRolling] = useState(true);
  /** Changes with every new roll so the animation restarts, even for the same text. */
  const [rollId, setRollId] = useState(0);

  const startRoll = useCallback(() => {
    setRolling(true);
    setRollId((id) => id + 1);
  }, []);

  // A roll starts when quotes are turned on and whenever the screen comes back from Zen mode.
  useEffect(() => {
    if (enabled && !isZen) startRoll();
  }, [enabled, isZen, startRoll]);

  // Pause between two quotes, then the next random one.
  useEffect(() => {
    if (!enabled || isZen || rolling) return;
    const timer = setTimeout(() => {
      next();
      startRoll();
    }, nextGapMs());
    return () => clearTimeout(timer);
  }, [enabled, isZen, rolling, next, startRoll]);

  // Reduced motion: no animation ends, so a timer takes the quote away.
  useEffect(() => {
    if (!enabled || isZen || !rolling || !reducedMotion) return;
    const timer = setTimeout(() => setRolling(false), STATIC_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [enabled, isZen, rolling, reducedMotion, rollId]);

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
    <>
      <div className="flex justify-end">
        <button
          type="button"
          data-testid="quotes-next"
          aria-label="Another quote"
          title="Another quote"
          onClick={() => {
            next();
            startRoll();
          }}
          className={ICON_BUTTON}
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          data-testid="quotes-disable"
          aria-label="Hide quotes"
          title="Hide quotes"
          onClick={() => setEnabled(false)}
          className={ICON_BUTTON}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {rolling && (
        <div data-testid="credits" className="ff-credits">
          <figure
            key={rollId}
            data-testid="quote"
            className={`ff-credit-roll ${reducedMotion ? 'ff-credit-static animate-fade-in' : ''}`}
            style={{ '--ff-roll-seconds': `${ROLL_SECONDS}s` } as React.CSSProperties}
            onAnimationEnd={(event) => {
              // Only the roll itself ends the quote (not the fade-in of the reduced-motion variant).
              if (event.animationName === 'ff-credit-roll') setRolling(false);
            }}
          >
            <blockquote className="text-2xl font-medium leading-snug text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
              “{quote.text}”
            </blockquote>
            {quote.author && (
              <figcaption className="mt-3 text-xs uppercase tracking-[0.3em] text-white/60 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
                {quote.author}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
};
