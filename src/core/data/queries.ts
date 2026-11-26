import type { SupabaseClient } from '@supabase/supabase-js';
import type { FocusSessionRecord, SavedTheme } from '@/shared/types/contracts';
import { toAppError } from '@/shared/lib/errors';
import { FocusSessionRow, rowToSavedTheme, rowToSession, SavedThemeRow } from './mappers';

/**
 * Read queries for the two dynamic pages. They take the client as a parameter, so the same code runs in the
 * browser (guest merge and tests) and on the server in the /api Route Handlers (issue #61). Row Level Security
 * applies either way, because the client carries the user's own access token.
 */

export interface QueryResult<T> {
  data: T | null;
  error: unknown;
}

export function unwrap<T>(result: QueryResult<T>): T | null {
  if (result.error) throw toAppError(result.error);
  return result.data;
}

const SESSIONS_PAGE_SIZE = 500;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

/** Focus sessions of the last 90 days, newest first, read page by page (Analytics page). */
export async function readFocusSessions(client: SupabaseClient): Promise<FocusSessionRecord[]> {
  const since = new Date(Date.now() - NINETY_DAYS_MS).toISOString();
  const sessions: FocusSessionRecord[] = [];
  let from = 0;

  for (;;) {
    const page = unwrap(
      await (client
        .from('focus_sessions')
        .select('id, duration_minutes, intent_title, task_id, completed_at')
        .gte('completed_at', since)
        .order('completed_at', { ascending: false })
        .range(from, from + SESSIONS_PAGE_SIZE - 1) as unknown as PromiseLike<
        QueryResult<FocusSessionRow[]>
      >)
    );
    const rows = page ?? [];
    sessions.push(...rows.map(rowToSession));
    if (rows.length < SESSIONS_PAGE_SIZE) break;
    from += SESSIONS_PAGE_SIZE;
  }
  return sessions;
}

/** Saved themes of the user, oldest first (Themes page). */
export async function readSavedThemes(client: SupabaseClient): Promise<SavedTheme[]> {
  const rows =
    unwrap(
      await (client
        .from('saved_themes')
        .select('*')
        .order('created_at', { ascending: true }) as unknown as PromiseLike<
        QueryResult<SavedThemeRow[]>
      >)
    ) ?? [];
  return rows.map(rowToSavedTheme);
}
