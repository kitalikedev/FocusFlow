import { describe, it, expect } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createMockQueryBuilder, MockBuilder } from '@/shared/lib/__mocks__/supabase';
import { DEFAULT_THEME_CONFIG } from '@/core/theme/presets';
import { readFocusSessions, readSavedThemes } from '../queries';

function clientWith(...builders: MockBuilder[]): {
  client: SupabaseClient;
  from: ReturnType<typeof makeFrom>;
} {
  const from = makeFrom(builders);
  return { client: { from } as unknown as SupabaseClient, from };
}

function makeFrom(builders: MockBuilder[]) {
  const queue = [...builders];
  const calls: string[] = [];
  const from = (table: string) => {
    calls.push(table);
    return queue.shift() as MockBuilder;
  };
  from.calls = calls;
  return from;
}

const sessionRow = {
  id: 's1',
  duration_minutes: 25,
  intent_title: 'Draft',
  task_id: null,
  completed_at: 'x',
};

describe('readFocusSessions', () => {
  it('pages through the last 90 days in chunks of 500', async () => {
    const page = Array.from({ length: 500 }, (_, i) => ({ ...sessionRow, id: `a${i}` }));
    const first = createMockQueryBuilder({ data: page });
    const second = createMockQueryBuilder({ data: [{ ...sessionRow, id: 'last' }] });
    const { client, from } = clientWith(first, second);

    const sessions = await readFocusSessions(client);
    expect(sessions).toHaveLength(501);
    expect(sessions[0]).toMatchObject({
      id: 'a0',
      durationMinutes: 25,
      intentTitle: 'Draft',
      completedAt: 'x',
    });
    expect(from.calls).toEqual(['focus_sessions', 'focus_sessions']);
    expect(first.range).toHaveBeenCalledWith(0, 499);
    expect(second.range).toHaveBeenCalledWith(500, 999);
    expect(first.gte).toHaveBeenCalledWith('completed_at', expect.any(String));
    expect(first.order).toHaveBeenCalledWith('completed_at', { ascending: false });
  });

  it('returns an empty list for an empty history and throws AppError on errors', async () => {
    expect(
      await readFocusSessions(clientWith(createMockQueryBuilder({ data: null })).client)
    ).toEqual([]);

    const failing = clientWith(createMockQueryBuilder({ error: { code: 'PGRST301' } })).client;
    await expect(readFocusSessions(failing)).rejects.toMatchObject({
      code: 'AUTH_SESSION_EXPIRED',
    });
  });
});

describe('readSavedThemes', () => {
  const themeRow = {
    id: 'th1',
    user_id: 'u1',
    name: 'Night',
    config: {},
    created_at: 'c',
    updated_at: 'u',
  };

  it('lists themes oldest first and fills in a safe config', async () => {
    const builder = createMockQueryBuilder({ data: [themeRow] });
    const { client } = clientWith(builder);

    const themes = await readSavedThemes(client);
    expect(themes[0]).toMatchObject({ id: 'th1', name: 'Night' });
    expect(themes[0].config).toBe(DEFAULT_THEME_CONFIG);
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('handles no rows and maps errors', async () => {
    expect(
      await readSavedThemes(clientWith(createMockQueryBuilder({ data: null })).client)
    ).toEqual([]);
    const failing = clientWith(createMockQueryBuilder({ error: { code: '42501' } })).client;
    await expect(readSavedThemes(failing)).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
  });
});
