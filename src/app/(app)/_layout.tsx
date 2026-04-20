import { Redirect, type Href } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { CenteredState } from '@/components/shared/centered-state';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { useOnboardingStatusQuery } from '@/features/onboarding/hooks/use-onboarding';
import { isOnboardingFinished } from '@/features/onboarding/utils/onboarding-utils';

export default function AppLayout() {
  const { status } = useAuthSession();
  const onboardingQuery = useOnboardingStatusQuery();

  if (status === 'loading') {
    return (
      <CenteredState
        eyebrow="Auth"
        title="Checking your session"
        description="We are loading your saved sign-in state before opening the app."
        isLoading
      />
    );
  }

  if (status !== 'authenticated' && status !== 'preview') {
    return <Redirect href={'/sign-in' as Href} />;
  }

  if (onboardingQuery.isPending) {
    return (
      <CenteredState
        eyebrow="Onboarding"
        title="Checking setup status"
        description="Paynesto is checking whether this account has completed onboarding."
        isLoading
      />
    );
  }

  if (onboardingQuery.isError) {
    const message =
      onboardingQuery.error instanceof Error
        ? onboardingQuery.error.message
        : 'Please try again in a moment.';

    return (
      <CenteredState
        eyebrow="Onboarding"
        title="Could not load setup status"
        description={message}
        actionLabel="Try again"
        onAction={() => {
          void onboardingQuery.refetch();
        }}
      />
    );
  }

  if (!isOnboardingFinished(onboardingQuery.data.data)) {
    return <Redirect href={'/onboarding' as Href} />;
  }

  return <AppTabs />;
}
