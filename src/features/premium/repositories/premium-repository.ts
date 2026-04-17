import { shouldUsePreviewRepository } from '@/lib/repository-mode';
import type {
  PremiumCheckoutInput,
  PremiumDataSource,
  PremiumTransaction,
} from '@/types/domain';

import { previewPremiumRepository } from './preview-premium-repository';
import { supabasePremiumRepository } from './supabase-premium-repository';

export type PremiumRepositoryResult<T> = {
  data: T;
  source: PremiumDataSource;
};

export type PremiumRepository = {
  listTransactions: (userId: string) => Promise<PremiumRepositoryResult<PremiumTransaction[]>>;
  activatePlan: (
    userId: string,
    input: PremiumCheckoutInput
  ) => Promise<PremiumRepositoryResult<PremiumTransaction>>;
};

export function getPremiumRepository(userId?: string | null): PremiumRepository {
  return shouldUsePreviewRepository(userId)
    ? previewPremiumRepository
    : supabasePremiumRepository;
}
