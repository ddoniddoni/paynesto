import { hasSupabaseClientEnv } from '@/lib/env';
import type {
  MoneyPlanDataSource,
  UserFinancialProfile,
  UserFinancialProfileWriteInput,
} from '@/types/domain';

import { previewMoneyPlanRepository } from './preview-money-plan-repository';
import { supabaseMoneyPlanRepository } from './supabase-money-plan-repository';

export type RepositoryResult<T> = {
  data: T;
  source: MoneyPlanDataSource;
};

export type MoneyPlanRepository = {
  getProfile: (userId: string) => Promise<RepositoryResult<UserFinancialProfile | null>>;
  upsertProfile: (
    userId: string,
    input: UserFinancialProfileWriteInput
  ) => Promise<RepositoryResult<UserFinancialProfile>>;
};

export function getMoneyPlanRepository(): MoneyPlanRepository {
  return hasSupabaseClientEnv ? supabaseMoneyPlanRepository : previewMoneyPlanRepository;
}
