// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppError } from '@/shared/lib/errors';
import { handleAuthenticatedRead } from '../apiHandler';

const getUser = vi.fn();
const client = { auth: { getUser } };

vi.mock('@/shared/lib/supabase', () => ({
  createSupabaseForToken: vi.fn(() => client),
}));

function request(authorization?: string): Request {
  return new Request(
    'http://localhost/api/x',
    authorization ? { headers: { authorization } } : undefined
  );
}

describe('handleAuthenticatedRead', () => {
  beforeEach(() => {
    getUser.mockReset();
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without calling the query when the token is missing or malformed', async () => {
    const read = vi.fn();
    for (const header of [undefined, 'Basic abc', 'Bearer', 'Bearer a b']) {
      const response = await handleAuthenticatedRead(request(header), read);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'UNAUTHORIZED' });
    }
    expect(read).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
  });

  it('returns 401 when Supabase rejects the token or finds no user', async () => {
    const read = vi.fn();
    getUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'invalid JWT' } });
    expect((await handleAuthenticatedRead(request('Bearer bad'), read)).status).toBe(401);
    getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    expect((await handleAuthenticatedRead(request('Bearer none'), read)).status).toBe(401);
    expect(read).not.toHaveBeenCalled();
  });

  it('checks the token, runs the query with the user client and answers with no-store', async () => {
    const read = vi.fn().mockResolvedValue([{ id: 's1' }]);
    const response = await handleAuthenticatedRead(request('Bearer good-token'), read);

    expect(getUser).toHaveBeenCalledWith('good-token');
    expect(read).toHaveBeenCalledWith(client);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual([{ id: 's1' }]);
  });

  it('accepts the Bearer word in any letter case', async () => {
    const read = vi.fn().mockResolvedValue([]);
    expect((await handleAuthenticatedRead(request('bearer t'), read)).status).toBe(200);
  });

  it('maps an expired session to 401', async () => {
    const read = vi.fn().mockRejectedValue(new AppError('AUTH_SESSION_EXPIRED'));
    expect((await handleAuthenticatedRead(request('Bearer t'), read)).status).toBe(401);
  });

  it('answers 500 without database details for any other failure', async () => {
    const read = vi.fn().mockRejectedValue(new Error('relation "tasks" does not exist'));
    const response = await handleAuthenticatedRead(request('Bearer t'), read);

    expect(response.status).toBe(500);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({ error: 'READ_FAILED' });
    expect(text).not.toContain('relation');
  });
});
