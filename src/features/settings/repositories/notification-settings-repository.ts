import { hasSupabaseClientEnv } from '@/lib/env';
import type {
  NotificationSettings,
  NotificationSettingsDataSource,
  NotificationSettingsWriteInput,
} from '@/types/domain';

import { previewNotificationSettingsRepository } from './preview-notification-settings-repository';
import { supabaseNotificationSettingsRepository } from './supabase-notification-settings-repository';

export type NotificationSettingsRepositoryResult<T> = {
  data: T;
  source: NotificationSettingsDataSource;
};

export type NotificationSettingsRepository = {
  getSettings: (
    userId: string
  ) => Promise<NotificationSettingsRepositoryResult<NotificationSettings>>;
  upsertSettings: (
    userId: string,
    input: NotificationSettingsWriteInput
  ) => Promise<NotificationSettingsRepositoryResult<NotificationSettings>>;
};

export function getNotificationSettingsRepository(): NotificationSettingsRepository {
  return hasSupabaseClientEnv
    ? supabaseNotificationSettingsRepository
    : previewNotificationSettingsRepository;
}
