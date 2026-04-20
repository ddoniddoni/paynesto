import { Redirect, type Href } from 'expo-router';

import { CenteredState } from '@/components/shared/centered-state';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { useOnboardingStatusQuery } from '@/features/onboarding/hooks/use-onboarding';
import { getOnboardingEntryTarget } from '@/features/onboarding/utils/onboarding-utils';

export default function IndexRoute() {
  const { status } = useAuthSession();
  const onboardingQuery = useOnboardingStatusQuery();

  if (status === 'loading') {
    return (
      <CenteredState
        eyebrow="Launch"
        title="Preparing Paynesto"
        description="We are checking your session and sending you to the right starting point."
        isLoading
      />
    );
  }

  if ((status === 'authenticated' || status === 'preview') && onboardingQuery.isPending) {
    return (
      <CenteredState
        eyebrow="Launch"
        title="Checking setup status"
        description="Paynesto is deciding whether to show onboarding or open your dashboard."
        isLoading
      />
    );
  }

  if ((status === 'authenticated' || status === 'preview') && onboardingQuery.isError) {
    const message =
      onboardingQuery.error instanceof Error
        ? onboardingQuery.error.message
        : 'Please try again in a moment.';

    return (
      <CenteredState
        eyebrow="Launch"
        title="Could not check onboarding"
        description={message}
        actionLabel="Try again"
        onAction={() => {
          void onboardingQuery.refetch();
        }}
      />
    );
  }

  const target = getOnboardingEntryTarget(status, onboardingQuery.data?.data ?? null);

  if (!target) {
    return (
      <CenteredState
        eyebrow="Launch"
        title="Preparing Paynesto"
        description="We are checking your app state."
        isLoading
      />
    );
  }

  return <Redirect href={target as Href} />;
}
