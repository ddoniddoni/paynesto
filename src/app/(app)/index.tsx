import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
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
import { formatExchangeRate } from '@/features/exchange-rate/utils/exchange-rate-utils';
import { HomeActionCard } from '@/features/home/components/home-action-card';
import { HomeMetricCard } from '@/features/home/components/home-metric-card';
import { createHomeDashboardSummary } from '@/features/home/utils/home-dashboard-utils';
import { useFinancialProfileQuery } from '@/features/money-plan/hooks/use-money-plan';
import {
  formatHealthStatus,
  formatMoneyAmount,
  formatMoneyRatio,
} from '@/features/money-plan/utils/money-plan-utils';
import { useSubscriptionsQuery } from '@/features/subscriptions/hooks/use-subscriptions';
import { formatSubscriptionAmount } from '@/features/subscriptions/utils/subscription-utils';
import { formatAppDate } from '@/lib/date';

function formatDaysUntilBilling(daysUntilBilling: number | null) {
  if (daysUntilBilling === null) {
    return 'No billing scheduled';
  }

  if (daysUntilBilling < 0) {
    return 'Billing date passed';
  }

  if (daysUntilBilling === 0) {
    return 'Today';
  }

  return `In ${daysUntilBilling} day${daysUntilBilling === 1 ? '' : 's'}`;
}

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user } = useAuthSession();
  const subscriptionsQuery = useSubscriptionsQuery();
  const profileQuery = useFinancialProfileQuery();
  const snapshotQuery = useLatestUsdKrwSnapshotQuery();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isWideLayout = width >= 720;
  const subscriptions = subscriptionsQuery.data?.data ?? [];
  const profile = profileQuery.data?.data ?? null;
  const snapshot = snapshotQuery.data?.data ?? null;
  const summary = createHomeDashboardSummary({
    subscriptions,
    profile,
    snapshot,
  });

  const subscriptionSourceLabel =
    subscriptionsQuery.data?.source === 'preview'
      ? 'Preview subscriptions'
      : subscriptionsQuery.data?.source === 'supabase'
        ? 'Supabase subscriptions'
        : 'Loading subscriptions';
  const profileSourceLabel =
    profileQuery.data?.source === 'preview'
      ? 'Preview money plan'
      : profileQuery.data?.source === 'supabase'
        ? 'Supabase money plan'
        : profileQuery.isError
          ? 'Money Plan unavailable'
          : 'Loading money plan';
  const fxSourceLabel =
    snapshotQuery.data?.source === 'preview'
      ? 'Preview FX'
      : snapshotQuery.data?.source === 'supabase'
        ? 'Live FX sync'
        : snapshotQuery.isError
          ? 'FX unavailable'
          : 'Loading FX';

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
        description="We are loading subscription totals, next billing details, and dashboard actions."
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
        scrollIndicatorInsets={{
          top: safeAreaInsets.top,
          bottom: safeAreaInsets.bottom + BottomTabInset,
        }}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedView type="surfaceElevated" style={styles.heroSection}>
            <View style={styles.heroCopy}>
              <ThemedText type="eyebrow" themeColor="textSecondary">
                This month
              </ThemedText>
              <ThemedText type="title">
                {summary.activeSubscriptionCount > 0
                  ? formatMoneyAmount(summary.totalMonthlySubscriptionSpend)
                  : 'Ready to track recurring spend'}
              </ThemedText>
              <ThemedText style={styles.lead} themeColor="textSecondary">
                {summary.activeSubscriptionCount > 0
                  ? `${user?.email ?? 'Your account'} is tracking ${summary.activeSubscriptionCount} active subscription(s). Home now combines recurring cost, salary context, and FX-sensitive spend in one view.`
                  : 'Add your first subscription and connect Money Plan to unlock a fuller monthly dashboard.'}
              </ThemedText>
            </View>

            <View style={styles.heroMeta}>
              <ThemedText type="bodySm" themeColor="textSecondary">
                {subscriptionSourceLabel}
              </ThemedText>
              <ThemedText type="bodySm" themeColor="textSecondary">
                {profileSourceLabel}
              </ThemedText>
              <ThemedText type="bodySm" themeColor="textSecondary">
                {fxSourceLabel}
              </ThemedText>
            </View>

            <View style={styles.heroActions}>
              <Button onPress={() => router.push('/subscriptions' as Href)}>Open subscriptions</Button>
              <Button variant="secondary" onPress={() => router.push('/money-plan' as Href)}>
                Open Money Plan
              </Button>
              <Button
                variant="ghost"
                loading={isSigningOut}
                onPress={handleSignOut}
                style={styles.ghostButton}>
                Sign out
              </Button>
            </View>

            {signOutError ? (
              <ThemedText type="bodySm" themeColor="danger">
                {signOutError}
              </ThemedText>
            ) : null}
          </ThemedView>

          <View style={styles.metricsGrid}>
            <HomeMetricCard
              eyebrow="Monthly subscriptions"
              value={formatMoneyAmount(summary.totalMonthlySubscriptionSpend)}
              description={
                summary.usdSubscriptionCount > 0
                  ? `${formatMoneyAmount(summary.monthlyKrwSubscriptionTotal)} KRW + ${formatMoneyAmount(summary.monthlyUsdEstimateTotal)} FX estimate`
                  : 'Based on active monthly-equivalent subscriptions'
              }
              style={isWideLayout ? styles.halfCard : undefined}
              tone="accent"
            />
            <HomeMetricCard
              eyebrow="Next billing"
              value={summary.nextBilling ? summary.nextBilling.serviceName : 'Nothing scheduled'}
              description={
                summary.nextBilling
                  ? `${formatDaysUntilBilling(summary.daysUntilNextBilling)} · ${formatSubscriptionAmount(
                      summary.nextBilling.amount,
                      summary.nextBilling.currency
                    )}`
                  : 'Add a subscription to start tracking upcoming payments'
              }
              style={isWideLayout ? styles.halfCard : undefined}
            />
            <HomeMetricCard
              eyebrow="Salary ratio"
              value={
                summary.salaryRatio !== null
                  ? `${formatMoneyRatio(summary.salaryRatio)} · ${formatHealthStatus(summary.salaryHealthStatus ?? 'healthy')}`
                  : 'Money Plan needed'
              }
              description={
                profile
                  ? `Disposable income after fixed costs: ${formatMoneyAmount(summary.disposableIncome ?? 0)}`
                  : 'Connect take-home pay and fixed costs to unlock budget-aware guidance'
              }
              style={isWideLayout ? styles.halfCard : undefined}
            />
            <HomeMetricCard
              eyebrow="USD estimate"
              value={
                summary.usdSubscriptionCount > 0
                  ? formatMoneyAmount(summary.monthlyUsdEstimateTotal)
                  : 'No USD subscriptions'
              }
              description={
                snapshot
                  ? `${formatExchangeRate(snapshot.rate)} · ${formatAppDate(snapshot.fetchedAt, 'yyyy.MM.dd HH:mm')}`
                  : 'FX estimates will appear when a USD/KRW snapshot is available'
              }
              style={isWideLayout ? styles.halfCard : undefined}
            />
          </View>

          {profile ? (
            <SectionCard
              eyebrow="Budget pulse"
              title={`${formatMoneyAmount(summary.totalMonthlyCommittedCost ?? 0)} committed this month`}
              description="Fixed costs, KRW subscriptions, and USD estimates combined into one monthly commitment view.">
              <View style={styles.bulletList}>
                <ThemedText>
                  - Fixed costs: {formatMoneyAmount(profile.monthlyFixedCosts)}
                </ThemedText>
                <ThemedText>
                  - Subscription budget status: {formatHealthStatus(summary.salaryHealthStatus ?? 'healthy')}
                </ThemedText>
                <ThemedText>
                  - Recommended subscription band: {summary.budgetReport
                    ? `${formatMoneyAmount(summary.budgetReport.recommendedSubscriptionBudgetMin)} - ${formatMoneyAmount(summary.budgetReport.recommendedSubscriptionBudgetMax)}`
                    : 'Unavailable'}
                </ThemedText>
              </View>
            </SectionCard>
          ) : (
            <SectionCard
              eyebrow="Budget pulse"
              tone="accent"
              title="Money Plan is not configured yet"
              description="Add salary and fixed costs to see whether subscriptions are healthy for your real monthly budget.">
              <Button variant="secondary" onPress={() => router.push('/money-plan' as Href)}>
                Set up Money Plan
              </Button>
            </SectionCard>
          )}

          <SectionCard
            eyebrow="What to do next"
            title="Action-oriented dashboard cards"
            description="These recommendations respond to your current subscriptions, budget setup, and FX-sensitive plans.">
            <View style={styles.actionsGrid}>
              {summary.actions.map((action) => (
                <HomeActionCard
                  key={action.id}
                  action={action}
                  style={isWideLayout ? styles.actionHalfCard : undefined}
                />
              ))}
            </View>
          </SectionCard>

          <SectionCard
            eyebrow="Watch list"
            title={summary.trialEndingCount > 0 ? `${summary.trialEndingCount} trial ending reminder(s)` : 'Recurring checks are under control'}
            description={
              summary.nextBilling
                ? `${summary.nextBilling.serviceName} is the next scheduled billing item on ${formatAppDate(summary.nextBilling.nextBillingDate)}.`
                : 'You will see upcoming billings here after adding subscriptions.'
            }>
            <View style={styles.bulletList}>
              <ThemedText>
                - Active subscriptions: {summary.activeSubscriptionCount}
              </ThemedText>
              <ThemedText>
                - USD subscriptions: {summary.usdSubscriptionCount}
              </ThemedText>
              <ThemedText>
                - Trial endings to review: {summary.trialEndingCount}
              </ThemedText>
              {summary.topCancellationCandidate ? (
                <ThemedText>
                  - First savings review target: {summary.topCancellationCandidate.serviceName}
                </ThemedText>
              ) : null}
            </View>
          </SectionCard>

          {profileQuery.isError || snapshotQuery.isError ? (
            <SectionCard
              eyebrow="Limited sync"
              title="Some dashboard sources are unavailable"
              description="Home still works with partial data, but one or more supporting sources could not be refreshed.">
              <View style={styles.bulletList}>
                {profileQuery.isError ? (
                  <ThemedText themeColor="danger">
                    - Money Plan: {profileQuery.error instanceof Error ? profileQuery.error.message : 'Could not load Money Plan data.'}
                  </ThemedText>
                ) : null}
                {snapshotQuery.isError ? (
                  <ThemedText themeColor="danger">
                    - FX snapshot: {snapshotQuery.error instanceof Error ? snapshotQuery.error.message : 'Could not load FX data.'}
                  </ThemedText>
                ) : null}
              </View>
            </SectionCard>
          ) : null}
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
  heroSection: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  heroCopy: {
    gap: Spacing.two,
  },
  lead: {
    maxWidth: 620,
  },
  heroMeta: {
    gap: Spacing.one,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ghostButton: {
    minWidth: 96,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  halfCard: {
    width: '48%',
    minWidth: 280,
    flexGrow: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  actionHalfCard: {
    width: '48%',
    minWidth: 280,
    flexGrow: 1,
  },
  bulletList: {
    gap: Spacing.two,
  },
});
