import type {
  NotificationLeadDays,
  NotificationSettings,
  NotificationSettingsWriteInput,
} from '@/types/domain';
import { getNormalizedPreviewUserId } from '@/features/auth/utils/preview-user';

export const reminderLeadDayLabels: Record<NotificationLeadDays, string> = {
  1: '1 day',
  3: '3 days',
  7: '7 days',
};

export function createDefaultNotificationSettings(userId: string): NotificationSettings {
  const timestamp = new Date().toISOString();
  const normalizedUserId = getNormalizedPreviewUserId(userId);

  return {
    id: `notification-settings-${normalizedUserId}`,
    userId: normalizedUserId,
    billingRemindersEnabled: true,
    trialEndingRemindersEnabled: true,
    fxVolatilityAlertsEnabled: false,
    marketingUpdatesEnabled: false,
    reminderLeadDays: 3,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createNotificationSettingsWriteInput(
  input?: Partial<NotificationSettingsWriteInput>
): NotificationSettingsWriteInput {
  return {
    billingRemindersEnabled: input?.billingRemindersEnabled ?? true,
    trialEndingRemindersEnabled: input?.trialEndingRemindersEnabled ?? true,
    fxVolatilityAlertsEnabled: input?.fxVolatilityAlertsEnabled ?? false,
    marketingUpdatesEnabled: input?.marketingUpdatesEnabled ?? false,
    reminderLeadDays: input?.reminderLeadDays ?? 3,
  };
}

export function getFxAlertGateCopy(isPremium: boolean) {
  return isPremium
    ? 'Premium is active, so USD volatility alerts can be enabled.'
    : 'FX volatility alerts are reserved for Premium because they depend on live FX monitoring.';
}
