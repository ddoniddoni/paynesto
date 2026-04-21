import { describe, expect, it } from 'vitest';

import {
  defaultSubscriptionFilters,
  defaultSubscriptionSortKey,
  filterSubscriptions,
  getCancellationScore,
  getMonthlyNormalizedAmount,
  getNextUpcomingSubscription,
  getSubscriptionListView,
  getTrialManagementSummary,
  getTrialEndingCount,
  hasActiveSubscriptionFilters,
  searchSubscriptions,
  sortSubscriptions,
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

  it('searches subscriptions by service name case-insensitively', () => {
    const subscriptions: Subscription[] = [
      baseSubscription,
      { ...baseSubscription, id: 'sub-2', serviceName: 'ChatGPT Plus' },
    ];

    expect(searchSubscriptions(subscriptions, 'chat').map((subscription) => subscription.id)).toEqual([
      'sub-2',
    ]);
  });

  it('searches subscriptions by note text', () => {
    const subscriptions: Subscription[] = [
      baseSubscription,
      {
        ...baseSubscription,
        id: 'sub-2',
        serviceName: 'Apple One',
        note: 'Family shared account',
      },
    ];

    expect(searchSubscriptions(subscriptions, 'family').map((subscription) => subscription.id)).toEqual([
      'sub-2',
    ]);
  });

  it('sorts subscriptions by next billing date first', () => {
    const sorted = sortSubscriptions(
      [
        { ...baseSubscription, id: 'sub-2', serviceName: 'B', nextBillingDate: '2026-04-21' },
        { ...baseSubscription, id: 'sub-1', serviceName: 'A', nextBillingDate: '2026-04-18' },
      ],
      'next_billing_asc'
    );

    expect(sorted.map((subscription) => subscription.id)).toEqual(['sub-1', 'sub-2']);
  });

  it('sorts subscriptions by normalized monthly cost descending', () => {
    const sorted = sortSubscriptions(
      [
        { ...baseSubscription, id: 'sub-1', amount: 120000, billingCycle: 'yearly' },
        { ...baseSubscription, id: 'sub-2', amount: 15000, billingCycle: 'monthly' },
        { ...baseSubscription, id: 'sub-3', amount: 9000, billingCycle: 'monthly' },
      ],
      'monthly_cost_desc'
    );

    expect(sorted.map((subscription) => subscription.id)).toEqual(['sub-2', 'sub-1', 'sub-3']);
  });

  it('combines filters, search, and sort into one visible list', () => {
    const subscriptions: Subscription[] = [
      {
        ...baseSubscription,
        id: 'sub-1',
        serviceName: 'Netflix',
        amount: 17000,
        nextBillingDate: '2026-04-19',
      },
      {
        ...baseSubscription,
        id: 'sub-2',
        serviceName: 'YouTube Premium',
        amount: 14900,
        nextBillingDate: '2026-04-18',
      },
      {
        ...baseSubscription,
        id: 'sub-3',
        serviceName: 'ChatGPT Plus',
        category: 'AI',
        currency: 'USD',
        amount: 20,
        nextBillingDate: '2026-04-17',
      },
    ];

    const visibleSubscriptions = getSubscriptionListView(subscriptions, {
      filters: {
        ...defaultSubscriptionFilters,
        category: 'OTT',
      },
      searchQuery: 'premium',
      sortKey: defaultSubscriptionSortKey,
    });

    expect(visibleSubscriptions.map((subscription) => subscription.id)).toEqual(['sub-2']);
  });

  it('returns a standard subscription summary for non-trial items', () => {
    const summary = getTrialManagementSummary(baseSubscription, new Date('2026-04-17T00:00:00.000Z'));

    expect(summary).toMatchObject({
      status: 'not_trial',
      daysUntilTrialEnd: null,
    });
  });

  it('flags active trial items without an end date', () => {
    const summary = getTrialManagementSummary(
      {
        ...baseSubscription,
        isTrial: true,
        trialEndDate: undefined,
      },
      new Date('2026-04-17T00:00:00.000Z')
    );

    expect(summary.status).toBe('missing_end_date');
  });

  it('marks trials ending within three days as urgent', () => {
    const summary = getTrialManagementSummary(
      {
        ...baseSubscription,
        isTrial: true,
        trialEndDate: '2026-04-20',
      },
      new Date('2026-04-17T00:00:00.000Z')
    );

    expect(summary.status).toBe('ending_soon');
    expect(summary.daysUntilTrialEnd).toBe(3);
  });

  it('marks future trials outside the urgent window as active', () => {
    const summary = getTrialManagementSummary(
      {
        ...baseSubscription,
        isTrial: true,
        trialEndDate: '2026-04-25',
      },
      new Date('2026-04-17T00:00:00.000Z')
    );

    expect(summary.status).toBe('active');
    expect(summary.daysUntilTrialEnd).toBe(8);
  });

  it('marks past trial end dates as ended', () => {
    const summary = getTrialManagementSummary(
      {
        ...baseSubscription,
        isTrial: true,
        trialEndDate: '2026-04-15',
      },
      new Date('2026-04-17T00:00:00.000Z')
    );

    expect(summary.status).toBe('ended');
    expect(summary.daysUntilTrialEnd).toBe(-2);
  });
});
