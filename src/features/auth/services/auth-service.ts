import type { Session } from '@supabase/supabase-js';

import type { AuthCredentialsInput } from '@/features/auth/schemas/auth-credentials-schema';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-error-message';
import { assertSupabaseConfigured, getSupabaseClient } from '@/services/supabase';

export const AUTH_CONFIG_ERROR_MESSAGE =
  'EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_ANON_KEY를 로컬 `.env`에 추가하면 인증을 사용할 수 있어요.';

export type AuthActionResult =
  | {
      ok: true;
      noticeMessage?: string;
    }
  | {
      ok: false;
      errorMessage: string;
    };

type RestoreAuthSessionResult =
  | {
      status: 'ready';
      session: Session | null;
    }
  | {
      status: 'unconfigured';
      errorMessage: string;
    }
  | {
      status: 'error';
      errorMessage: string;
    };

function normalizeCredentials(input: AuthCredentialsInput) {
  return {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  };
}

export async function restoreAuthSession(): Promise<RestoreAuthSessionResult> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      status: 'unconfigured',
      errorMessage: AUTH_CONFIG_ERROR_MESSAGE,
    };
  }

  const { data, error } = await client.auth.getSession();

  if (error) {
    return {
      status: 'error',
      errorMessage: getAuthErrorMessage(error),
    };
  }

  return {
    status: 'ready',
    session: data.session,
  };
}

export function subscribeToAuthStateChange(callback: (session: Session | null) => void) {
  const client = getSupabaseClient();

  if (!client) {
    return null;
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return subscription;
}

export async function signInWithEmailPassword(
  input: AuthCredentialsInput
): Promise<AuthActionResult> {
  try {
    const client = assertSupabaseConfigured();
    const credentials = normalizeCredentials(input);
    const { error } = await client.auth.signInWithPassword(credentials);

    if (error) {
      return {
        ok: false,
        errorMessage: getAuthErrorMessage(error),
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: getAuthErrorMessage(error),
    };
  }
}

export async function signUpWithEmailPassword(
  input: AuthCredentialsInput
): Promise<AuthActionResult> {
  try {
    const client = assertSupabaseConfigured();
    const credentials = normalizeCredentials(input);
    const { data, error } = await client.auth.signUp(credentials);

    if (error) {
      return {
        ok: false,
        errorMessage: getAuthErrorMessage(error),
      };
    }

    if (!data.session) {
      return {
        ok: true,
        noticeMessage: '인증 메일을 보냈어요. 메일 확인 후 다시 로그인해 주세요.',
      };
    }

    return {
      ok: true,
      noticeMessage: '계정이 생성되어 바로 로그인되었어요.',
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage: getAuthErrorMessage(error),
    };
  }
}

export async function signOut(): Promise<AuthActionResult> {
  try {
    const client = assertSupabaseConfigured();
    const { error } = await client.auth.signOut();

    if (error) {
      return {
        ok: false,
        errorMessage: getAuthErrorMessage(error),
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: getAuthErrorMessage(error),
    };
  }
}
