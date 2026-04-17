import type { Session, User } from '@supabase/supabase-js';
import React, {
  createContext,
  startTransition,
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  AUTH_CONFIG_ERROR_MESSAGE,
  disablePreviewMode,
  enablePreviewMode,
  getPreviewUser,
  isPreviewModeEnabled,
  restoreAuthSession,
  subscribeToAuthStateChange,
} from '@/features/auth/services/auth-service';
import type { AuthSessionState, AuthSessionStatus } from '@/features/auth/types/auth';

type AuthSessionContextValue = AuthSessionState;

const initialState: AuthSessionState = {
  status: 'loading',
  session: null,
  user: null,
  errorMessage: null,
  enterPreviewMode: async () => {},
  exitPreviewMode: async () => {},
};

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

function createState(
  status: AuthSessionStatus,
  session: Session | null,
  user: User | null,
  errorMessage: string | null,
  enterPreviewMode: () => Promise<void>,
  exitPreviewMode: () => Promise<void>
): AuthSessionState {
  return {
    status,
    session,
    user,
    errorMessage,
    enterPreviewMode,
    exitPreviewMode,
  };
}

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthSessionState>(initialState);

  const createContextState = useCallback(
    (
      status: AuthSessionStatus,
      session: Session | null,
      user: User | null,
      errorMessage: string | null = null
    ): AuthSessionState =>
      createState(
        status,
        session,
        user,
        errorMessage,
        async () => {
          await enablePreviewMode();

          startTransition(() => {
            setState(createContextState('preview', null, getPreviewUser(), null));
          });
        },
        async () => {
          await disablePreviewMode();
          const result = await restoreAuthSession();

          startTransition(() => {
            if (result.status === 'unconfigured') {
              setState(createContextState('unconfigured', null, null, AUTH_CONFIG_ERROR_MESSAGE));
              return;
            }

            if (result.status === 'error') {
              setState(createContextState('error', null, null, result.errorMessage));
              return;
            }

            if (result.session?.user) {
              setState(
                createContextState('authenticated', result.session, result.session.user, null)
              );
              return;
            }

            setState(createContextState('anonymous', null, null, null));
          });
        }
      ),
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const [result, previewEnabled] = await Promise.all([
        restoreAuthSession(),
        isPreviewModeEnabled(),
      ]);

      if (!isMounted) {
        return;
      }

      startTransition(() => {
        if (result.status === 'ready' && result.session?.user) {
          setState(createContextState('authenticated', result.session, result.session.user, null));
          return;
        }

        if (previewEnabled) {
          setState(createContextState('preview', null, getPreviewUser(), null));
          return;
        }

        if (result.status === 'unconfigured') {
          setState(createContextState('unconfigured', null, null, AUTH_CONFIG_ERROR_MESSAGE));
          return;
        }

        if (result.status === 'error') {
          setState(createContextState('error', null, null, result.errorMessage));
          return;
        }

        setState(createContextState('anonymous', null, null, null));
      });
    }

    void bootstrapSession();

    const subscription = subscribeToAuthStateChange((session) => {
      if (!isMounted) {
        return;
      }

      startTransition(() => {
        if (session?.user) {
          setState(createContextState('authenticated', session, session.user, null));
          return;
        }

        setState(createContextState('anonymous', null, null, null));
      });
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [createContextState]);

  return <AuthSessionContext.Provider value={state}>{children}</AuthSessionContext.Provider>;
}
