import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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
import { SubscriptionListItem } from '@/features/subscriptions/components/subscription-list-item';
import { SubscriptionOptionGroup } from '@/features/subscriptions/components/subscription-option-group';
import { useSubscriptionsQuery } from '@/features/subscriptions/hooks/use-subscriptions';
import {
  defaultSubscriptionFilters,
  filterSubscriptions,
  getNextUpcomingSubscription,
  getTrialEndingCount,
  hasActiveSubscriptionFilters,
  type SubscriptionBillingCycleFilter,
  type SubscriptionCategoryFilter,
  type SubscriptionCurrencyFilter,
  type SubscriptionFilters,
} from '@/features/subscriptions/utils/subscription-utils';
import { formatAppDate } from '@/lib/date';
import {
  subscriptionBillingCycles,
  subscriptionCategories,
  supportedCurrencies,
  type Subscription,
} from '@/types/domain';

const categoryFilterOptions = ['all', ...subscriptionCategories] as const;
const currencyFilterOptions = ['all', ...supportedCurrencies] as const;
const billingCycleFilterOptions = ['all', ...subscriptionBillingCycles] as const;

const categoryFilterLabels: Partial<Record<SubscriptionCategoryFilter, string>> = {
  all: 'All categories',
};

const currencyFilterLabels: Record<SubscriptionCurrencyFilter, string> = {
  all: 'All currencies',
  KRW: 'KRW',
  USD: 'USD',
};

const billingCycleFilterLabels: Record<SubscriptionBillingCycleFilter, string> = {
  all: 'All cycles',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const emptySubscriptions: Subscription[] = [];

export function SubscriptionListScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { data, isPending, isError, refetch, error } = useSubscriptionsQuery();
  const snapshotQuery = useLatestUsdKrwSnapshotQuery();
  const [filters, setFilters] = useState<SubscriptionFilters>(defaultSubscriptionFilters);
  const subscriptions = data?.data ?? emptySubscriptions;
  const filteredSubscriptions = useMemo(
    () => filterSubscriptions(subscriptions, filters),
    [filters, subscriptions]
  );
  const hasActiveFilters = hasActiveSubscriptionFilters(filters);
  const nextBilling = getNextUpcomingSubscription(filteredSubscriptions);
  const trialCount = getTrialEndingCount(filteredSubscriptions);
  const fxEstimates = getUsdSubscriptionEstimates(
    filteredSubscriptions,
    snapshotQuery.data?.data ?? null
  );
  const fxEstimateMap = useMemo(
    () => new Map(fxEstimates.map((estimate) => [estimate.subscriptionId, estimate])),
    [fxEstimates]
  );
  const sourceLabel =
    data?.source === 'preview'
      ? 'Running in preview mode. Connect Supabase tables to switch to live subscription storage.'
      : 'Connected to Supabase subscription data.';
  const resultCopy = hasActiveFilters
    ? `${filteredSubscriptions.length} of ${subscriptions.length} subscriptions match these filters.`
    : `${subscriptions.length} subscriptions are visible.`;

  const resetFilters = useCallback(() => {
    setFilters(defaultSubscriptionFilters);
  }, []);

  const updateFilter = useCallback(
    <TKey extends keyof SubscriptionFilters>(key: TKey, value: SubscriptionFilters[TKey]) => {
      setFilters((current) => ({
        ...current,
        [key]: value,
      }));
    },
    []
  );

  const renderSubscriptionItem = useCallback(
    ({ item }: { item: Subscription }) => (
      <View style={styles.listItem}>
        <SubscriptionListItem
          subscription={item}
          fxEstimate={fxEstimateMap.get(item.id)}
          onPress={() => router.push(`/subscriptions/${item.id}` as Href)}
        />
      </View>
    ),
    [fxEstimateMap, router]
  );

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
        data={filteredSubscriptions}
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
              <ThemedText type="bodySm" themeColor="textSecondary">
                {resultCopy}
              </ThemedText>
              <Button onPress={() => router.push('/subscriptions/create' as Href)}>
                Add subscription
              </Button>
            </ThemedView>

            <View style={styles.summaryGrid}>
              <SectionCard
                eyebrow="Active subscriptions"
                title={`${filteredSubscriptions.filter((subscription) => subscription.isActive).length}`}
                description="Visible subscriptions that are currently active and still charging."
              />
              <SectionCard
                eyebrow="Next billing"
                title={nextBilling ? nextBilling.serviceName : 'None'}
                description={
                  nextBilling
                    ? `${formatAppDate(nextBilling.nextBillingDate)} billing date`
                    : 'No upcoming billing date found in the current results.'
                }
              />
              <SectionCard
                eyebrow="Trial ending"
                title={`${trialCount}`}
                description="Visible subscriptions that still need free-trial attention."
              />
              <SectionCard
                eyebrow="FX estimate"
                title={`${fxEstimates.length} USD subscriptions`}
                description={
                  snapshotQuery.data?.data
                    ? `${snapshotQuery.data.data.sourceLabel} is used for visible KRW estimates.`
                    : 'USD subscriptions will show KRW estimates once an FX snapshot is available.'
                }
              />
            </View>

            <ThemedView type="surfaceElevated" style={styles.filterCard}>
              <View style={styles.filterHeader}>
                <View style={styles.filterCopy}>
                  <ThemedText type="eyebrow" themeColor="textSecondary">
                    Filters
                  </ThemedText>
                  <ThemedText type="heading">Narrow the list</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    Filter by the dimensions people use when reviewing recurring costs.
                  </ThemedText>
                </View>
                {hasActiveFilters ? (
                  <Button onPress={resetFilters} size="sm" variant="ghost">
                    Reset
                  </Button>
                ) : null}
              </View>

              <SubscriptionOptionGroup
                label="Category"
                value={filters.category}
                options={categoryFilterOptions}
                labels={categoryFilterLabels}
                onChange={(value) => updateFilter('category', value)}
              />
              <SubscriptionOptionGroup
                label="Currency"
                value={filters.currency}
                options={currencyFilterOptions}
                labels={currencyFilterLabels}
                onChange={(value) => updateFilter('currency', value)}
              />
              <SubscriptionOptionGroup
                label="Billing cycle"
                value={filters.billingCycle}
                options={billingCycleFilterOptions}
                labels={billingCycleFilterLabels}
                onChange={(value) => updateFilter('billingCycle', value)}
              />
            </ThemedView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyFilterContainer}>
            <SectionCard
              eyebrow="No matching subscriptions"
              tone="accent"
              title="Try another filter"
              description="Nothing in your current subscription list matches this category, currency, and billing cycle combination.">
              <View style={styles.emptyActions}>
                <Button onPress={resetFilters} variant="secondary">
                  Reset filters
                </Button>
                <Button onPress={() => router.push('/subscriptions/create' as Href)} variant="ghost">
                  Add subscription
                </Button>
              </View>
            </SectionCard>
          </View>
        }
        renderItem={renderSubscriptionItem}
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
  filterCard: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  filterCopy: {
    flex: 1,
    minWidth: 220,
    gap: Spacing.one,
  },
  listItem: {
    width: '100%',
    maxWidth: MaxContentWidth,
    marginBottom: Spacing.three,
  },
  emptyFilterContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  emptyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
