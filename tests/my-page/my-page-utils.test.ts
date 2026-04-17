import { describe, expect, it } from 'vitest';

import { createMyPageSummary } from '@/features/my-page/utils/my-page-utils';
import { createDefaultNotificationSettings } from '@/features/settings/utils/notification-settings-utils';
import type { PremiumTransaction, Subscription, UserFinancialProfile } from '@/types/domain';

const subscriptions: Subscription[] = [
  {
    id: 'sub-1',
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
];

const profile: UserFinancialProfile = {
  id: 'profile-1',
  userId: 'user-1',
  monthlyNetSalary: 3200000,
  monthlyFixedCosts: 1450000,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const premiumTransactions: PremiumTransaction[] = [
  {
    id: 'premium-1',
    userId: 'user-1',
    planId: 'premium-monthly',
    status: 'active',
    billingCycle: 'monthly',
    priceUsd: 4.99,
    purchasedAt: '2026-04-17T00:00:00.000Z',
    expiresAt: '2026-05-17T00:00:00.000Z',
    createdAt: '2026-04-17T00:00:00.000Z',
    updatedAt: '2026-04-17T00:00:00.000Z',
  },
];

describe('createMyPageSummary', () => {
  it('summarizes account state with premium-enabled alerts', () => {
    const summary = createMyPageSummary({
      subscriptions,
      profile,
      notificationSettings: {
        ...createDefaultNotificationSettings('user-1'),
        fxVolatilityAlertsEnabled: true,
      },
      premiumTransactions,
    });

    expect(summary.activeSubscriptionCount).toBe(1);
    expect(summary.isPremium).toBe(true);
    expect(summary.premiumStatusLabel).toBe('Premium Monthly');
    expect(summary.fxAlertStatusLabel).toBe('FX alerts enabled');
  });

  it('keeps premium-only alerts locked for free users', () => {
    const summary = createMyPageSummary({
      subscriptions: [],
      profile: null,
      notificationSettings: createDefaultNotificationSettings('user-1'),
      premiumTransactions: [],
    });

    expect(summary.moneyPlanStatusLabel).toBe('Money Plan not set up');
    expect(summary.premiumStatusLabel).toBe('Free plan');
    expect(summary.fxAlertStatusLabel).toBe('FX alerts locked');
  });
});
