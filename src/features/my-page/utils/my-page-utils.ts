import { formatMoneyAmount } from '@/features/money-plan/utils/money-plan-utils';
import { formatPremiumStatusCopy, hasPremiumAccess } from '@/features/premium/utils/premium-utils';
import type {
  NotificationSettings,
  PremiumTransaction,
  Subscription,
  UserFinancialProfile,
} from '@/types/domain';

type CreateMyPageSummaryInput = {
  subscriptions: Subscription[];
  profile: UserFinancialProfile | null;
  notificationSettings: NotificationSettings;
  premiumTransactions: PremiumTransaction[];
};

export function createMyPageSummary({
  subscriptions,
  profile,
  notificationSettings,
  premiumTransactions,
}: CreateMyPageSummaryInput) {
  const activeSubscriptionCount = subscriptions.filter((subscription) => subscription.isActive).length;
  const isPremium = hasPremiumAccess(premiumTransactions);
  const enabledReminderCount = [
    notificationSettings.billingRemindersEnabled,
    notificationSettings.trialEndingRemindersEnabled,
    notificationSettings.marketingUpdatesEnabled,
    notificationSettings.fxVolatilityAlertsEnabled && isPremium,
  ].filter(Boolean).length;

  return {
    activeSubscriptionCount,
    moneyPlanStatusLabel: profile
      ? `${formatMoneyAmount(profile.monthlyNetSalary)} salary saved`
      : 'Money Plan not set up',
    premiumStatusLabel: formatPremiumStatusCopy(premiumTransactions),
    premiumCtaLabel: isPremium ? 'Manage premium' : 'Upgrade to Premium',
    reminderStatusLabel: `${enabledReminderCount} notification toggle(s) on`,
    fxAlertStatusLabel:
      notificationSettings.fxVolatilityAlertsEnabled && isPremium
        ? 'FX alerts enabled'
        : isPremium
          ? 'FX alerts available'
          : 'FX alerts locked',
    isPremium,
  };
}
