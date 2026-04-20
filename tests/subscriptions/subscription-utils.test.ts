import { describe, expect, it } from 'vitest';

import {
  defaultSubscriptionFilters,
  filterSubscriptions,
  getCancellationScore,
  getMonthlyNormalizedAmount,
  getNextUpcomingSubscription,
  getTrialEndingCount,
  hasActiveSubscriptionFilters,
} from '../../src/features/subscriptions/utils/subscription-utils';
import type { Subscription } from '../../src/types/domain';

const baseSubscription: Subscription = {
  id: 'sub-1',
  userId: 'user-1',
  serviceName: 'Netflix',
  category: 'OTT',
  billingCycle: 'monthly',
  amount: 17000,
  currency: 'KRW',
  paymentMethodType: 'card',
  nextBillingDate: '2026-04-19',
  isTrial: false,
  usageFrequency: 'high',
  isActive: true,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

describe('subscription utils', () => {
  it('normalizes yearly cost into monthly amount', () => {
    expect(getMonthlyNormalizedAmount(120000, 'yearly')).toBe(10000);
  });

  it('calculates cancellation score from usage and billing pressure', () => {
    expect(
      getCancellationScore({
        usageFrequency: 'low',
        isTrial: true,
        daysUntilBilling: 2,
        duplicateCategoryCount: 3,
      })
    ).toBe(9);
  });

  it('returns the nearest active billing item', () => {
    const next = getNextUpcomingSubscription([
      { ...baseSubscription, id: 'sub-2', nextBillingDate: '2026-04-21' },
      { ...baseSubscription, id: 'sub-1', nextBillingDate: '2026-04-18' },
    ]);

    expect(next?.id).toBe('sub-1');
  });

  it('counts active trial subscriptions', () => {
    expect(
      getTrialEndingCount([
        { ...baseSubscription, id: 'sub-1', isTrial: true, trialEndDate: '2026-04-17' },
        { ...baseSubscription, id: 'sub-2', isTrial: false },
      ])
    ).toBe(1);
  });

  it('filters subscriptions by category, currency, and billing cycle', () => {
    const subscriptions: Subscription[] = [
      baseSubscription,
      {
        ...baseSubscription,
        id: 'sub-2',
        serviceName: 'ChatGPT',
        category: 'AI',
        currency: 'USD',
        billingCycle: 'monthly',
      },
      {
        ...baseSubscription,
        id: 'sub-3',
        serviceName: 'Dropbox',
        category: 'Cloud',
        currency: 'USD',
        billingCycle: 'yearly',
      },
    ];

    const filtered = filterSubscriptions(subscriptions, {
      category: 'Cloud',
      currency: 'USD',
      billingCycle: 'yearly',
    });

    expect(filtered.map((subscription) => subscription.id)).toEqual(['sub-3']);
  });

  it('keeps all subscriptions when filters are reset', () => {
    expect(filterSubscriptions([baseSubscription], defaultSubscriptionFilters)).toEqual([
      baseSubscription,
    ]);
    expect(hasActiveSubscriptionFilters(defaultSubscriptionFilters)).toBe(false);
    expect(
      hasActiveSubscriptionFilters({
        ...defaultSubscriptionFilters,
        currency: 'USD',
      })
    ).toBe(true);
  });
});
