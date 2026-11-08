import { describe, it, expect, beforeEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { pickQuoteIndex, QUOTES } from '../lib/quotes';
import { QUOTES_STORAGE_KEY, readQuotesEnabled, useQuoteStore } from '../store/useQuoteStore';
import { QuoteDisplay } from '../index';
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

describe('QuoteDisplay (FR-31)', () => {
  it('AC-31.1: shows no sentence by default, only a small icon to turn quotes on', () => {
    render(<QuoteDisplay />);
    expect(screen.queryByTestId('quote')).not.toBeInTheDocument();
    expect(screen.getByTestId('quotes-enable')).toBeInTheDocument();
    expect(screen.queryByText(/“/)).not.toBeInTheDocument();
  });

  it('turns on with a quote, changes it on demand and turns off again', () => {
    render(<QuoteDisplay />);
    fireEvent.click(screen.getByTestId('quotes-enable'));
    const first = useQuoteStore.getState().index;
    expect(screen.getByTestId('quote')).toBeInTheDocument();
    expect(screen.getByRole('blockquote')).toHaveTextContent(QUOTES[first as number].text);

    fireEvent.click(screen.getByTestId('quotes-next'));
    expect(useQuoteStore.getState().index).not.toBe(first);

    fireEvent.click(screen.getByTestId('quotes-disable'));
    expect(screen.queryByTestId('quote')).not.toBeInTheDocument();
    expect(screen.getByTestId('quotes-enable')).toBeInTheDocument();
  });

  it('shows the author when there is one', () => {
    const withAuthor = QUOTES.findIndex((quote) => quote.author);
    const withoutAuthor = QUOTES.findIndex((quote) => !quote.author);
    useQuoteStore.setState({ enabled: true, index: withAuthor });
    const { rerender } = render(<QuoteDisplay />);
    expect(screen.getByText(QUOTES[withAuthor].author as string)).toBeInTheDocument();
    act(() => useQuoteStore.setState({ index: withoutAuthor }));
    rerender(<QuoteDisplay />);
    expect(document.querySelector('figcaption')).toBeNull();
  });

  it('is hidden completely in Zen mode', () => {
    useQuoteStore.setState({ enabled: true, index: 0 });
    useUiStore.setState({ isZen: true });
    const { container } = render(<QuoteDisplay />);
    expect(container).toBeEmptyDOMElement();
  });

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
