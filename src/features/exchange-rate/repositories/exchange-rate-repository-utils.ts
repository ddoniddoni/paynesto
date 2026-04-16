import { z } from 'zod';

import type { ExchangeRateSnapshot } from '@/types/domain';

export type ExchangeRateSnapshotRecord = {
  id: string;
  base_currency: 'USD';
  quote_currency: 'KRW';
  rate: number;
  previous_rate: number | null;
  fetched_at: string;
  expires_at: string | null;
  source_label: string;
};

const exchangeRateSnapshotSchema = z.object({
  id: z.string().min(1),
  baseCurrency: z.literal('USD'),
  quoteCurrency: z.literal('KRW'),
  rate: z.number().positive(),
  previousRate: z.number().positive().nullable().optional(),
  fetchedAt: z.string().min(1),
  expiresAt: z.string().min(1).nullable().optional(),
  sourceLabel: z.string().min(1),
});

const fxUsdKrwFunctionResponseSchema = z.object({
  snapshot: exchangeRateSnapshotSchema,
});

export function shouldFallbackToPreview(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('exchange_rate_snapshots') &&
    (normalized.includes('does not exist') ||
      normalized.includes('schema cache') ||
      normalized.includes('could not find the table'))
  );
}

export function mapRecordToSnapshot(record: ExchangeRateSnapshotRecord): ExchangeRateSnapshot {
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

export function parseFxUsdKrwFunctionResponse(data: unknown): ExchangeRateSnapshot | null {
  const parsed = fxUsdKrwFunctionResponseSchema.safeParse(data);

  if (!parsed.success) {
    return null;
  }

  return {
    ...parsed.data.snapshot,
    previousRate: parsed.data.snapshot.previousRate ?? undefined,
    expiresAt: parsed.data.snapshot.expiresAt ?? undefined,
  };
}
