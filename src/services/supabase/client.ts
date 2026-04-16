import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';

import { getRequiredSupabaseClientEnv, hasSupabaseClientEnv } from '@/lib/env';

let supabaseClient: SupabaseClient | null = null;
let appStateListenerAttached = false;

function attachAuthAutoRefresh(client: SupabaseClient) {
  if (Platform.OS === 'web' || appStateListenerAttached) {
    return;
  }

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      client.auth.startAutoRefresh();
      return;
    }

    client.auth.stopAutoRefresh();
  });

  appStateListenerAttached = true;
}

export function getSupabaseClient() {
  if (!hasSupabaseClientEnv) {
    return null;
  }

  if (!supabaseClient) {
    const env = getRequiredSupabaseClientEnv();

    supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    });

    attachAuthAutoRefresh(supabaseClient);
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
