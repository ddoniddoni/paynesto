import type { NotificationSettings } from '@/types/domain';
import { getNormalizedPreviewUserId } from '@/features/auth/utils/preview-user';

import { createDefaultNotificationSettings } from '@/features/settings/utils/notification-settings-utils';

import type { NotificationSettingsRepository } from './notification-settings-repository';

const previewDb = new Map<string, NotificationSettings>();

function normalizeUserId(userId: string) {
  return getNormalizedPreviewUserId(userId);
}

export const previewNotificationSettingsRepository: NotificationSettingsRepository = {
  async getSettings(userId) {
    const normalizedUserId = normalizeUserId(userId);
    const current = previewDb.get(normalizedUserId) ?? createDefaultNotificationSettings(normalizedUserId);

    previewDb.set(normalizedUserId, current);

    return {
      data: current,
      source: 'preview',
    };
  },

  async upsertSettings(userId, input) {
    const normalizedUserId = normalizeUserId(userId);
    const current = previewDb.get(normalizedUserId) ?? createDefaultNotificationSettings(normalizedUserId);
    const nextSettings: NotificationSettings = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    previewDb.set(normalizedUserId, nextSettings);

    return {
      data: nextSettings,
      source: 'preview',
    };
  },
};
