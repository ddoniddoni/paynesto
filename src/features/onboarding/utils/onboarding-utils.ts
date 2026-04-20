import type { AuthSessionStatus } from '@/features/auth/types/auth';
import type { OnboardingStatus } from '@/types/domain';

export type OnboardingEntryTarget = '/(app)' | '/onboarding' | '/sign-in' | null;

export type OnboardingSetupStepStatus = 'complete' | 'ready';

export type OnboardingSetupStep = {
  id: 'subscriptions' | 'money-plan' | 'notifications';
  title: string;
  description: string;
  actionLabel: string;
  status: OnboardingSetupStepStatus;
};

export type OnboardingSetupSummaryInput = {
  subscriptionCount: number;
  hasFinancialProfile: boolean;
  hasNotificationSettings: boolean;
};

export function isOnboardingFinished(status?: OnboardingStatus | null) {
  return Boolean(status?.completedAt || status?.skippedAt);
}

export function getOnboardingEntryTarget(
  authStatus: AuthSessionStatus,
  onboardingStatus?: OnboardingStatus | null
): OnboardingEntryTarget {
  if (authStatus === 'loading') {
    return null;
  }

  if (authStatus === 'authenticated' || authStatus === 'preview') {
    return isOnboardingFinished(onboardingStatus) ? '/(app)' : '/onboarding';
  }

  return '/sign-in';
}

export function createOnboardingSetupSteps({
  subscriptionCount,
  hasFinancialProfile,
  hasNotificationSettings,
}: OnboardingSetupSummaryInput): OnboardingSetupStep[] {
  return [
    {
      id: 'subscriptions',
      title: subscriptionCount > 0 ? 'Subscription list started' : 'Add your first subscriptions',
      description:
        subscriptionCount > 0
          ? `${subscriptionCount} subscription${subscriptionCount === 1 ? '' : 's'} are ready for monthly cost checks.`
          : 'Start with recurring services like Netflix, ChatGPT, YouTube, cloud storage, or mobile plans.',
      actionLabel: subscriptionCount > 0 ? 'Review subscriptions' : 'Add subscription',
      status: subscriptionCount > 0 ? 'complete' : 'ready',
    },
    {
      id: 'money-plan',
      title: hasFinancialProfile ? 'Money Plan is ready' : 'Enter salary and fixed costs',
      description: hasFinancialProfile
        ? 'Your take-home pay and fixed costs can power budget recommendations.'
        : 'Paynesto needs salary and fixed costs to judge whether subscriptions fit your month.',
      actionLabel: 'Open Money Plan',
      status: hasFinancialProfile ? 'complete' : 'ready',
    },
    {
      id: 'notifications',
      title: hasNotificationSettings ? 'Reminder settings are available' : 'Review reminder preferences',
      description: hasNotificationSettings
        ? 'Billing, trial-ending, and premium FX reminder settings can be adjusted anytime.'
        : 'Choose how early Paynesto should nudge you before subscription events.',
      actionLabel: 'Review reminders',
      status: hasNotificationSettings ? 'complete' : 'ready',
    },
  ];
}
