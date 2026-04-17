import { hasSupabaseClientEnv } from '@/lib/env';
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

export function getPremiumRepository(): PremiumRepository {
  return hasSupabaseClientEnv ? supabasePremiumRepository : previewPremiumRepository;
}
