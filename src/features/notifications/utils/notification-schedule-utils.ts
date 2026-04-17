import { format, isAfter, parseISO, startOfDay, subDays } from 'date-fns';

import { hasPremiumAccess } from '@/features/premium/utils/premium-utils';
import type {
  NotificationScheduleItem,
  NotificationScheduleKind,
  NotificationSettings,
  PremiumTransaction,
  Subscription,
} from '@/types/domain';

type CreateNotificationSchedulePreviewInput = {
  settings: NotificationSettings;
  subscriptions: Subscription[];
  premiumTransactions: PremiumTransaction[];
  now?: Date;
};

function formatSourceDate(isoDate: string) {
  return format(parseISO(isoDate), 'yyyy.MM.dd');
}

function createScheduleItem(input: {
  id: string;
  kind: NotificationScheduleKind;
  subscription: Subscription;
  scheduledFor: Date;
  sourceDate: string;
  title: string;
  description: string;
  requiresPremium?: boolean;
}): NotificationScheduleItem {
  return {
    id: input.id,
    kind: input.kind,
    subscriptionId: input.subscription.id,
    serviceName: input.subscription.serviceName,
    title: input.title,
    description: input.description,
    scheduledFor: input.scheduledFor.toISOString(),
    sourceDate: input.sourceDate,
    requiresPremium: input.requiresPremium ?? false,
  };
}

function createReminderDate(sourceDate: string, reminderLeadDays: number) {
  return subDays(startOfDay(parseISO(sourceDate)), reminderLeadDays);
}

function isSchedulableDate(reminderDate: Date, now: Date) {
  return isAfter(reminderDate, subDays(startOfDay(now), 1));
}

function getBillingReminderItems(
  settings: NotificationSettings,
  subscriptions: Subscription[],
  now: Date
) {
  if (!settings.billingRemindersEnabled) {
    return [] satisfies NotificationScheduleItem[];
  }

  return subscriptions
    .filter((subscription) => subscription.isActive)
    .map((subscription) => {
      const reminderDate = createReminderDate(
        subscription.nextBillingDate,
        settings.reminderLeadDays
      );

      if (!isSchedulableDate(reminderDate, now)) {
        return null;
      }

      return createScheduleItem({
        id: `billing-${subscription.id}-${settings.reminderLeadDays}`,
        kind: 'billing_reminder',
        subscription,
        scheduledFor: reminderDate,
        sourceDate: subscription.nextBillingDate,
        title: `${subscription.serviceName} billing reminder`,
        description: `Remind ${settings.reminderLeadDays} day(s) before billing on ${formatSourceDate(subscription.nextBillingDate)}.`,
      });
    })
    .filter((item): item is NotificationScheduleItem => item !== null);
}

function getTrialEndingReminderItems(
  settings: NotificationSettings,
  subscriptions: Subscription[],
  now: Date
) {
  if (!settings.trialEndingRemindersEnabled) {
    return [] satisfies NotificationScheduleItem[];
  }

  return subscriptions
    .filter((subscription) => subscription.isActive && subscription.isTrial && Boolean(subscription.trialEndDate))
    .map((subscription) => {
      const trialEndDate = subscription.trialEndDate;

      if (!trialEndDate) {
        return null;
      }

      const reminderDate = createReminderDate(trialEndDate, settings.reminderLeadDays);

      if (!isSchedulableDate(reminderDate, now)) {
        return null;
      }

      return createScheduleItem({
        id: `trial-${subscription.id}-${settings.reminderLeadDays}`,
        kind: 'trial_ending_reminder',
        subscription,
        scheduledFor: reminderDate,
        sourceDate: trialEndDate,
        title: `${subscription.serviceName} trial ending reminder`,
        description: `Remind ${settings.reminderLeadDays} day(s) before trial end on ${formatSourceDate(trialEndDate)}.`,
      });
    })
    .filter((item): item is NotificationScheduleItem => item !== null);
}

function getFxBillingWatchItems(
  settings: NotificationSettings,
  subscriptions: Subscription[],
  premiumTransactions: PremiumTransaction[],
  now: Date
) {
  if (!settings.fxVolatilityAlertsEnabled || !hasPremiumAccess(premiumTransactions, now)) {
    return [] satisfies NotificationScheduleItem[];
  }

  return subscriptions
    .filter((subscription) => subscription.isActive && subscription.currency === 'USD')
    .map((subscription) => {
      const reminderDate = createReminderDate(
        subscription.nextBillingDate,
        settings.reminderLeadDays
      );

      if (!isSchedulableDate(reminderDate, now)) {
        return null;
      }

      return createScheduleItem({
        id: `fx-${subscription.id}-${settings.reminderLeadDays}`,
        kind: 'fx_billing_watch',
        subscription,
        scheduledFor: reminderDate,
        sourceDate: subscription.nextBillingDate,
        title: `${subscription.serviceName} FX watch reminder`,
        description: `Review the USD to KRW estimate before billing on ${formatSourceDate(subscription.nextBillingDate)}.`,
        requiresPremium: true,
      });
    })
    .filter((item): item is NotificationScheduleItem => item !== null);
}

export function formatNotificationScheduleKind(kind: NotificationScheduleKind) {
  if (kind === 'billing_reminder') {
    return 'Billing reminder';
  }

  if (kind === 'trial_ending_reminder') {
    return 'Trial ending reminder';
  }

  return 'FX billing watch';
}

export function createNotificationSchedulePreview({
  settings,
  subscriptions,
  premiumTransactions,
  now = new Date(),
}: CreateNotificationSchedulePreviewInput) {
  return [
    ...getBillingReminderItems(settings, subscriptions, now),
    ...getTrialEndingReminderItems(settings, subscriptions, now),
    ...getFxBillingWatchItems(settings, subscriptions, premiumTransactions, now),
  ].sort((left, right) => left.scheduledFor.localeCompare(right.scheduledFor));
}
