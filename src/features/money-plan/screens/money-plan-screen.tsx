import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { TextInputField } from '@/components/ui/text-input-field';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  useFinancialProfileQuery,
  useUpsertFinancialProfileMutation,
} from '@/features/money-plan/hooks/use-money-plan';
import {
  createMoneyPlanFormDefaults,
  mapFormValuesToFinancialProfileInput,
  moneyPlanFormSchema,
  type MoneyPlanFormValues,
} from '@/features/money-plan/schemas/money-plan-form-schema';
import {
  createBudgetReport,
  formatHealthStatus,
  formatMoneyAmount,
  formatMoneyRatio,
} from '@/features/money-plan/utils/money-plan-utils';
import { useSubscriptionsQuery } from '@/features/subscriptions/hooks/use-subscriptions';
import { formatSubscriptionAmount } from '@/features/subscriptions/utils/subscription-utils';
import type { BudgetGuidancePriority } from '@/types/domain';

function formatGuidancePriority(priority: BudgetGuidancePriority) {
  if (priority === 'high') {
    return 'High priority';
  }

  if (priority === 'medium') {
    return 'Medium priority';
  }

  return 'Steady';
}

function formatBillingTiming(daysUntilBilling: number) {
  if (!Number.isFinite(daysUntilBilling)) {
    return 'Billing date needs review';
  }

  if (daysUntilBilling === 0) {
    return 'Bills today';
  }

  if (daysUntilBilling > 0) {
    return `Bills in ${daysUntilBilling} days`;
  }

  return `Billed ${Math.abs(daysUntilBilling)} days ago`;
}

export function MoneyPlanScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const profileQuery = useFinancialProfileQuery();
  const upsertProfileMutation = useUpsertFinancialProfileMutation();
  const subscriptionsQuery = useSubscriptionsQuery();
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const profile = profileQuery.data?.data ?? null;
  const dataSource =
    profileQuery.data?.source === 'preview'
      ? 'Preview mode'
      : profileQuery.data?.source === 'supabase'
        ? 'Supabase sync'
        : 'Loading';
  const formDefaults = useMemo(
    () =>
      createMoneyPlanFormDefaults(
        profile
          ? {
              monthlyNetSalary: profile.monthlyNetSalary,
              monthlyFixedCosts: profile.monthlyFixedCosts,
            }
          : undefined
      ),
    [profile]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MoneyPlanFormValues>({
    resolver: zodResolver(moneyPlanFormSchema),
    defaultValues: createMoneyPlanFormDefaults(),
  });

  useEffect(() => {
    reset(formDefaults);
  }, [formDefaults, reset]);

  const report = useMemo(() => {
    if (!profile || !subscriptionsQuery.data) {
      return null;
    }

    return createBudgetReport(profile, subscriptionsQuery.data.data);
  }, [profile, subscriptionsQuery.data]);

  async function handleSave(values: MoneyPlanFormValues) {
    setSubmitMessage(null);
    setSubmitError(null);

    try {
      await upsertProfileMutation.mutateAsync(mapFormValuesToFinancialProfileInput(values));
      setSubmitMessage('Money Plan was saved and your recommendations were refreshed.');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not save Money Plan.');
    }
  }

  if (profileQuery.isPending || subscriptionsQuery.isPending) {
    return (
      <CenteredState
        eyebrow="Money Plan"
        title="Preparing your budget view"
        description="We are loading your financial profile and subscription totals."
        isLoading
      />
    );
  }

  if (profileQuery.isError || subscriptionsQuery.isError) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : subscriptionsQuery.error instanceof Error
          ? subscriptionsQuery.error.message
          : 'Please try again in a moment.';

    return (
      <CenteredState
        eyebrow="Money Plan"
        title="Could not load Money Plan"
        description={message}
        actionLabel="Try again"
        onAction={() => {
          void Promise.all([profileQuery.refetch(), subscriptionsQuery.refetch()]);
        }}
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
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Money Plan
            </ThemedText>
            <ThemedText type="title">Monthly budget guidance</ThemedText>
            <ThemedText themeColor="textSecondary">
              Save your take-home salary and fixed costs to see a realistic subscription budget.
            </ThemedText>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Current data source: {dataSource}
            </ThemedText>
          </ThemedView>

          {!profile ? (
            <SectionCard
              eyebrow="Empty state"
              tone="accent"
              title="Set up your first money plan"
              description="Start with your monthly net salary and fixed costs. We will combine that with your active subscriptions right away."
            />
          ) : null}

          <ThemedView type="surfaceElevated" style={styles.formCard}>
            <Controller
              control={control}
              name="monthlyNetSalary"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInputField
                  keyboardType="number-pad"
                  label="Monthly net salary"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="e.g. 3200000"
                  value={value}
                  errorMessage={errors.monthlyNetSalary?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="monthlyFixedCosts"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInputField
                  keyboardType="number-pad"
                  label="Monthly fixed costs"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="e.g. 1450000"
                  value={value}
                  errorMessage={errors.monthlyFixedCosts?.message}
                  helperText="Include rent, insurance, transport, phone, and other fixed monthly costs."
                />
              )}
            />

            {submitError ? (
              <ThemedText type="bodySm" themeColor="danger">
                {submitError}
              </ThemedText>
            ) : null}

            {submitMessage ? (
              <ThemedText type="bodySm" themeColor="success">
                {submitMessage}
              </ThemedText>
            ) : null}

            <Button
              loading={isSubmitting || upsertProfileMutation.isPending}
              onPress={handleSubmit(handleSave)}
              style={styles.stretchButton}>
              {profile ? 'Update money plan' : 'Save money plan'}
            </Button>
          </ThemedView>

          {report ? (
            <>
              <SectionCard
                eyebrow="Profile summary"
                title={formatMoneyAmount(report.monthlyCommittedCosts)}
                description="Monthly committed costs from fixed costs plus KRW subscriptions.">
                <View style={styles.metricList}>
                  <ThemedText>- Salary: {formatMoneyAmount(report.monthlyNetSalary)}</ThemedText>
                  <ThemedText>- Fixed costs: {formatMoneyAmount(report.monthlyFixedCosts)}</ThemedText>
                  <ThemedText>
                    - KRW subscriptions: {formatMoneyAmount(report.monthlySubscriptionTotal)}
                  </ThemedText>
                  <ThemedText>
                    - Disposable income: {formatMoneyAmount(report.disposableIncome)}
                  </ThemedText>
                  <ThemedText>
                    - Committed cost ratio: {formatMoneyRatio(report.committedCostRatio)}
                  </ThemedText>
                </View>
              </SectionCard>

              <SectionCard
                eyebrow="Health check"
                title={`${formatHealthStatus(report.fixedCostStatus)} fixed costs / ${formatHealthStatus(report.subscriptionStatus)} subscriptions`}
                description="These ratios show how heavy your fixed costs and subscriptions are against take-home pay.">
                <View style={styles.metricList}>
                  <ThemedText>
                    - Fixed cost ratio: {formatMoneyRatio(report.fixedCostRatio)}
                  </ThemedText>
                  <ThemedText>
                    - Subscription ratio: {formatMoneyRatio(report.subscriptionRatio)}
                  </ThemedText>
                  <ThemedText>
                    - USD subscriptions excluded: {report.foreignCurrencySubscriptionCount}
                  </ThemedText>
                </View>
              </SectionCard>

              <SectionCard
                eyebrow="Action guide"
                title="Recommended next moves"
                description="Budgeting guidance based on fixed costs, subscriptions, and flexible cash flow.">
                <View style={styles.actionList}>
                  {report.actionCards.map((card) => (
                    <View key={card.id} style={styles.actionRow}>
                      <View style={styles.actionHeader}>
                        <ThemedText type="heading" style={styles.actionTitle}>
                          {card.title}
                        </ThemedText>
                        <ThemedText type="smallBold" themeColor="textSecondary">
                          {formatGuidancePriority(card.priority)}
                        </ThemedText>
                      </View>
                      <ThemedText themeColor="textSecondary">{card.summary}</ThemedText>
                      <ThemedText type="bodySm" themeColor="textSecondary">
                        {card.reason}
                      </ThemedText>
                      <ThemedText type="bodySm">{card.nextStep}</ThemedText>
                    </View>
                  ))}
                </View>
              </SectionCard>

              <SectionCard
                eyebrow="Review queue"
                title={
                  report.subscriptionReviewCandidates.length > 0
                    ? 'Subscription candidates'
                    : 'No urgent subscription candidates'
                }
                description={
                  report.subscriptionReviewCandidates.length > 0
                    ? 'Start with subscriptions that are low-usage, trial-based, duplicated, or billing soon.'
                    : 'Active subscriptions do not currently show strong cancellation signals.'
                }>
                {report.subscriptionReviewCandidates.length > 0 ? (
                  <View style={styles.candidateList}>
                    {report.subscriptionReviewCandidates.map((candidate) => (
                      <View key={candidate.subscriptionId} style={styles.candidateRow}>
                        <View style={styles.actionHeader}>
                          <View style={styles.candidateTitleBlock}>
                            <ThemedText type="heading" style={styles.actionTitle}>
                              {candidate.serviceName}
                            </ThemedText>
                            <ThemedText type="bodySm" themeColor="textSecondary">
                              {candidate.category} / {formatBillingTiming(candidate.daysUntilBilling)}
                            </ThemedText>
                          </View>
                          <ThemedText type="smallBold" themeColor="textSecondary">
                            Review
                          </ThemedText>
                        </View>
                        <ThemedText type="bodySm" themeColor="textSecondary">
                          Monthly equivalent:{' '}
                          {formatSubscriptionAmount(
                            candidate.monthlyEquivalentAmount,
                            candidate.currency
                          )}
                        </ThemedText>
                        <ThemedText type="bodySm" themeColor="textSecondary">
                          Reasons: {candidate.reasons.join(', ')}
                        </ThemedText>
                        <ThemedText type="bodySm">{candidate.suggestedAction}</ThemedText>
                      </View>
                    ))}
                  </View>
                ) : null}
              </SectionCard>

              <SectionCard
                eyebrow="Recommended budget"
                title={`${formatMoneyAmount(report.recommendedSubscriptionBudgetMin)} - ${formatMoneyAmount(report.recommendedSubscriptionBudgetMax)}`}
                description="Recommended monthly subscription range for this salary profile.">
                <View style={styles.metricList}>
                  <ThemedText>
                    - Savings target: {formatMoneyAmount(report.recommendedSavingsTarget)}
                  </ThemedText>
                  <ThemedText>
                    - Living budget after fixed costs and savings: {formatMoneyAmount(report.recommendedLivingBudget)}
                  </ThemedText>
                </View>
              </SectionCard>

              <SectionCard
                eyebrow="Report note"
                title="What this report includes"
                description="Money Plan currently uses fixed costs and KRW subscription totals.">
                <View style={styles.metricList}>
                  <ThemedText>
                    - KRW subscriptions are included in salary ratio and budget range calculations.
                  </ThemedText>
                  <ThemedText>
                    - Foreign-currency subscriptions excluded: {report.foreignCurrencySubscriptionCount}
                  </ThemedText>
                </View>
              </SectionCard>
            </>
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
  heroCard: {
    gap: Spacing.two,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  formCard: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  stretchButton: {
    alignSelf: 'stretch',
  },
  metricList: {
    gap: Spacing.two,
  },
  actionList: {
    gap: Spacing.three,
  },
  actionRow: {
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  actionTitle: {
    flex: 1,
  },
  candidateList: {
    gap: Spacing.three,
  },
  candidateRow: {
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
  candidateTitleBlock: {
    flex: 1,
    gap: Spacing.one,
  },
});
