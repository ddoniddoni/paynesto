import type { Session, User } from '@supabase/supabase-js';
import React, {
  createContext,
  startTransition,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  AUTH_CONFIG_ERROR_MESSAGE,
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
};

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

function createState(
  status: AuthSessionStatus,
  session: Session | null,
  user: User | null,
  errorMessage: string | null = null
): AuthSessionState {
  return {
    status,
    session,
    user,
    errorMessage,
  };
}

function getStateFromSession(session: Session | null): AuthSessionState {
  if (session?.user) {
    return createState('authenticated', session, session.user);
  }

  return createState('anonymous', null, null);
}

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthSessionState>(initialState);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const result = await restoreAuthSession();

      if (!isMounted) {
        return;
      }

      startTransition(() => {
        if (result.status === 'unconfigured') {
          setState(createState('unconfigured', null, null, AUTH_CONFIG_ERROR_MESSAGE));
          return;
        }

        if (result.status === 'error') {
          setState(createState('error', null, null, result.errorMessage));
          return;
        }

        setState(getStateFromSession(result.session));
      });
    }

    void bootstrapSession();

    const subscription = subscribeToAuthStateChange((session) => {
      if (!isMounted) {
        return;
      }

      startTransition(() => {
        setState(getStateFromSession(session));
      });
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return <AuthSessionContext.Provider value={state}>{children}</AuthSessionContext.Provider>;
}
