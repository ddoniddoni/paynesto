import type { ExchangeRateSnapshot } from '@/types/domain';

import type { ExchangeRateRepository } from './exchange-rate-repository';

const previewSnapshot: ExchangeRateSnapshot = {
  id: 'preview-usd-krw',
  baseCurrency: 'USD',
  quoteCurrency: 'KRW',
  rate: 1372.15,
  previousRate: 1361.4,
  fetchedAt: '2026-04-17T09:00:00.000Z',
  expiresAt: '2026-04-17T15:00:00.000Z',
  sourceLabel: 'Preview USD/KRW snapshot',
};

export const previewExchangeRateRepository: ExchangeRateRepository = {
  async getLatestUsdKrwSnapshot() {
    return {
      data: previewSnapshot,
      source: 'preview',
    };
  },
};
