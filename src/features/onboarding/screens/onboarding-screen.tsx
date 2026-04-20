import { Redirect, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { useFinancialProfileQuery } from '@/features/money-plan/hooks/use-money-plan';
import {
  useFinishOnboardingMutation,
  useOnboardingStatusQuery,
} from '@/features/onboarding/hooks/use-onboarding';
import {
  createOnboardingSetupSteps,
  isOnboardingFinished,
  type OnboardingSetupStep,
} from '@/features/onboarding/utils/onboarding-utils';
import { useNotificationSettingsQuery } from '@/features/settings/hooks/use-notification-settings';
import { useSubscriptionsQuery } from '@/features/subscriptions/hooks/use-subscriptions';
import type { OnboardingCompletionKind } from '@/types/domain';

const defaultStepTargets: Record<OnboardingSetupStep['id'], Href> = {
  subscriptions: '/subscriptions' as Href,
  'money-plan': '/money-plan' as Href,
  notifications: '/my-page/notifications' as Href,
};

function getStepTarget(step: OnboardingSetupStep): Href {
  if (step.id === 'subscriptions' && step.status === 'ready') {
    return '/subscriptions/create' as Href;
  }

  return defaultStepTargets[step.id];
}

export function OnboardingScreen() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return (
      <CenteredState
        eyebrow="Onboarding"
        title="Checking your session"
        description="Paynesto is preparing your first setup path."
        isLoading
      />
    );
  }

  if (status !== 'authenticated' && status !== 'preview') {
    return <Redirect href={'/sign-in' as Href} />;
  }

  return <OnboardingContent />;
}

function OnboardingContent() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const onboardingQuery = useOnboardingStatusQuery();
  const subscriptionsQuery = useSubscriptionsQuery();
  const profileQuery = useFinancialProfileQuery();
  const notificationSettingsQuery = useNotificationSettingsQuery();
  const finishOnboardingMutation = useFinishOnboardingMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setupSteps = useMemo(() => {
    return createOnboardingSetupSteps({
      subscriptionCount: subscriptionsQuery.data?.data.length ?? 0,
      hasFinancialProfile: Boolean(profileQuery.data?.data),
      hasNotificationSettings: Boolean(notificationSettingsQuery.data?.data),
    });
  }, [
    notificationSettingsQuery.data?.data,
    profileQuery.data?.data,
    subscriptionsQuery.data?.data.length,
  ]);

  async function finishAndNavigate(kind: OnboardingCompletionKind, target: Href) {
    setSubmitError(null);

    try {
      await finishOnboardingMutation.mutateAsync({ kind });
      router.replace(target);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not update onboarding.');
    }
  }

  if (
    onboardingQuery.isPending ||
    subscriptionsQuery.isPending ||
    profileQuery.isPending ||
    notificationSettingsQuery.isPending
  ) {
    return (
      <CenteredState
        eyebrow="Onboarding"
        title="Building your setup path"
        description="We are checking subscriptions, Money Plan, and reminder settings."
        isLoading
      />
    );
  }

  if (
    onboardingQuery.isError ||
    subscriptionsQuery.isError ||
    profileQuery.isError ||
    notificationSettingsQuery.isError
  ) {
    const message =
      onboardingQuery.error instanceof Error
        ? onboardingQuery.error.message
        : subscriptionsQuery.error instanceof Error
          ? subscriptionsQuery.error.message
          : profileQuery.error instanceof Error
            ? profileQuery.error.message
            : notificationSettingsQuery.error instanceof Error
              ? notificationSettingsQuery.error.message
              : 'Please try again in a moment.';

    return (
      <CenteredState
        eyebrow="Onboarding"
        title="Could not load onboarding"
        description={message}
        actionLabel="Try again"
        onAction={() => {
          void Promise.all([
            onboardingQuery.refetch(),
            subscriptionsQuery.refetch(),
            profileQuery.refetch(),
            notificationSettingsQuery.refetch(),
          ]);
        }}
      />
    );
  }

  if (isOnboardingFinished(onboardingQuery.data.data)) {
    return <Redirect href={'/(app)' as Href} />;
  }

  return (
    <ThemedView style={styles.page}>
      <ScrollView
        contentInset={{
          top: safeAreaInsets.top,
          left: safeAreaInsets.left,
          right: safeAreaInsets.right,
          bottom: safeAreaInsets.bottom + Spacing.four,
        }}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedView type="surfaceElevated" style={styles.heroCard}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Welcome to Paynesto
            </ThemedText>
            <ThemedText type="title">Set up smarter subscription decisions</ThemedText>
            <ThemedText themeColor="textSecondary">
              Start with the three inputs Paynesto needs to turn recurring bills into realistic
              monthly guidance.
            </ThemedText>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Source: {onboardingQuery.data.source === 'preview' ? 'Preview mode' : 'Supabase sync'}
            </ThemedText>
          </ThemedView>

          <SectionCard
            eyebrow="First run"
            tone="accent"
            title="You can finish this now or come back later"
            description="Onboarding keeps the first setup path clear, but it never blocks access to the app."
          />

          <View style={styles.stepList}>
            {setupSteps.map((step, index) => (
              <SetupStepCard
                key={step.id}
                disabled={finishOnboardingMutation.isPending}
                index={index + 1}
                onPress={() => void finishAndNavigate('completed', getStepTarget(step))}
                step={step}
              />
            ))}
          </View>

          {submitError ? (
            <ThemedText type="bodySm" themeColor="danger">
              {submitError}
            </ThemedText>
          ) : null}

          <ThemedView type="surfaceElevated" style={styles.finishCard}>
            <View style={styles.finishCopy}>
              <ThemedText type="heading">Ready to explore?</ThemedText>
              <ThemedText themeColor="textSecondary">
                Mark onboarding complete and open the dashboard. You can still add or edit every
                setup item later.
              </ThemedText>
            </View>
            <View style={styles.buttonRow}>
              <Button
                disabled={finishOnboardingMutation.isPending}
                loading={finishOnboardingMutation.isPending}
                onPress={() => void finishAndNavigate('completed', '/(app)' as Href)}>
                Complete setup
              </Button>
              <Button
                disabled={finishOnboardingMutation.isPending}
                onPress={() => void finishAndNavigate('skipped', '/(app)' as Href)}
                variant="secondary">
                Skip for now
              </Button>
            </View>
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

type SetupStepCardProps = {
  disabled: boolean;
  index: number;
  onPress: () => void;
  step: OnboardingSetupStep;
};

function SetupStepCard({ disabled, index, onPress, step }: SetupStepCardProps) {
  return (
    <ThemedView type="surfaceElevated" style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <ThemedView type="surfaceAccent" style={styles.stepNumber}>
          <ThemedText type="smallBold">{index}</ThemedText>
        </ThemedView>
        <View style={styles.stepCopy}>
          <ThemedText type="heading">{step.title}</ThemedText>
          <ThemedText themeColor="textSecondary">{step.description}</ThemedText>
        </View>
      </View>
      <View style={styles.stepFooter}>
        <ThemedView
          type={step.status === 'complete' ? 'surfaceAccent' : 'backgroundElement'}
          style={styles.statusPill}>
          <ThemedText type="bodySm">
            {step.status === 'complete' ? 'Ready' : 'Recommended'}
          </ThemedText>
        </ThemedView>
        <Button disabled={disabled} onPress={onPress} size="sm" variant="secondary">
          {step.actionLabel}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  heroCard: {
    gap: Spacing.two,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  stepList: {
    gap: Spacing.three,
  },
  stepCard: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  stepNumber: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
  },
  stepCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  stepFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  statusPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  finishCard: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  finishCopy: {
    gap: Spacing.one,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
