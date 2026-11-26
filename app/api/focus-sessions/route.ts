import { handleAuthenticatedRead } from '@/core/data/apiHandler';
import { readFocusSessions } from '@/core/data/queries';

// Always computed per request: the answer depends on who is asking.
export const dynamic = 'force-dynamic';

/** GET /api/focus-sessions: the signed-in user's focus sessions of the last 90 days (Analytics page). */
export function GET(request: Request): Promise<Response> {
  return handleAuthenticatedRead(request, readFocusSessions);
}
