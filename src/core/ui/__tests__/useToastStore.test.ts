import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useToastStore } from '../useToastStore';

describe('useToastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.setState({ toasts: [] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a toast and hides it after 3000 ms by default (AC-01.1)', () => {
    const id = useToastStore.getState().showToast('Account created successfully', { variant: 'success' });
    expect(useToastStore.getState().toasts).toEqual([{ id, message: 'Account created successfully', variant: 'success' }]);

    vi.advanceTimersByTime(2999);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('supports custom durations and the info variant by default', () => {
    useToastStore.getState().showToast('hello', { durationMs: 500 });
    expect(useToastStore.getState().toasts[0].variant).toBe('info');
    vi.advanceTimersByTime(500);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('dismisses manually and ignores unknown ids', () => {
    const id = useToastStore.getState().showToast('a');
    useToastStore.getState().showToast('b');
    useToastStore.getState().dismissToast(id);
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual(['b']);
    useToastStore.getState().dismissToast('missing');
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
