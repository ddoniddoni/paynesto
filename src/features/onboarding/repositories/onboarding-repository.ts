import { shouldUsePreviewRepository } from '@/lib/repository-mode';
import type {
  OnboardingCompletionInput,
  OnboardingDataSource,
  OnboardingStatus,
} from '@/types/domain';

import { previewOnboardingRepository } from './preview-onboarding-repository';
import { supabaseOnboardingRepository } from './supabase-onboarding-repository';

export type OnboardingRepositoryResult<T> = {
  data: T;
  source: OnboardingDataSource;
};

export type OnboardingRepository = {
  getStatus: (userId: string) => Promise<OnboardingRepositoryResult<OnboardingStatus | null>>;
  finish: (
    userId: string,
    input: OnboardingCompletionInput
  ) => Promise<OnboardingRepositoryResult<OnboardingStatus>>;
};

export function getOnboardingRepository(userId?: string | null): OnboardingRepository {
  return shouldUsePreviewRepository(userId)
    ? previewOnboardingRepository
    : supabaseOnboardingRepository;
}
