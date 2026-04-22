import { useRouter, type Href } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useLatestUsdKrwSnapshotQuery } from '@/features/exchange-rate/hooks/use-exchange-rate';
import {
  createSubscriptionFxEstimate,
  formatEstimatedKrw,
  formatExchangeRate,
  formatVolatilityDirection,
} from '@/features/exchange-rate/utils/exchange-rate-utils';
import {
  useDeleteSubscriptionMutation,
  useSubscriptionQuery,
  useSubscriptionsQuery,
} from '@/features/subscriptions/hooks/use-subscriptions';
import {
  formatMonthlyEquivalent,
  formatSubscriptionAmount,
  formatTrialManagementStatus,
  getCancellationScore,
  getDaysUntilDate,
  getDuplicateCategoryCount,
  getMonthlyNormalizedAmount,
  getSubscriptionStatus,
  getTrialManagementSummary,
} from '@/features/subscriptions/utils/subscription-utils';
import { formatAppDate } from '@/lib/date';

import { SubscriptionStatusBadge } from '../components/subscription-status-badge';

export function SubscriptionDetailScreen({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const detailQuery = useSubscriptionQuery(subscriptionId);
  const listQuery = useSubscriptionsQuery();
  const snapshotQuery = useLatestUsdKrwSnapshotQuery();
  const deleteMutation = useDeleteSubscriptionMutation(subscriptionId);
  const subscription = detailQuery.data?.data;
  const monthlyEquivalent = subscription
    ? getMonthlyNormalizedAmount(subscription.amount, subscription.billingCycle)
    : 0;
  const cancellationScore =
    subscription && listQuery.data
      ? getCancellationScore({
          usageFrequency: subscription.usageFrequency,
          isTrial: subscription.isTrial,
          daysUntilBilling: getDaysUntilDate(subscription.nextBillingDate),
          duplicateCategoryCount: getDuplicateCategoryCount(
            listQuery.data.data,
            subscription.category
          ),
        })
      : 0;
  const fxEstimate =
    subscription && snapshotQuery.data?.data
      ? createSubscriptionFxEstimate(subscription, snapshotQuery.data.data)
      : null;
  const trialSummary = subscription ? getTrialManagementSummary(subscription) : null;

  function handleDelete() {
    Alert.alert(
      'Delete subscription',
      'This removes the subscription from your list and from future billing/trial tracking.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteMutation.mutateAsync();
            Alert.alert(
              'Deleted',
              result.source === 'preview'
                ? 'The subscription was removed from preview data.'
                : 'The subscription was removed.'
            );
            router.replace('/subscriptions' as Href);
          },
        },
      ]
    );
  }

  if (detailQuery.isPending) {
    return (
      <CenteredState
        eyebrow="Subscription detail"
        title="Loading subscription detail"
        description="We are preparing billing data, status, and recommendation context."
        isLoading
      />
    );
  }

  if (detailQuery.isError) {
    return (
      <CenteredState
        eyebrow="Subscription detail"
        title="Could not load this subscription"
        description={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : 'Please try again in a moment.'
        }
        actionLabel="Back to list"
        onAction={() => router.replace('/subscriptions' as Href)}
      />
    );
  }

  if (!subscription) {
    return (
      <CenteredState
        eyebrow="Subscription detail"
        title="Subscription not found"
        description="It may have been deleted or you may not have access to it."
        actionLabel="Back to list"
        onAction={() => router.replace('/subscriptions' as Href)}
      />
    );
  }

  return (
    <ThemedView style={styles.page}>
      <ScrollView
        contentInset={{
          top: 0,
          left: safeAreaInsets.left,
          right: safeAreaInsets.right,
          bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        }}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedView type="surfaceElevated" style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <ThemedText type="eyebrow" themeColor="textSecondary">
                  Subscription detail
                </ThemedText>
                <ThemedText type="title" style={styles.title}>
                  {subscription.serviceName}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {subscription.category} · {subscription.paymentMethodType}
                </ThemedText>
              </View>
              <SubscriptionStatusBadge status={getSubscriptionStatus(subscription)} />
            </View>

            <View style={styles.heroActions}>
              <Button
                variant="secondary"
                onPress={() => router.push(`/subscriptions/${subscriptionId}/edit` as Href)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                loading={deleteMutation.isPending}
                onPress={handleDelete}
                style={styles.deleteButton}>
                Delete
              </Button>
            </View>
            {deleteMutation.isError ? (
              <ThemedText type="bodySm" themeColor="danger">
                {deleteMutation.error instanceof Error
                  ? deleteMutation.error.message
                  : 'An error occurred while deleting this subscription.'}
              </ThemedText>
            ) : null}
          </ThemedView>

          <SectionCard
            eyebrow="Billing amount"
            title={formatSubscriptionAmount(subscription.amount, subscription.currency)}
            description={`${formatMonthlyEquivalent(monthlyEquivalent, subscription.currency)} for monthly comparison.`}
          />

          {fxEstimate ? (
            <SectionCard
              eyebrow="FX estimate"
              title={formatEstimatedKrw(fxEstimate.estimatedKrwAmount)}
              description={`${formatExchangeRate(fxEstimate.exchangeRate)} · ${formatAppDate(fxEstimate.fetchedAt, 'yyyy.MM.dd HH:mm')}`}>
              <View style={styles.fxList}>
                <ThemedText>
                  - Estimate range: {formatEstimatedKrw(fxEstimate.estimateLowKrwAmount)} to{' '}
                  {formatEstimatedKrw(fxEstimate.estimateHighKrwAmount)}
                </ThemedText>
                <ThemedText>
                  - Monthly normalized KRW: {formatEstimatedKrw(fxEstimate.normalizedMonthlyKrwAmount)}
                </ThemedText>
                <ThemedText>
                  - Volatility: {formatVolatilityDirection(fxEstimate.volatilityDirection, fxEstimate.volatilityDelta)}
                </ThemedText>
                <ThemedText type="bodySm" themeColor="textSecondary">
                  Source: {fxEstimate.sourceLabel}
                </ThemedText>
              </View>
            </SectionCard>
          ) : null}

          <SectionCard
            eyebrow="Next billing"
            title={formatAppDate(subscription.nextBillingDate)}
            description={`D-${Math.max(getDaysUntilDate(subscription.nextBillingDate), 0)} until the next billing date.`}>
            {subscription.isTrial && subscription.trialEndDate ? (
              <ThemedText type="bodySm" themeColor="textSecondary">
                Trial ends on {formatAppDate(subscription.trialEndDate)}
              </ThemedText>
            ) : null}
          </SectionCard>

          {trialSummary && trialSummary.status !== 'not_trial' ? (
            <SectionCard
              eyebrow="Trial management"
              title={trialSummary.title}
              description={trialSummary.description}>
              <View style={styles.trialList}>
                <ThemedText type="bodySm" themeColor="textSecondary">
                  Status: {formatTrialManagementStatus(trialSummary.status)}
                </ThemedText>
                {trialSummary.daysUntilTrialEnd !== null ? (
                  <ThemedText type="bodySm" themeColor="textSecondary">
                    Trial timing:{' '}
                    {trialSummary.daysUntilTrialEnd >= 0
                      ? `D-${trialSummary.daysUntilTrialEnd}`
                      : `D+${Math.abs(trialSummary.daysUntilTrialEnd)}`}
                  </ThemedText>
                ) : null}
                <ThemedText>{trialSummary.nextAction}</ThemedText>
              </View>
            </SectionCard>
          ) : null}

          <SectionCard
            eyebrow="Usage review"
            title={`Usage frequency: ${subscription.usageFrequency}`}
            description={`Cancellation signal score: ${cancellationScore}`}>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Note: {subscription.note ?? 'No note saved'}
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
    gap: Spacing.three,
  },
  heroCard: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  heroCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    maxWidth: 520,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  deleteButton: {
    minWidth: 0,
  },
  fxList: {
    gap: Spacing.two,
  },
  trialList: {
    gap: Spacing.two,
  },
});
