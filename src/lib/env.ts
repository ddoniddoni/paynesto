import { z } from 'zod';

const clientEnvSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const rawClientEnv = clientEnvSchema.parse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

export const clientEnv = {
  supabaseUrl: rawClientEnv.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: rawClientEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const;

export const hasSupabaseClientEnv =
  clientEnv.supabaseUrl.length > 0 && clientEnv.supabaseAnonKey.length > 0;

export function getRequiredSupabaseClientEnv() {
  if (!hasSupabaseClientEnv) {
    throw new Error(
      'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them to your local .env before using Supabase services.'
    );
  }

  return clientEnv;
}
