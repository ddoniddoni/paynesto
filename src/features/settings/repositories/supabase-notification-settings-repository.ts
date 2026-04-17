import { assertSupabaseConfigured } from '@/services/supabase';
import type { NotificationSettings, NotificationSettingsWriteInput } from '@/types/domain';

import { createDefaultNotificationSettings } from '@/features/settings/utils/notification-settings-utils';

import { previewNotificationSettingsRepository } from './preview-notification-settings-repository';
import type { NotificationSettingsRepository } from './notification-settings-repository';

type NotificationSettingsRecord = {
  id: string;
  user_id: string;
  billing_reminders_enabled: boolean;
  trial_ending_reminders_enabled: boolean;
  fx_volatility_alerts_enabled: boolean;
  marketing_updates_enabled: boolean;
  reminder_lead_days: number;
  created_at: string;
  updated_at: string;
};

function shouldFallbackToPreview(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('notification_settings') &&
    (normalized.includes('does not exist') ||
      normalized.includes('schema cache') ||
      normalized.includes('could not find the table'))
  );
}

function mapRecordToNotificationSettings(record: NotificationSettingsRecord): NotificationSettings {
  return {
    id: record.id,
    userId: record.user_id,
    billingRemindersEnabled: record.billing_reminders_enabled,
    trialEndingRemindersEnabled: record.trial_ending_reminders_enabled,
    fxVolatilityAlertsEnabled: record.fx_volatility_alerts_enabled,
    marketingUpdatesEnabled: record.marketing_updates_enabled,
    reminderLeadDays: record.reminder_lead_days as NotificationSettings['reminderLeadDays'],
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapInputToRecord(userId: string, input: NotificationSettingsWriteInput) {
  return {
    user_id: userId,
    billing_reminders_enabled: input.billingRemindersEnabled,
    trial_ending_reminders_enabled: input.trialEndingRemindersEnabled,
    fx_volatility_alerts_enabled: input.fxVolatilityAlertsEnabled,
    marketing_updates_enabled: input.marketingUpdatesEnabled,
    reminder_lead_days: input.reminderLeadDays,
  };
}

export const supabaseNotificationSettingsRepository: NotificationSettingsRepository = {
  async getSettings(userId) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (shouldFallbackToPreview(error.message)) {
        return previewNotificationSettingsRepository.getSettings(userId);
      }

      throw new Error(error.message);
    }

    return {
      data: data
        ? mapRecordToNotificationSettings(data as NotificationSettingsRecord)
        : createDefaultNotificationSettings(userId),
      source: 'supabase',
    };
  },

  async upsertSettings(userId, input) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('notification_settings')
      .upsert(mapInputToRecord(userId, input), { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      if (shouldFallbackToPreview(error.message)) {
        return previewNotificationSettingsRepository.upsertSettings(userId, input);
      }

      throw new Error(error.message);
    }

    return {
      data: mapRecordToNotificationSettings(data as NotificationSettingsRecord),
      source: 'supabase',
    };
  },
};
