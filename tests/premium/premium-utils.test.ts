import { describe, expect, it } from 'vitest';

import {
  canUseFxAlertNotifications,
  createPremiumExpiryDate,
  getActivePremiumTransaction,
  hasPremiumAccess,
} from '@/features/premium/utils/premium-utils';
import type { PremiumTransaction } from '@/types/domain';

const activeMonthlyTransaction: PremiumTransaction = {
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
};

describe('premium-utils', () => {
  it('creates an expiry date from the billing cycle', () => {
    expect(createPremiumExpiryDate('2026-04-17T00:00:00.000Z', 'monthly')).toBe(
      '2026-05-17T00:00:00.000Z'
    );
    expect(createPremiumExpiryDate('2026-04-17T00:00:00.000Z', 'yearly')).toBe(
      '2027-04-17T00:00:00.000Z'
    );
  });

  it('returns the active premium transaction when access is still valid', () => {
    const result = getActivePremiumTransaction([activeMonthlyTransaction], new Date('2026-04-20T00:00:00.000Z'));

    expect(result?.id).toBe('premium-1');
    expect(hasPremiumAccess([activeMonthlyTransaction], new Date('2026-04-20T00:00:00.000Z'))).toBe(
      true
    );
    expect(
      canUseFxAlertNotifications([activeMonthlyTransaction], new Date('2026-04-20T00:00:00.000Z'))
    ).toBe(true);
  });

  it('blocks premium-only alerts after access expires', () => {
    expect(
      getActivePremiumTransaction([activeMonthlyTransaction], new Date('2026-05-20T00:00:00.000Z'))
    ).toBeNull();
    expect(hasPremiumAccess([activeMonthlyTransaction], new Date('2026-05-20T00:00:00.000Z'))).toBe(
      false
    );
    expect(
      canUseFxAlertNotifications([activeMonthlyTransaction], new Date('2026-05-20T00:00:00.000Z'))
    ).toBe(false);
  });
});
