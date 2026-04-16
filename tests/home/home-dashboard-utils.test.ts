import { describe, expect, it } from 'vitest';

import { createHomeDashboardSummary } from '@/features/home/utils/home-dashboard-utils';
import type { ExchangeRateSnapshot, Subscription, UserFinancialProfile } from '@/types/domain';

const profile: UserFinancialProfile = {
  id: 'profile-1',
  userId: 'user-1',
  monthlyNetSalary: 3200000,
  monthlyFixedCosts: 1450000,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

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

const subscriptions: Subscription[] = [
  {
    id: 'sub-krw',
    userId: 'user-1',
    serviceName: 'Netflix',
    category: 'OTT',
    billingCycle: 'monthly',
    amount: 17000,
    currency: 'KRW',
    paymentMethodType: 'card',
    nextBillingDate: '2026-04-20',
    isTrial: false,
    usageFrequency: 'high',
    isActive: true,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'sub-usd',
    userId: 'user-1',
    serviceName: 'ChatGPT Plus',
    category: 'AI',
    billingCycle: 'monthly',
    amount: 20,
    currency: 'USD',
    paymentMethodType: 'card',
    nextBillingDate: '2026-04-19',
    isTrial: false,
    usageFrequency: 'medium',
    isActive: true,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'sub-trial',
    userId: 'user-1',
    serviceName: 'Apple TV+',
    category: 'OTT',
    billingCycle: 'monthly',
    amount: 6500,
    currency: 'KRW',
    paymentMethodType: 'app_store',
    nextBillingDate: '2026-04-18',
    isTrial: true,
    usageFrequency: 'low',
    isActive: true,
    trialEndDate: '2026-04-18',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
];

describe('createHomeDashboardSummary', () => {
  it('combines KRW subscriptions and USD estimates into a monthly dashboard total', () => {
    const summary = createHomeDashboardSummary({
      subscriptions,
      profile,
      snapshot,
    });

    expect(summary.monthlyKrwSubscriptionTotal).toBe(23500);
    expect(summary.monthlyUsdEstimateTotal).toBe(27443);
    expect(summary.totalMonthlySubscriptionSpend).toBe(50943);
    expect(summary.salaryRatio).toBeCloseTo(50943 / 3200000, 5);
    expect(summary.nextBilling?.serviceName).toBe('Apple TV+');
  });

  it('suggests setup guidance when Money Plan is missing', () => {
    const summary = createHomeDashboardSummary({
      subscriptions: [],
      profile: null,
      snapshot: null,
    });

    expect(summary.actions.map((action) => action.id)).toEqual([
      'add-first-subscription',
      'setup-money-plan',
    ]);
  });

  it('surfaces review actions for heavier subscription pressure and trials', () => {
    const summary = createHomeDashboardSummary({
      subscriptions: subscriptions.map((subscription) =>
        subscription.id === 'sub-krw'
          ? {
              ...subscription,
              amount: 250000,
              usageFrequency: 'low',
            }
          : subscription
      ),
      profile: {
        ...profile,
        monthlyNetSalary: 800000,
      },
      snapshot,
    });

    expect(summary.salaryHealthStatus).toBe('warning');
    expect(summary.actions.map((action) => action.id)).toContain('trim-subscription');
    expect(summary.actions.map((action) => action.id)).toContain('review-trials');
  });
});
