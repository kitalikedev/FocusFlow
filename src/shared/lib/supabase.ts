import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/** True when both public Supabase environment variables are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
}

/**
 * Lazy getter for the single Supabase client of the application.
 * Only initializes and calls `createClient` when explicitly invoked.
 * Throws an informative error if environment variables are missing at call time.
 */
export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase environment variables missing: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be provided.',
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sb-focusflow-auth-token',
    },
  });
  return cachedClient;
}
