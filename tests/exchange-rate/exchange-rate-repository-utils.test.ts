import { describe, expect, it } from 'vitest';

import {
  mapRecordToSnapshot,
  parseFxUsdKrwFunctionResponse,
  shouldFallbackToPreview,
} from '@/features/exchange-rate/repositories/exchange-rate-repository-utils';

describe('mapRecordToSnapshot', () => {
  it('maps a Supabase snapshot row into the app domain shape', () => {
    expect(
      mapRecordToSnapshot({
        id: 'snapshot-1',
        base_currency: 'USD',
        quote_currency: 'KRW',
        rate: 1380.42,
        previous_rate: 1374.18,
        fetched_at: '2026-04-17T04:20:00.000Z',
        expires_at: '2026-04-18T04:20:00.000Z',
        source_label: 'Frankfurter USD/KRW (2026-04-17)',
      })
    ).toEqual({
      id: 'snapshot-1',
      baseCurrency: 'USD',
      quoteCurrency: 'KRW',
      rate: 1380.42,
      previousRate: 1374.18,
      fetchedAt: '2026-04-17T04:20:00.000Z',
      expiresAt: '2026-04-18T04:20:00.000Z',
      sourceLabel: 'Frankfurter USD/KRW (2026-04-17)',
    });
  });
});

describe('parseFxUsdKrwFunctionResponse', () => {
  it('returns the normalized snapshot when the Edge Function response is valid', () => {
    expect(
      parseFxUsdKrwFunctionResponse({
        snapshot: {
          id: 'fx-usd-krw-live',
          baseCurrency: 'USD',
          quoteCurrency: 'KRW',
          rate: 1379.5,
          previousRate: 1372.1,
          fetchedAt: '2026-04-17T04:20:00.000Z',
          expiresAt: '2026-04-18T04:20:00.000Z',
          sourceLabel: 'Frankfurter USD/KRW (2026-04-17)',
        },
      })
    ).toMatchObject({
      id: 'fx-usd-krw-live',
      baseCurrency: 'USD',
      quoteCurrency: 'KRW',
      rate: 1379.5,
    });
  });

  it('returns null when the Edge Function payload is malformed', () => {
    expect(
      parseFxUsdKrwFunctionResponse({
        snapshot: {
          id: 'fx-usd-krw-live',
          baseCurrency: 'EUR',
        },
      })
    ).toBeNull();
  });
});

describe('shouldFallbackToPreview', () => {
  it('detects missing table/schema-cache errors', () => {
    expect(
      shouldFallbackToPreview('Could not find the table public.exchange_rate_snapshots in the schema cache')
    ).toBe(true);
  });

  it('does not hide unrelated Supabase errors', () => {
    expect(shouldFallbackToPreview('JWT expired')).toBe(false);
  });
});
