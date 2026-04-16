import { describe, expect, it } from 'vitest';

import {
  createSubscriptionFxEstimate,
  getUsdSubscriptionEstimates,
} from '../../src/features/exchange-rate/utils/exchange-rate-utils';
import type { ExchangeRateSnapshot, Subscription } from '../../src/types/domain';

const snapshot: ExchangeRateSnapshot = {
  id: 'snapshot-1',
  baseCurrency: 'USD',
  quoteCurrency: 'KRW',
  rate: 1372.15,
  previousRate: 1360,
  fetchedAt: '2026-04-17T09:00:00.000Z',
  expiresAt: '2026-04-17T15:00:00.000Z',
  sourceLabel: 'Preview USD/KRW snapshot',
};

const monthlyUsdSubscription: Subscription = {
  id: 'sub-1',
  userId: 'user-1',
  serviceName: 'ChatGPT Plus',
  category: 'AI',
  billingCycle: 'monthly',
  amount: 20,
  currency: 'USD',
  paymentMethodType: 'card',
  nextBillingDate: '2026-04-20',
  isTrial: false,
  usageFrequency: 'high',
  isActive: true,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

describe('createSubscriptionFxEstimate', () => {
  it('creates a KRW estimate for an active USD subscription', () => {
    const estimate = createSubscriptionFxEstimate(monthlyUsdSubscription, snapshot);

    expect(estimate).toMatchObject({
      subscriptionId: 'sub-1',
      currency: 'USD',
      estimatedKrwAmount: 27443,
      estimateHighKrwAmount: 27992,
      normalizedMonthlyKrwAmount: 27443,
      volatilityDirection: 'up',
    });
  });

  it('returns null for non-USD subscriptions', () => {
    expect(
      createSubscriptionFxEstimate(
        {
          ...monthlyUsdSubscription,
          currency: 'KRW',
          amount: 17000,
        },
        snapshot
      )
    ).toBeNull();
  });
});

describe('getUsdSubscriptionEstimates', () => {
  it('collects estimates only for active USD subscriptions', () => {
    const estimates = getUsdSubscriptionEstimates(
      [
        monthlyUsdSubscription,
        {
          ...monthlyUsdSubscription,
          id: 'sub-2',
          isActive: false,
        },
        {
          ...monthlyUsdSubscription,
          id: 'sub-3',
          currency: 'KRW',
          amount: 17000,
        },
      ],
      snapshot
    );

    expect(estimates).toHaveLength(1);
    expect(estimates[0]?.subscriptionId).toBe('sub-1');
  });
});
