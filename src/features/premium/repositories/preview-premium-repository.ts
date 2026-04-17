import type { PremiumTransaction } from '@/types/domain';

import { createPremiumExpiryDate } from '@/features/premium/utils/premium-utils';

import type { PremiumRepository } from './premium-repository';

const previewDb = new Map<string, PremiumTransaction[]>();

function normalizeUserId(userId: string) {
  return userId || 'preview-user';
}

function createPreviewId() {
  return `premium-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const previewPremiumRepository: PremiumRepository = {
  async listTransactions(userId) {
    const normalizedUserId = normalizeUserId(userId);

    return {
      data: previewDb.get(normalizedUserId) ?? [],
      source: 'preview',
    };
  },

  async activatePlan(userId, input) {
    const normalizedUserId = normalizeUserId(userId);
    const current = previewDb.get(normalizedUserId) ?? [];
    const timestamp = new Date().toISOString();

    const nextTransaction: PremiumTransaction = {
      id: createPreviewId(),
      userId: normalizedUserId,
      planId: input.planId,
      status: 'active',
      billingCycle: input.billingCycle,
      priceUsd: input.priceUsd,
      purchasedAt: timestamp,
      expiresAt: createPremiumExpiryDate(timestamp, input.billingCycle),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    previewDb.set(
      normalizedUserId,
      current
        .map((transaction) =>
          transaction.status === 'active'
            ? {
                ...transaction,
                status: 'canceled' as const,
                updatedAt: timestamp,
              }
            : transaction
        )
        .concat(nextTransaction)
    );

    return {
      data: nextTransaction,
      source: 'preview',
    };
  },
};
