import { hasSupabaseClientEnv } from '@/lib/env';
import type { ExchangeRateDataSource, ExchangeRateSnapshot } from '@/types/domain';

import { previewExchangeRateRepository } from './preview-exchange-rate-repository';
import { supabaseExchangeRateRepository } from './supabase-exchange-rate-repository';

export type RepositoryResult<T> = {
  data: T;
  source: ExchangeRateDataSource;
};

export type ExchangeRateRepository = {
  getLatestUsdKrwSnapshot: () => Promise<RepositoryResult<ExchangeRateSnapshot | null>>;
};

export function getExchangeRateRepository(): ExchangeRateRepository {
  return hasSupabaseClientEnv ? supabaseExchangeRateRepository : previewExchangeRateRepository;
}
