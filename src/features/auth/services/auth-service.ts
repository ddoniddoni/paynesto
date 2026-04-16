import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { AuthCredentialsInput } from '@/features/auth/schemas/auth-credentials-schema';
import { getAuthCallbackParams } from '@/features/auth/utils/auth-callback-url';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-error-message';
import { assertSupabaseConfigured, getSupabaseClient } from '@/services/supabase';

WebBrowser.maybeCompleteAuthSession();

export const AUTH_CONFIG_ERROR_MESSAGE =
  'EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_ANON_KEY를 로컬 `.env`에 추가하면 인증 기능을 사용할 수 있어요.';

export const AUTH_CALLBACK_ERROR_MESSAGE =
  'Google 로그인 응답을 확인하지 못했어요. 다시 시도해 주세요.';

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

export function getGoogleAuthRedirectUri() {
  return makeRedirectUri({
    path: 'auth/callback',
    scheme: 'paynesto',
  });
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

export async function completeOAuthSessionFromUrl(url: string): Promise<AuthActionResult> {
  try {
    const client = assertSupabaseConfigured();
    const params = getAuthCallbackParams(url);

    if (params.errorCode) {
      return {
        ok: false,
        errorMessage: params.errorDescription ?? params.errorCode,
      };
    }

    if (params.code) {
      const { error } = await client.auth.exchangeCodeForSession(params.code);

      if (error) {
        return {
          ok: false,
          errorMessage: getAuthErrorMessage(error),
        };
      }

      return { ok: true };
    }

    if (params.accessToken && params.refreshToken) {
      const { error } = await client.auth.setSession({
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
      });

      if (error) {
        return {
          ok: false,
          errorMessage: getAuthErrorMessage(error),
        };
      }

      return { ok: true };
    }

    return {
      ok: false,
      errorMessage: AUTH_CALLBACK_ERROR_MESSAGE,
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage: getAuthErrorMessage(error),
    };
  }
}

export async function signInWithGoogle(): Promise<AuthActionResult> {
  try {
    const client = assertSupabaseConfigured();
    const redirectTo = getGoogleAuthRedirectUri();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: Platform.OS === 'web' ? { redirectTo } : { redirectTo, skipBrowserRedirect: true },
    });

    if (error) {
      return {
        ok: false,
        errorMessage: getAuthErrorMessage(error),
      };
    }

    if (Platform.OS === 'web') {
      return {
        ok: true,
        noticeMessage: 'Google 로그인 페이지로 이동하고 있어요.',
      };
    }

    if (!data?.url) {
      return {
        ok: false,
        errorMessage: AUTH_CALLBACK_ERROR_MESSAGE,
      };
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type !== 'success' || !result.url) {
      return {
        ok: false,
        errorMessage: 'Google 로그인이 취소되었거나 완료되지 않았어요.',
      };
    }

    return completeOAuthSessionFromUrl(result.url);
  } catch (error) {
    return {
      ok: false,
      errorMessage: getAuthErrorMessage(error),
    };
  }
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
