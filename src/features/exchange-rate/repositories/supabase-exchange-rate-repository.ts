import { assertSupabaseConfigured } from '@/services/supabase';

import { previewExchangeRateRepository } from './preview-exchange-rate-repository';
import type { ExchangeRateRepository } from './exchange-rate-repository';
import {
  mapRecordToSnapshot,
  parseFxUsdKrwFunctionResponse,
  shouldFallbackToPreview,
  type ExchangeRateSnapshotRecord,
} from './exchange-rate-repository-utils';

async function getLiveSnapshotFromFunction() {
  const client = assertSupabaseConfigured();
  const { data, error } = await client.functions.invoke('fx-usd-krw');

  if (error) {
    return null;
  }

  return parseFxUsdKrwFunctionResponse(data);
}

async function getLatestCachedSnapshot() {
  const client = assertSupabaseConfigured();
  const { data, error } = await client
    .from('exchange_rate_snapshots')
    .select('*')
    .eq('base_currency', 'USD')
    .eq('quote_currency', 'KRW')
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (shouldFallbackToPreview(error.message)) {
      return null;
    }

    throw new Error(error.message);
  }

  return data ? mapRecordToSnapshot(data as ExchangeRateSnapshotRecord) : null;
}

export const supabaseExchangeRateRepository: ExchangeRateRepository = {
  async getLatestUsdKrwSnapshot() {
    const liveSnapshot = await getLiveSnapshotFromFunction();

    if (liveSnapshot) {
      return {
        data: liveSnapshot,
        source: 'supabase',
      };
    }

    const data = await getLatestCachedSnapshot();

    if (!data) {
      return previewExchangeRateRepository.getLatestUsdKrwSnapshot();
    }

    return {
      data,
      source: 'supabase',
    };
  },
};
