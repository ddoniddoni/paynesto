import { describe, expect, it } from 'vitest';

import {
  createNotificationSchedulePreview,
  formatNotificationScheduleKind,
} from '@/features/notifications/utils/notification-schedule-utils';
import { createDefaultNotificationSettings } from '@/features/settings/utils/notification-settings-utils';
import type { PremiumTransaction, Subscription } from '@/types/domain';

const baseSubscription: Subscription = {
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
};

const premiumTransactions: PremiumTransaction[] = [
  {
    id: 'premium-1',
    userId: 'user-1',
    planId: 'premium-monthly',
    status: 'active',
    billingCycle: 'monthly',
    priceUsd: 4.99,
    purchasedAt: '2026-04-10T00:00:00.000Z',
    expiresAt: '2026-05-10T00:00:00.000Z',
    createdAt: '2026-04-10T00:00:00.000Z',
    updatedAt: '2026-04-10T00:00:00.000Z',
  },
];

describe('notification schedule utils', () => {
  it('builds billing and trial reminder candidates from active subscriptions', () => {
    const items = createNotificationSchedulePreview({
      settings: createDefaultNotificationSettings('user-1'),
      subscriptions: [
        baseSubscription,
        {
          ...baseSubscription,
          id: 'sub-2',
          serviceName: 'Apple TV+',
          isTrial: true,
          trialEndDate: '2026-04-19',
          nextBillingDate: '2026-04-19',
        },
      ],
      premiumTransactions: [],
      now: new Date('2026-04-15T00:00:00.000Z'),
    });

    expect(items.map((item) => item.kind)).toEqual([
      'billing_reminder',
      'trial_ending_reminder',
      'billing_reminder',
    ]);
    expect(items[0]?.serviceName).toBe('Apple TV+');
  });

  it('does not generate reminders for passed or inactive subscriptions', () => {
    const items = createNotificationSchedulePreview({
      settings: createDefaultNotificationSettings('user-1'),
      subscriptions: [
        {
          ...baseSubscription,
          id: 'sub-old',
          nextBillingDate: '2026-04-14',
        },
        {
          ...baseSubscription,
          id: 'sub-inactive',
          isActive: false,
          nextBillingDate: '2026-04-25',
        },
      ],
      premiumTransactions: [],
      now: new Date('2026-04-15T00:00:00.000Z'),
    });

    expect(items).toEqual([]);
  });

  it('gates FX billing watch candidates behind premium access', () => {
    const freeItems = createNotificationSchedulePreview({
      settings: {
        ...createDefaultNotificationSettings('user-1'),
        fxVolatilityAlertsEnabled: true,
      },
      subscriptions: [
        {
          ...baseSubscription,
          id: 'sub-usd',
          serviceName: 'ChatGPT Plus',
          currency: 'USD',
        },
      ],
      premiumTransactions: [],
      now: new Date('2026-04-15T00:00:00.000Z'),
    });

    const premiumItems = createNotificationSchedulePreview({
      settings: {
        ...createDefaultNotificationSettings('user-1'),
        fxVolatilityAlertsEnabled: true,
      },
      subscriptions: [
        {
          ...baseSubscription,
          id: 'sub-usd',
          serviceName: 'ChatGPT Plus',
          currency: 'USD',
        },
      ],
      premiumTransactions,
      now: new Date('2026-04-15T00:00:00.000Z'),
    });

    expect(freeItems.map((item) => item.kind)).not.toContain('fx_billing_watch');
    expect(premiumItems.map((item) => item.kind)).toContain('fx_billing_watch');
  });

  it('formats schedule kind labels for preview UI', () => {
    expect(formatNotificationScheduleKind('billing_reminder')).toBe('Billing reminder');
    expect(formatNotificationScheduleKind('trial_ending_reminder')).toBe('Trial ending reminder');
    expect(formatNotificationScheduleKind('fx_billing_watch')).toBe('FX billing watch');
  });
});
