import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseForToken } from '@/shared/lib/supabase';
import { AppError } from '@/shared/lib/errors';

/**
 * Shared body of the read-only /api Route Handlers (issue #61).
 *
 * The browser sends its Supabase access token in the Authorization header. The server checks the token with
 * Supabase Auth, then runs the query with a client that acts as that user, so Row Level Security still returns
 * only the user's own rows. No service role key is involved.
 */

const NO_STORE = { 'Cache-Control': 'no-store' };

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

function bearerToken(request: Request): string | null {
  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.get('authorization') ?? '');
  return match ? match[1] : null;
}

export async function handleAuthenticatedRead<T>(
  request: Request,
  read: (client: SupabaseClient) => Promise<T>
): Promise<Response> {
  const token = bearerToken(request);
  if (!token) return json({ error: 'UNAUTHORIZED' }, 401);

  try {
    const client = createSupabaseForToken(token);
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return json({ error: 'UNAUTHORIZED' }, 401);

    return json(await read(client), 200);
  } catch (error) {
    if (error instanceof AppError && error.code === 'AUTH_SESSION_EXPIRED') {
      return json({ error: 'UNAUTHORIZED' }, 401);
    }
    // Details stay in the server log; the browser only learns that the read failed.
    console.error('API read failed', error instanceof Error ? error.name : 'unknown');
    return json({ error: 'READ_FAILED' }, 500);
  }
}
