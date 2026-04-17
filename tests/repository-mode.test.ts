import { afterEach, describe, expect, it, vi } from 'vitest';

import { PREVIEW_USER_ID } from '@/features/auth/utils/preview-user';

afterEach(() => {
  vi.resetModules();
  vi.doUnmock('@/lib/env');
});

describe('repository selection in preview mode', () => {
  it('uses preview storage for the preview user even when Supabase env exists', async () => {
    vi.doMock('@/lib/env', () => ({
      hasSupabaseClientEnv: true,
    }));

    const { shouldUsePreviewRepository } = await import('@/lib/repository-mode');

    expect(shouldUsePreviewRepository(PREVIEW_USER_ID)).toBe(true);
    expect(shouldUsePreviewRepository('00000000-0000-0000-0000-000000000001')).toBe(false);
  });

  it('falls back to preview storage for every user when Supabase env is missing', async () => {
    vi.doMock('@/lib/env', () => ({
      hasSupabaseClientEnv: false,
    }));

    const { shouldUsePreviewRepository } = await import('@/lib/repository-mode');

    expect(shouldUsePreviewRepository('00000000-0000-0000-0000-000000000001')).toBe(true);
  });
});
