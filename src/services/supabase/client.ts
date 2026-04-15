import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getRequiredSupabaseClientEnv, hasSupabaseClientEnv } from '@/lib/env';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!hasSupabaseClientEnv) {
    return null;
  }

  if (!supabaseClient) {
    const env = getRequiredSupabaseClientEnv();

    supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseClient;
}

export function assertSupabaseConfigured() {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error(
      'Supabase is not configured yet. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your local environment.'
    );
  }

  return client;
}
