import { useRouter, type Href } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useLatestUsdKrwSnapshotQuery } from '@/features/exchange-rate/hooks/use-exchange-rate';
import { getUsdSubscriptionEstimates } from '@/features/exchange-rate/utils/exchange-rate-utils';
import { useSubscriptionsQuery } from '@/features/subscriptions/hooks/use-subscriptions';
import {
  getNextUpcomingSubscription,
  getTrialEndingCount,
} from '@/features/subscriptions/utils/subscription-utils';
import { formatAppDate } from '@/lib/date';

import { SubscriptionListItem } from '../components/subscription-list-item';

export function SubscriptionListScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { data, isPending, isError, refetch, error } = useSubscriptionsQuery();
  const snapshotQuery = useLatestUsdKrwSnapshotQuery();
  const subscriptions = data?.data ?? [];
  const nextBilling = getNextUpcomingSubscription(subscriptions);
  const trialCount = getTrialEndingCount(subscriptions);
  const fxEstimates = getUsdSubscriptionEstimates(subscriptions, snapshotQuery.data?.data ?? null);
  const fxEstimateMap = new Map(fxEstimates.map((estimate) => [estimate.subscriptionId, estimate]));
  const sourceLabel =
    data?.source === 'preview'
      ? 'Running in preview mode. Connect Supabase tables to switch to live subscription storage.'
      : 'Connected to Supabase subscription data.';

  if (isPending) {
    return (
      <CenteredState
        eyebrow="Subscriptions"
        title="Loading subscriptions"
        description="We are preparing your active subscriptions and upcoming payments."
        isLoading
      />
    );
  }

  if (isError) {
    return (
      <CenteredState
        eyebrow="Subscriptions"
        title="Could not load subscriptions"
        description={error instanceof Error ? error.message : 'Please try again in a moment.'}
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  if (subscriptions.length === 0) {
    return (
      <CenteredState
        eyebrow="Subscriptions"
        title="No subscriptions yet"
        description="Add your first subscription to start tracking payment dates, trials, and budget impact."
        actionLabel="Add subscription"
        onAction={() => router.push('/subscriptions/create' as Href)}
      />
    );
  }

  return (
    <ThemedView style={styles.page}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        contentInset={{
          top: safeAreaInsets.top,
          left: safeAreaInsets.left,
          right: safeAreaInsets.right,
          bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        }}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <View style={styles.container}>
            <ThemedView type="surfaceElevated" style={styles.heroCard}>
              <ThemedText type="eyebrow" themeColor="textSecondary">
                Subscription hub
              </ThemedText>
              <ThemedText type="title" style={styles.heroTitle}>
                Subscriptions
              </ThemedText>
              <ThemedText themeColor="textSecondary">{sourceLabel}</ThemedText>
              <Button onPress={() => router.push('/subscriptions/create' as Href)}>
                Add subscription
              </Button>
            </ThemedView>

            <View style={styles.summaryGrid}>
              <SectionCard
                eyebrow="Active subscriptions"
                title={`${subscriptions.filter((subscription) => subscription.isActive).length}`}
                description="Subscriptions that are currently active and still charging."
              />
              <SectionCard
                eyebrow="Next billing"
                title={nextBilling ? nextBilling.serviceName : 'None'}
                description={
                  nextBilling
                    ? `${formatAppDate(nextBilling.nextBillingDate)} billing date`
                    : 'No upcoming billing date found.'
                }
              />
              <SectionCard
                eyebrow="Trial ending"
                title={`${trialCount}`}
                description="Subscriptions that still need free-trial attention."
              />
              <SectionCard
                eyebrow="FX estimate"
                title={`${fxEstimates.length} USD subscriptions`}
                description={
                  snapshotQuery.data?.data
                    ? `${snapshotQuery.data.data.sourceLabel} 기준으로 KRW estimates are shown.`
                    : 'USD subscriptions will show KRW estimates once an FX snapshot is available.'
                }
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <SubscriptionListItem
              subscription={item}
              fxEstimate={fxEstimateMap.get(item.id)}
              onPress={() => router.push(`/subscriptions/${item.id}` as Href)}
            />
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  heroCard: {
    gap: Spacing.two,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  heroTitle: {
    maxWidth: 520,
  },
  summaryGrid: {
    gap: Spacing.three,
  },
  listItem: {
    width: '100%',
    maxWidth: MaxContentWidth,
    marginBottom: Spacing.three,
  },
});
