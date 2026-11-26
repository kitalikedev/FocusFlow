import { handleAuthenticatedRead } from '@/core/data/apiHandler';
import { readSavedThemes } from '@/core/data/queries';

// Always computed per request: the answer depends on who is asking.
export const dynamic = 'force-dynamic';

/** GET /api/saved-themes: the signed-in user's saved themes (Themes page). */
export function GET(request: Request): Promise<Response> {
  return handleAuthenticatedRead(request, readSavedThemes);
}
