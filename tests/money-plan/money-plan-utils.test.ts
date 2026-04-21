import { describe, expect, it } from 'vitest';

import {
  createBudgetReport,
  createSubscriptionReviewCandidates,
} from '../../src/features/money-plan/utils/money-plan-utils';
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
    const report = createBudgetReport(baseProfile, subscriptions, {
      referenceDate: new Date('2026-04-17T00:00:00.000Z'),
    });

    expect(report.monthlySubscriptionTotal).toBe(27000);
    expect(report.monthlyCommittedCosts).toBe(1227000);
    expect(report.disposableIncome).toBe(1773000);
    expect(report.committedCostRatio).toBe(0.409);
    expect(report.fixedCostStatus).toBe('caution');
    expect(report.subscriptionStatus).toBe('healthy');
    expect(report.foreignCurrencySubscriptionCount).toBe(1);
    expect(report.actionCards).toHaveLength(3);
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
      ],
      {
        referenceDate: new Date('2026-04-17T00:00:00.000Z'),
      }
    );

    expect(report.fixedCostStatus).toBe('warning');
    expect(report.subscriptionStatus).toBe('warning');
    expect(report.actionCards[0].priority).toBe('high');
    expect(report.actionCards.some((card) => card.id === 'fixed_costs')).toBe(true);
    expect(report.guidance.some((item) => item.includes('above 50%'))).toBe(true);
    expect(report.guidance.some((item) => item.includes('above 5%'))).toBe(true);
  });

  it('adds structured guidance for cash flow pressure', () => {
    const report = createBudgetReport(
      {
        ...baseProfile,
        monthlyNetSalary: 2000000,
        monthlyFixedCosts: 1700000,
      },
      [
        {
          ...subscriptions[0],
          amount: 150000,
        },
      ],
      {
        referenceDate: new Date('2026-04-17T00:00:00.000Z'),
      }
    );

    expect(report.actionCards[0]).toMatchObject({
      id: 'fixed_costs',
      priority: 'high',
    });
    expect(report.actionCards.some((card) => card.id === 'cash_flow')).toBe(true);
    expect(report.actionCards.find((card) => card.id === 'cash_flow')?.priority).toBe('high');
  });
});

describe('createSubscriptionReviewCandidates', () => {
  it('ranks low-usage, trial, and soon-billing subscriptions first', () => {
    const candidates = createSubscriptionReviewCandidates(
      [
        {
          ...subscriptions[0],
          id: 'low-usage-soon',
          serviceName: 'Low Usage Soon',
          usageFrequency: 'low',
          nextBillingDate: '2026-04-18',
        },
        {
          ...subscriptions[1],
          id: 'trial-service',
          serviceName: 'Trial Service',
          isTrial: true,
          usageFrequency: 'medium',
          nextBillingDate: '2026-04-30',
        },
        {
          ...subscriptions[2],
          id: 'high-usage-later',
          serviceName: 'High Usage Later',
          usageFrequency: 'high',
          nextBillingDate: '2026-05-30',
        },
      ],
      {
        referenceDate: new Date('2026-04-17T00:00:00.000Z'),
      }
    );

    expect(candidates.map((candidate) => candidate.subscriptionId)).toEqual([
      'low-usage-soon',
      'trial-service',
    ]);
    expect(candidates[0].reasons).toContain('Low usage');
    expect(candidates[0].reasons).toContain('Billing soon');
  });

  it('excludes inactive subscriptions and caps the review queue', () => {
    const candidates = createSubscriptionReviewCandidates(
      [
        {
          ...subscriptions[0],
          id: 'inactive-low',
          isActive: false,
          usageFrequency: 'low',
          nextBillingDate: '2026-04-18',
        },
        {
          ...subscriptions[0],
          id: 'ott-one',
          serviceName: 'OTT One',
          usageFrequency: 'low',
          nextBillingDate: '2026-04-18',
        },
        {
          ...subscriptions[0],
          id: 'ott-two',
          serviceName: 'OTT Two',
          usageFrequency: 'low',
          nextBillingDate: '2026-04-19',
        },
        {
          ...subscriptions[0],
          id: 'ott-three',
          serviceName: 'OTT Three',
          usageFrequency: 'low',
          nextBillingDate: '2026-04-20',
        },
        {
          ...subscriptions[0],
          id: 'ott-four',
          serviceName: 'OTT Four',
          usageFrequency: 'low',
          nextBillingDate: '2026-04-21',
        },
      ],
      {
        referenceDate: new Date('2026-04-17T00:00:00.000Z'),
      }
    );

    expect(candidates).toHaveLength(3);
    expect(candidates.some((candidate) => candidate.subscriptionId === 'inactive-low')).toBe(false);
    expect(candidates[0].reasons).toContain('Duplicate category');
  });
});
