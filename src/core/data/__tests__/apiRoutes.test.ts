// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

const handleAuthenticatedRead = vi.fn(async () => new Response('[]'));
const readFocusSessions = vi.fn();
const readSavedThemes = vi.fn();

vi.mock('../apiHandler', () => ({ handleAuthenticatedRead }));
vi.mock('../queries', () => ({ readFocusSessions, readSavedThemes }));

describe('API routes', () => {
  it('GET /api/focus-sessions reads the focus sessions and is never cached', async () => {
    const route = await import('../../../../app/api/focus-sessions/route');
    const request = new Request('http://localhost/api/focus-sessions');

    await route.GET(request);
    expect(handleAuthenticatedRead).toHaveBeenLastCalledWith(request, readFocusSessions);
    expect(route.dynamic).toBe('force-dynamic');
  });

  it('GET /api/saved-themes reads the saved themes and is never cached', async () => {
    const route = await import('../../../../app/api/saved-themes/route');
    const request = new Request('http://localhost/api/saved-themes');

    await route.GET(request);
    expect(handleAuthenticatedRead).toHaveBeenLastCalledWith(request, readSavedThemes);
    expect(route.dynamic).toBe('force-dynamic');
  });
});
