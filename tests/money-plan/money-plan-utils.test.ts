import { describe, expect, it } from 'vitest';

import { createBudgetReport } from '../../src/features/money-plan/utils/money-plan-utils';
import type { Subscription, UserFinancialProfile } from '../../src/types/domain';

const baseProfile: UserFinancialProfile = {
  id: 'profile-1',
  userId: 'user-1',
  monthlyNetSalary: 3000000,
  monthlyFixedCosts: 1200000,
  createdAt: '2026-04-17T00:00:00.000Z',
  updatedAt: '2026-04-17T00:00:00.000Z',
};

const subscriptions: Subscription[] = [
  {
    id: 'sub-krw-monthly',
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
    id: 'sub-krw-yearly',
    userId: 'user-1',
    serviceName: 'Cloud Backup',
    category: 'Cloud',
    billingCycle: 'yearly',
    amount: 120000,
    currency: 'KRW',
    paymentMethodType: 'card',
    nextBillingDate: '2026-08-01',
    isTrial: false,
    usageFrequency: 'medium',
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
    nextBillingDate: '2026-04-22',
    isTrial: false,
    usageFrequency: 'high',
    isActive: true,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
];

describe('createBudgetReport', () => {
  it('builds a monthly report from salary, fixed costs, and normalized KRW subscriptions', () => {
    const report = createBudgetReport(baseProfile, subscriptions);

    expect(report.monthlySubscriptionTotal).toBe(27000);
    expect(report.monthlyCommittedCosts).toBe(1227000);
    expect(report.disposableIncome).toBe(1773000);
    expect(report.fixedCostStatus).toBe('caution');
    expect(report.subscriptionStatus).toBe('healthy');
    expect(report.foreignCurrencySubscriptionCount).toBe(1);
  });

  it('warns when fixed costs and subscriptions take too much salary share', () => {
    const report = createBudgetReport(
      {
        ...baseProfile,
        monthlyNetSalary: 2000000,
        monthlyFixedCosts: 1200000,
      },
      [
        {
          ...subscriptions[0],
          amount: 130000,
        },
      ]
    );

    expect(report.fixedCostStatus).toBe('warning');
    expect(report.subscriptionStatus).toBe('warning');
    expect(report.guidance.some((item) => item.includes('above 50%'))).toBe(true);
    expect(report.guidance.some((item) => item.includes('above 5%'))).toBe(true);
  });
});
