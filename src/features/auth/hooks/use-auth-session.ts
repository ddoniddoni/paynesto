import { useContext } from 'react';

import { AuthSessionContext } from '@/features/auth/providers/auth-session-provider';

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider.');
  }

  return context;
}
