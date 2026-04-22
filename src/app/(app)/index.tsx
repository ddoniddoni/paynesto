import { useRouter, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
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

function DashboardRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <View style={styles.dashboardRow}>
      <View style={styles.dashboardRowCopy}>
        <ThemedText type="bodySm" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText numberOfLines={1} type="smallBold">
          {value}
        </ThemedText>
      </View>
      <ThemedText numberOfLines={2} type="bodySm" themeColor="textSecondary" style={styles.dashboardRowDetail}>
        {detail}
      </ThemedText>
    </View>
  );
}

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const subscriptionsQuery = useSubscriptionsQuery();
  const profileQuery = useFinancialProfileQuery();
  const snapshotQuery = useLatestUsdKrwSnapshotQuery();

  const subscriptions = subscriptionsQuery.data?.data ?? [];
  const profile = profileQuery.data?.data ?? null;
  const snapshot = snapshotQuery.data?.data ?? null;
  const summary = createHomeDashboardSummary({
    subscriptions,
    profile,
    snapshot,
  });

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
          top: 0,
          left: safeAreaInsets.left,
          right: safeAreaInsets.right,
          bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        }}
        scrollIndicatorInsets={{
          top: 0,
          bottom: safeAreaInsets.bottom + BottomTabInset,
        }}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedView type="surfaceElevated" style={styles.summaryPanel}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryCopy}>
                <ThemedText type="eyebrow" themeColor="textSecondary">
                  Monthly spend
                </ThemedText>
                <ThemedText type="title">
                  {summary.activeSubscriptionCount > 0
                    ? formatMoneyAmount(summary.totalMonthlySubscriptionSpend)
                    : 'Track your first plan'}
                </ThemedText>
                <ThemedText type="bodySm" themeColor="textSecondary">
                  {summary.activeSubscriptionCount} active / {summary.trialEndingCount} trial check
                </ThemedText>
              </View>

              <ThemedView type="surfaceAccent" style={styles.statusPill}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {summary.salaryHealthStatus
                    ? formatHealthStatus(summary.salaryHealthStatus)
                    : 'Setup needed'}
                </ThemedText>
              </ThemedView>
            </View>

            <View style={styles.summaryRows}>
              <DashboardRow
                label="Next billing"
                value={summary.nextBilling ? summary.nextBilling.serviceName : 'Nothing scheduled'}
                detail={
                  summary.nextBilling
                    ? `${formatDaysUntilBilling(summary.daysUntilNextBilling)} / ${formatSubscriptionAmount(
                        summary.nextBilling.amount,
                        summary.nextBilling.currency
                      )}`
                    : 'Add a subscription'
                }
              />
              <DashboardRow
                label="Salary ratio"
                value={
                  summary.salaryRatio !== null
                    ? formatMoneyRatio(summary.salaryRatio)
                    : 'Money Plan needed'
                }
                detail={
                  profile
                    ? `${formatMoneyAmount(summary.disposableIncome ?? 0)} after fixed costs`
                    : 'Add salary and fixed costs'
                }
              />
            </View>

            <View style={styles.heroActions}>
              <Button onPress={() => router.push('/subscriptions/create' as Href)}>
                Add subscription
              </Button>
              <Button variant="secondary" onPress={() => router.push('/money-plan' as Href)}>
                Update Money Plan
              </Button>
            </View>
          </ThemedView>

          <View style={styles.metricsGrid}>
            <HomeMetricCard
              eyebrow="KRW base"
              value={formatMoneyAmount(summary.monthlyKrwSubscriptionTotal)}
              description={
                summary.usdSubscriptionCount > 0
                  ? `${summary.usdSubscriptionCount} USD plan(s) tracked separately`
                  : 'Monthly-equivalent active plans'
              }
              style={styles.metricCard}
              tone="accent"
            />
            <HomeMetricCard
              eyebrow="USD estimate"
              value={
                summary.usdSubscriptionCount > 0
                  ? formatMoneyAmount(summary.monthlyUsdEstimateTotal)
                  : 'None'
              }
              description={
                snapshot
                  ? `${formatExchangeRate(snapshot.rate)} / ${formatAppDate(snapshot.fetchedAt, 'yyyy.MM.dd HH:mm')}`
                  : 'Waiting for FX snapshot'
              }
              style={styles.metricCard}
            />
            <HomeMetricCard
              eyebrow="Committed"
              value={
                summary.totalMonthlyCommittedCost !== null
                  ? formatMoneyAmount(summary.totalMonthlyCommittedCost)
                  : 'Setup needed'
              }
              description={profile ? 'Fixed costs plus subscriptions' : 'Connect Money Plan'}
              style={styles.metricCard}
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
            title="Recommended actions"
            description="Prioritized from your subscriptions, budget setup, and FX-sensitive plans.">
            <View style={styles.actionsGrid}>
              {summary.actions.map((action) => (
                <HomeActionCard key={action.id} action={action} />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.two,
  },
  summaryPanel: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  statusPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summaryRows: {
    gap: Spacing.two,
  },
  dashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dashboardRowCopy: {
    flex: 1,
    minWidth: 0,
  },
  dashboardRowDetail: {
    flexShrink: 1,
    textAlign: 'right',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricCard: {
    minWidth: 154,
    flexGrow: 1,
    flexBasis: 0,
  },
  actionsGrid: {
    gap: Spacing.two,
  },
  bulletList: {
    gap: Spacing.two,
  },
});
