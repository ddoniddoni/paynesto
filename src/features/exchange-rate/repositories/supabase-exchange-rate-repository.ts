import { assertSupabaseConfigured } from '@/services/supabase';
import type { ExchangeRateSnapshot } from '@/types/domain';

import { previewExchangeRateRepository } from './preview-exchange-rate-repository';
import type { ExchangeRateRepository } from './exchange-rate-repository';

type ExchangeRateSnapshotRecord = {
  id: string;
  base_currency: 'USD';
  quote_currency: 'KRW';
  rate: number;
  previous_rate: number | null;
  fetched_at: string;
  expires_at: string | null;
  source_label: string;
};

function shouldFallbackToPreview(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('exchange_rate_snapshots') &&
    (normalized.includes('does not exist') ||
      normalized.includes('schema cache') ||
      normalized.includes('could not find the table'))
  );
}

function mapRecordToSnapshot(record: ExchangeRateSnapshotRecord): ExchangeRateSnapshot {
  return {
    id: record.id,
    baseCurrency: record.base_currency,
    quoteCurrency: record.quote_currency,
    rate: record.rate,
    previousRate: record.previous_rate ?? undefined,
    fetchedAt: record.fetched_at,
    expiresAt: record.expires_at ?? undefined,
    sourceLabel: record.source_label,
  };
}

export const supabaseExchangeRateRepository: ExchangeRateRepository = {
  async getLatestUsdKrwSnapshot() {
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
        return previewExchangeRateRepository.getLatestUsdKrwSnapshot();
      }

      throw new Error(error.message);
    }

    return {
      data: data ? mapRecordToSnapshot(data as ExchangeRateSnapshotRecord) : null,
      source: 'supabase',
    };
  },
};
