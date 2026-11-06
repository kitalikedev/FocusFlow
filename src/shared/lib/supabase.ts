import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Lazy getter for Supabase Client.
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
      'Supabase environment variables missing: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be provided.'
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseKey);
  return cachedClient;
}
