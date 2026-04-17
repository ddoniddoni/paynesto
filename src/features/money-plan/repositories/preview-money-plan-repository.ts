import type { UserFinancialProfile } from '@/types/domain';
import { getNormalizedPreviewUserId } from '@/features/auth/utils/preview-user';

import type { MoneyPlanRepository } from './money-plan-repository';

const previewDb = new Map<string, UserFinancialProfile>();

function getUserIdOrPreview(userId: string) {
  return getNormalizedPreviewUserId(userId);
}

function createPreviewId() {
  return `preview-profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const previewMoneyPlanRepository: MoneyPlanRepository = {
  async getProfile(userId) {
    const normalizedUserId = getUserIdOrPreview(userId);

    return {
      data: previewDb.get(normalizedUserId) ?? null,
      source: 'preview',
    };
  },

  async upsertProfile(userId, input) {
    const normalizedUserId = getUserIdOrPreview(userId);
    const current = previewDb.get(normalizedUserId);
    const timestamp = new Date().toISOString();
    const profile: UserFinancialProfile = current
      ? {
          ...current,
          ...input,
          updatedAt: timestamp,
        }
      : {
          id: createPreviewId(),
          userId: normalizedUserId,
          ...input,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

    previewDb.set(normalizedUserId, profile);

    return {
      data: profile,
      source: 'preview',
    };
  },
};
