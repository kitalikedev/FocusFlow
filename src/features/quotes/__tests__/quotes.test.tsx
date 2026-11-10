import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { pickQuoteIndex, QUOTES } from '../lib/quotes';
import { QUOTES_STORAGE_KEY, readQuotesEnabled, useQuoteStore } from '../store/useQuoteStore';
import { QuoteDisplay } from '../index';
import { MAX_GAP_MS, MIN_GAP_MS, nextGapMs, STATIC_VISIBLE_MS } from '../lib/credits';
import { useUiStore } from '@/core/ui/useUiStore';

beforeEach(() => {
  localStorage.clear();
  useQuoteStore.setState({ enabled: false, index: null });
  useUiStore.setState({ isZen: false });
});

describe('quote list', () => {
  it('has about 40 short quotes without duplicates', () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(40);
    expect(new Set(QUOTES.map((quote) => quote.text)).size).toBe(QUOTES.length);
    QUOTES.forEach((quote) => {
      expect(quote.text.length).toBeGreaterThan(5);
      expect(quote.text.length).toBeLessThanOrEqual(90);
    });
  });

  it('never repeats the current quote and always stays in range', () => {
    for (let current = 0; current < QUOTES.length; current += 1) {
      for (const r of [0, 0.25, 0.5, 0.999999]) {
        const next = pickQuoteIndex(current, () => r);
        expect(next).not.toBe(current);
        expect(next).toBeGreaterThanOrEqual(0);
        expect(next).toBeLessThan(QUOTES.length);
      }
    }
    expect(pickQuoteIndex(null, () => 0)).toBe(0);
    expect(pickQuoteIndex(null, () => 0.999999)).toBe(QUOTES.length - 1);
  });
});

/** React listens to the native `animationend` event; jsdom has no AnimationEvent, so build one by hand. */
function endAnimation(element: Element, animationName = 'ff-credit-roll') {
  const event = new Event('animationend', { bubbles: true });
  Object.defineProperty(event, 'animationName', { value: animationName });
  act(() => {
    element.dispatchEvent(event);
  });
}

function mockReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  vi.useRealTimers();
  delete (window as unknown as { matchMedia?: unknown }).matchMedia;
});

describe('credits timing', () => {
  it('waits 20 to 45 seconds between two quotes', () => {
    expect(nextGapMs(() => 0)).toBe(MIN_GAP_MS);
    expect(nextGapMs(() => 0.999999)).toBe(MAX_GAP_MS);
    expect(nextGapMs(() => 0.5)).toBe(32_500);
    expect(MIN_GAP_MS).toBe(20_000);
    expect(MAX_GAP_MS).toBe(45_000);
  });
});

describe('QuoteDisplay as end credits (FR-31)', () => {
  it('AC-31.1: shows no sentence by default, only a small icon to turn quotes on', () => {
    render(<QuoteDisplay />);
    expect(screen.queryByTestId('credits')).not.toBeInTheDocument();
    expect(screen.queryByTestId('quote')).not.toBeInTheDocument();
    expect(screen.getByTestId('quotes-enable')).toBeInTheDocument();
    expect(screen.queryByText(/“/)).not.toBeInTheDocument();
  });

  it('turning quotes on rolls one quote up the screen, with its author when it has one', () => {
    render(<QuoteDisplay />);
    fireEvent.click(screen.getByTestId('quotes-enable'));
    const index = useQuoteStore.getState().index as number;
    expect(screen.getByTestId('credits')).toBeInTheDocument();
    expect(screen.getByTestId('quote').className).toContain('ff-credit-roll');
    expect(screen.getByTestId('quote').className).not.toContain('ff-credit-static');
    expect(screen.getByRole('blockquote')).toHaveTextContent(QUOTES[index].text);
    if (QUOTES[index].author) expect(screen.getByText(QUOTES[index].author as string)).toBeInTheDocument();
  });

  it('leaves out the author line for quotes without one', () => {
    const withoutAuthor = QUOTES.findIndex((quote) => !quote.author);
    useQuoteStore.setState({ enabled: true, index: withoutAuthor });
    render(<QuoteDisplay />);
    expect(document.querySelector('figcaption')).toBeNull();
    const withAuthor = QUOTES.findIndex((quote) => quote.author);
    act(() => useQuoteStore.setState({ index: withAuthor }));
    expect(document.querySelector('figcaption')).toHaveTextContent(QUOTES[withAuthor].author as string);
  });

  it('when the roll ends the quote disappears, and after a pause the next, different quote rolls', () => {
    vi.useFakeTimers();
    useQuoteStore.setState({ enabled: true, index: 0 });
    render(<QuoteDisplay />);
    expect(screen.getByTestId('quote')).toBeInTheDocument();

    endAnimation(screen.getByTestId('quote'));
    expect(screen.queryByTestId('credits')).not.toBeInTheDocument(); // pause between quotes
    act(() => {
      vi.advanceTimersByTime(MIN_GAP_MS - 1);
    });
    expect(screen.queryByTestId('credits')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(MAX_GAP_MS);
    });
    expect(screen.getByTestId('quote')).toBeInTheDocument();
    expect(useQuoteStore.getState().index).not.toBe(0);
  });

  it('ignores animation events that are not the roll itself', () => {
    useQuoteStore.setState({ enabled: true, index: 0 });
    render(<QuoteDisplay />);
    endAnimation(screen.getByTestId('quote'), 'fade-in');
    expect(screen.getByTestId('quote')).toBeInTheDocument();
  });

  it('the refresh button shows another quote at once and restarts the roll', () => {
    useQuoteStore.setState({ enabled: true, index: 3 });
    render(<QuoteDisplay />);
    const before = screen.getByTestId('quote');
    fireEvent.click(screen.getByTestId('quotes-next'));
    expect(useQuoteStore.getState().index).not.toBe(3);
    expect(screen.getByTestId('quote')).not.toBe(before); // a new element: the animation starts from the bottom
  });

  it('refresh also brings a quote back during the pause', () => {
    useQuoteStore.setState({ enabled: true, index: 3 });
    render(<QuoteDisplay />);
    endAnimation(screen.getByTestId('quote'));
    expect(screen.queryByTestId('quote')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('quotes-next'));
    expect(screen.getByTestId('quote')).toBeInTheDocument();
  });

  it('the X hides the quotes and shows the small icon again', () => {
    useQuoteStore.setState({ enabled: true, index: 0 });
    render(<QuoteDisplay />);
    fireEvent.click(screen.getByTestId('quotes-disable'));
    expect(screen.queryByTestId('credits')).not.toBeInTheDocument();
    expect(screen.getByTestId('quotes-enable')).toBeInTheDocument();
  });

  it('is hidden completely in Zen mode and rolls again when Zen ends', () => {
    useQuoteStore.setState({ enabled: true, index: 0 });
    useUiStore.setState({ isZen: true });
    const { container } = render(<QuoteDisplay />);
    expect(container).toBeEmptyDOMElement();
    act(() => useUiStore.setState({ isZen: false }));
    expect(screen.getByTestId('quote')).toBeInTheDocument();
  });

  it('does not run any timer while the quotes are off or after the component is gone', () => {
    vi.useFakeTimers();
    useQuoteStore.setState({ enabled: true, index: 0 });
    const { unmount } = render(<QuoteDisplay />);
    endAnimation(screen.getByTestId('quote'));
    unmount();
    expect(() => vi.advanceTimersByTime(MAX_GAP_MS * 2)).not.toThrow();
    expect(useQuoteStore.getState().index).toBe(0); // no next quote was picked after unmount
  });

  it('reduced motion: the quote stays in place for a few seconds instead of rolling', () => {
    vi.useFakeTimers();
    mockReducedMotion(true);
    useQuoteStore.setState({ enabled: true, index: 0 });
    render(<QuoteDisplay />);
    expect(screen.getByTestId('quote').className).toContain('ff-credit-static');
    act(() => {
      vi.advanceTimersByTime(STATIC_VISIBLE_MS - 1);
    });
    expect(screen.getByTestId('quote')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByTestId('quote')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(MAX_GAP_MS);
    });
    expect(screen.getByTestId('quote')).toBeInTheDocument(); // the next one follows
  });
});

describe('quote choice on this device', () => {
  it('remembers only the on / off choice', () => {
    useQuoteStore.getState().setEnabled(true);
    expect(JSON.parse(localStorage.getItem(QUOTES_STORAGE_KEY) ?? '{}')).toEqual({ enabled: true });
    expect(readQuotesEnabled()).toBe(true);
    useQuoteStore.getState().setEnabled(false);
    expect(readQuotesEnabled()).toBe(false);
    localStorage.setItem(QUOTES_STORAGE_KEY, 'not json');
    expect(readQuotesEnabled()).toBe(false);
  });
});
