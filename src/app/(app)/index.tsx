import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { signOut } from '@/features/auth/services/auth-service';
import { useLatestUsdKrwSnapshotQuery } from '@/features/exchange-rate/hooks/use-exchange-rate';
import {
  formatEstimatedKrw,
  formatExchangeRate,
  getUsdSubscriptionEstimates,
} from '@/features/exchange-rate/utils/exchange-rate-utils';
import { useSubscriptionsQuery } from '@/features/subscriptions/hooks/use-subscriptions';
import {
  getNextUpcomingSubscription,
  getTrialEndingCount,
} from '@/features/subscriptions/utils/subscription-utils';
import { formatAppDate } from '@/lib/date';

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthSession();
  const subscriptionsQuery = useSubscriptionsQuery();
  const snapshotQuery = useLatestUsdKrwSnapshotQuery();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const subscriptions = subscriptionsQuery.data?.data ?? [];
  const nextBilling = getNextUpcomingSubscription(subscriptions);
  const usdEstimates = getUsdSubscriptionEstimates(subscriptions, snapshotQuery.data?.data ?? null);
  const totalUsdEstimate = usdEstimates.reduce(
    (sum, estimate) => sum + estimate.estimatedKrwAmount,
    0
  );
  const sourceLabel =
    subscriptionsQuery.data?.source === 'preview'
      ? 'Preview mode'
      : subscriptionsQuery.data?.source === 'supabase'
        ? 'Supabase sync'
        : 'Loading';

  async function handleSignOut() {
    setSignOutError(null);
    setIsSigningOut(true);

    const result = await signOut();

    if (!result.ok) {
      setSignOutError(result.errorMessage);
    }

    setIsSigningOut(false);
  }

  if (subscriptionsQuery.isPending) {
    return (
      <CenteredState
        eyebrow="Home"
        title="Preparing your dashboard"
        description="We are loading subscriptions, next billing details, and estimate cards."
        isLoading
      />
    );
  }

  if (subscriptionsQuery.isError) {
    return (
      <CenteredState
        eyebrow="Home"
        title="Could not load the dashboard"
        description={
          subscriptionsQuery.error instanceof Error
            ? subscriptionsQuery.error.message
            : 'Please try again in a moment.'
        }
        actionLabel="Try again"
        onAction={() => void subscriptionsQuery.refetch()}
      />
    );
  }

  return (
    <ThemedView style={styles.page}>
      <ScrollView
        contentInset={{
          top: safeAreaInsets.top,
          left: safeAreaInsets.left,
          right: safeAreaInsets.right,
          bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        }}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedView type="surfaceElevated" style={styles.heroSection}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Signed in
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              Paynesto
            </ThemedText>
            <ThemedText style={styles.lead} themeColor="textSecondary">
              {user?.email
                ? `${user.email} is connected. You can now manage subscriptions, review Money Plan guidance, and check foreign-currency estimates in one flow.`
                : 'Your signed-in session is ready.'}
            </ThemedText>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Current data source: {sourceLabel}
            </ThemedText>
            <View style={styles.heroActions}>
              <Button onPress={() => router.push('/subscriptions' as Href)}>Open subscriptions</Button>
              <Button
                variant="secondary"
                loading={isSigningOut}
                onPress={handleSignOut}
                style={styles.secondaryButton}>
                Sign out
              </Button>
            </View>
            {signOutError ? (
              <ThemedText type="bodySm" themeColor="danger">
                {signOutError}
              </ThemedText>
            ) : null}
          </ThemedView>

          <SectionCard
            eyebrow="Subscription summary"
            title={`${subscriptions.filter((subscription) => subscription.isActive).length} active subscriptions`}
            description="Core subscription status and upcoming billing overview.">
            <View style={styles.bulletList}>
              <ThemedText>
                - Next billing: {nextBilling ? `${nextBilling.serviceName} · ${formatAppDate(nextBilling.nextBillingDate)}` : 'None'}
              </ThemedText>
              <ThemedText>- Trial endings to review: {getTrialEndingCount(subscriptions)}</ThemedText>
              <ThemedText>
                - USD subscriptions: {subscriptions.filter((subscription) => subscription.currency === 'USD').length}
              </ThemedText>
            </View>
          </SectionCard>

          <SectionCard
            eyebrow="USD estimate"
            title={
              usdEstimates.length > 0
                ? formatEstimatedKrw(totalUsdEstimate)
                : 'No USD subscriptions yet'
            }
            description={
              snapshotQuery.data?.data
                ? `${formatExchangeRate(snapshotQuery.data.data.rate)} snapshot applied to ${usdEstimates.length} USD subscription(s).`
                : 'Connect an FX snapshot to see estimated KRW charges for USD subscriptions.'
            }>
            {snapshotQuery.isError ? (
              <ThemedText type="bodySm" themeColor="danger">
                {snapshotQuery.error instanceof Error
                  ? snapshotQuery.error.message
                  : 'Could not load the latest FX snapshot.'}
              </ThemedText>
            ) : snapshotQuery.data?.data ? (
              <ThemedText type="bodySm" themeColor="textSecondary">
                Snapshot time: {formatAppDate(snapshotQuery.data.data.fetchedAt, 'yyyy.MM.dd HH:mm')}
              </ThemedText>
            ) : null}
          </SectionCard>

          <SectionCard
            eyebrow="Suggested next work"
            title="Core flows are live"
            tone="accent"
            description="Subscriptions, Google auth, and Money Plan are in place. FX estimates are now layered onto USD subscriptions.">
            <Button variant="secondary" onPress={() => router.push('/subscriptions' as Href)}>
              Review subscriptions
            </Button>
          </SectionCard>

          <SectionCard
            eyebrow="Next billing"
            title={nextBilling ? nextBilling.serviceName : 'No scheduled payment'}
            description={
              nextBilling
                ? `${formatAppDate(nextBilling.nextBillingDate)} · ${nextBilling.currency} ${nextBilling.amount}`
                : 'Add a subscription to see the next billing card here.'
            }>
            <ThemedText type="bodySm" themeColor="textSecondary">
              {subscriptionsQuery.data?.source === 'preview'
                ? 'The dashboard is currently using preview subscription data.'
                : 'The dashboard is currently using Supabase subscription data.'}
            </ThemedText>
          </SectionCard>
        </View>
      </ScrollView>
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
    gap: 16,
  },
  heroSection: {
    gap: 12,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    maxWidth: 520,
  },
  lead: {
    maxWidth: 560,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  secondaryButton: {
    minWidth: 120,
  },
  bulletList: {
    gap: 8,
  },
});
