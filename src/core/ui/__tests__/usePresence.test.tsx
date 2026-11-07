import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { EXIT_MS, usePresence } from '../usePresence';
import { FloatingPanel } from '../FloatingPanel';
import { SlideOver } from '../SlideOver';

afterEach(() => {
  vi.useRealTimers();
  delete (window as unknown as { matchMedia?: unknown }).matchMedia;
});

describe('usePresence', () => {
  it('keeps a closed panel mounted for the exit animation, then unmounts it', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ open }) => usePresence(open), { initialProps: { open: true } });
    expect(result.current).toEqual({ mounted: true, closing: false });

    rerender({ open: false });
    expect(result.current).toEqual({ mounted: true, closing: true });
    act(() => {
      vi.advanceTimersByTime(EXIT_MS);
    });
    expect(result.current).toEqual({ mounted: false, closing: false });
  });

  it('opening again during the exit animation cancels the unmount', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ open }) => usePresence(open), { initialProps: { open: true } });
    rerender({ open: false });
    rerender({ open: true });
    act(() => {
      vi.advanceTimersByTime(EXIT_MS * 3);
    });
    expect(result.current).toEqual({ mounted: true, closing: false });
  });

  it('unmounts at once with reduced motion', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { result, rerender } = renderHook(({ open }) => usePresence(open), { initialProps: { open: true } });
    rerender({ open: false });
    expect(result.current).toEqual({ mounted: false, closing: false });
  });

  it('starts unmounted when it starts closed', () => {
    const { result } = renderHook(() => usePresence(false));
    expect(result.current).toEqual({ mounted: false, closing: false });
  });
});

describe('panel animation classes', () => {
  it('FloatingPanel enters with panel-in and leaves with panel-out without taking clicks', () => {
    const { rerender } = render(
      <FloatingPanel title="Tasks" testId="p" onClose={() => {}}>
        x
      </FloatingPanel>,
    );
    expect(screen.getByTestId('p').className).toContain('animate-panel-in');
    rerender(
      <FloatingPanel title="Tasks" testId="p" closing onClose={() => {}}>
        x
      </FloatingPanel>,
    );
    expect(screen.getByTestId('p').className).toContain('animate-panel-out');
    expect(screen.getByTestId('p').className).toContain('pointer-events-none');
  });

  it('SlideOver slides in from the right and fades its backdrop out when closing', () => {
    const { rerender } = render(
      <SlideOver title="Themes" testId="s" onClose={() => {}}>
        x
      </SlideOver>,
    );
    expect(screen.getByTestId('s').className).toContain('animate-slide-in-right');
    rerender(
      <SlideOver title="Themes" testId="s" closing onClose={() => {}}>
        x
      </SlideOver>,
    );
    expect(screen.getByTestId('s').className).toContain('animate-slide-out-right');
    expect(screen.getByTestId('slide-over-backdrop').className).toContain('animate-fade-out');
  });
});
