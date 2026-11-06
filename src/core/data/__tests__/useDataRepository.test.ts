import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { LocalRepository } from '../LocalRepository';
import { SupabaseRepository } from '../SupabaseRepository';
import {
  getDataRepository,
  getLocalRepository,
  getSupabaseRepository,
  useDataRepository,
} from '../useDataRepository';

vi.mock('@/shared/lib/supabase');

describe('data repository resolution (ARCHITECTURE 5.1)', () => {
  beforeEach(() => useAuthStore.setState({ isGuest: true, user: null }));

  it('returns LocalRepository for guests and SupabaseRepository for signed-in users', () => {
    expect(getDataRepository()).toBeInstanceOf(LocalRepository);
    useAuthStore.setState({ isGuest: false, user: { id: 'u1', email: 'a@b.co' } });
    expect(getDataRepository()).toBeInstanceOf(SupabaseRepository);
  });

  it('keeps singletons', () => {
    expect(getLocalRepository()).toBe(getLocalRepository());
    expect(getSupabaseRepository()).toBe(getSupabaseRepository());
  });

  it('hook follows auth state changes', () => {
    const { result } = renderHook(() => useDataRepository());
    expect(result.current).toBeInstanceOf(LocalRepository);

    act(() => useAuthStore.setState({ isGuest: false }));
    expect(result.current).toBeInstanceOf(SupabaseRepository);

    act(() => useAuthStore.setState({ isGuest: true }));
    expect(result.current).toBeInstanceOf(LocalRepository);
  });
});
