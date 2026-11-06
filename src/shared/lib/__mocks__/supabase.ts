import { vi, type Mock } from 'vitest';

/**
 * Chainable Supabase query-builder mock (API_DOCS section 11.1).
 * Every filter method returns the same builder; `single`, `maybeSingle` and awaiting the builder resolve to `result`.
 */
export interface MockResult {
  data?: unknown;
  error?: unknown;
}

export type MockBuilder = Record<string, Mock> & { then: Mock };

const CHAIN_METHODS = [
  'select',
  'insert',
  'update',
  'delete',
  'upsert',
  'eq',
  'in',
  'contains',
  'ilike',
  'order',
  'limit',
  'range',
  'gte',
] as const;

export function createMockQueryBuilder(result: MockResult = {}): MockBuilder {
  const resolved = { data: result.data ?? null, error: result.error ?? null };
  const builder = {} as MockBuilder;

  for (const method of CHAIN_METHODS) {
    builder[method] = vi.fn().mockReturnValue(builder);
  }
  builder.single = vi.fn().mockResolvedValue(resolved);
  builder.maybeSingle = vi.fn().mockResolvedValue(resolved);
  builder.then = vi.fn((onFulfilled: (value: typeof resolved) => unknown) => onFulfilled(resolved));

  return builder;
}

export interface MockStorageBucket {
  upload: Mock;
  remove: Mock;
  getPublicUrl: Mock;
}

export function createMockStorageBucket(): MockStorageBucket {
  return {
    upload: vi.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null }),
    remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    getPublicUrl: vi
      .fn()
      .mockImplementation((path: string) => ({ data: { publicUrl: `https://mock.storage/${path}` } })),
  };
}

export const mockStorageBucket = createMockStorageBucket();

export const mockSupabase = {
  from: vi.fn((): MockBuilder => createMockQueryBuilder()),
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi
      .fn()
      .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
  storage: {
    from: vi.fn(() => mockStorageBucket),
  },
  rpc: vi.fn().mockResolvedValue({ data: 1, error: null }),
};

export type MockSupabase = typeof mockSupabase;

export const getSupabaseClient = (): MockSupabase => mockSupabase;
export const isSupabaseConfigured = (): boolean => true;
