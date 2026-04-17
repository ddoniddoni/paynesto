import { isPreviewUserId } from '@/features/auth/utils/preview-user';
import { hasSupabaseClientEnv } from '@/lib/env';

export function shouldUsePreviewRepository(userId?: string | null) {
  return !hasSupabaseClientEnv || isPreviewUserId(userId);
}
