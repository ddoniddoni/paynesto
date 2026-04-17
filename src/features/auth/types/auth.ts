import type { Session, User } from '@supabase/supabase-js';

export const authSessionStatuses = [
  'loading',
  'authenticated',
  'preview',
  'anonymous',
  'unconfigured',
  'error',
] as const;

export type AuthSessionStatus = (typeof authSessionStatuses)[number];

export type AuthSessionState = {
  status: AuthSessionStatus;
  session: Session | null;
  user: User | null;
  errorMessage: string | null;
  enterPreviewMode: () => Promise<void>;
  exitPreviewMode: () => Promise<void>;
};
