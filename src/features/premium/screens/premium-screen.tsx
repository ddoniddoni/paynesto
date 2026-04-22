import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { formatAppDate } from '@/lib/date';

import { PremiumPlanCard } from '../components/premium-plan-card';
import { premiumPlans } from '../data/premium-plans';
import { useActivatePremiumPlanMutation, usePremiumTransactionsQuery } from '../hooks/use-premium';
import {
  createCheckoutInputFromPlan,
  getActivePremiumTransaction,
  hasPremiumAccess,
} from '../utils/premium-utils';

export function PremiumScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const premiumTransactionsQuery = usePremiumTransactionsQuery();
  const activatePremiumPlanMutation = useActivatePremiumPlanMutation();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (premiumTransactionsQuery.isPending) {
    return (
      <CenteredState
        eyebrow="Premium"
        title="Loading premium status"
        description="We are preparing your current plan and available upgrade options."
        isLoading
      />
    );
  }

  if (premiumTransactionsQuery.isError) {
    return (
      <CenteredState
        eyebrow="Premium"
        title="Could not load premium"
        description={
          premiumTransactionsQuery.error instanceof Error
            ? premiumTransactionsQuery.error.message
            : 'Please try again in a moment.'
        }
        actionLabel="Try again"
        onAction={() => void premiumTransactionsQuery.refetch()}
      />
    );
  }

  const premiumTransactions = premiumTransactionsQuery.data.data;
  const activeTransaction = getActivePremiumTransaction(premiumTransactions);
  const isPremium = hasPremiumAccess(premiumTransactions);

  async function handleSelectPlan(planId: string) {
    const plan = premiumPlans.find((item) => item.id === planId);

    if (!plan) {
      return;
    }

    setSubmitError(null);
    setSubmitMessage(null);
    setSelectedPlanId(plan.id);

    try {
      await activatePremiumPlanMutation.mutateAsync(createCheckoutInputFromPlan(plan));
      setSubmitMessage(`Premium access was updated to ${plan.name}.`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not update premium.');
    } finally {
      setSelectedPlanId(null);
    }
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
              Premium
            </ThemedText>
            <ThemedText type="title">
              {isPremium ? 'Premium is active' : 'Upgrade your account'}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Premium unlocks FX volatility alerts and richer recurring-cost guidance for users managing USD subscriptions.
            </ThemedText>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Source: {premiumTransactionsQuery.data.source === 'preview' ? 'Preview upgrade mode' : 'Supabase sync'}
            </ThemedText>
          </ThemedView>

          <SectionCard
            eyebrow="Current access"
            title={isPremium ? 'Premium active' : 'Free plan'}
            description="This step uses a preview-friendly entitlement flow so the product can shape the upgrade experience before real billing is connected.">
            <View style={styles.metricList}>
              <ThemedText>- Status: {isPremium ? 'Active' : 'Free'}</ThemedText>
              <ThemedText>
                - Active plan: {activeTransaction ? activeTransaction.planId : 'No active premium plan'}
              </ThemedText>
              <ThemedText>
                - Renewal window:{' '}
                {activeTransaction?.expiresAt
                  ? formatAppDate(activeTransaction.expiresAt, 'yyyy.MM.dd')
                  : 'Not scheduled'}
              </ThemedText>
            </View>
          </SectionCard>

          <View style={styles.planGrid}>
            {premiumPlans.map((plan) => (
              <PremiumPlanCard
                key={plan.id}
                plan={plan}
                disabled={activeTransaction?.planId === plan.id}
                loading={activatePremiumPlanMutation.isPending && selectedPlanId === plan.id}
                onSelect={() => void handleSelectPlan(plan.id)}
              />
            ))}
          </View>

          <SectionCard
            eyebrow="Premium unlocks"
            title="Why upgrade"
            description="Keep premium benefits tied to concrete money-management outcomes instead of generic perks.">
            <View style={styles.metricList}>
              <ThemedText>- FX volatility alerts for USD subscriptions</ThemedText>
              <ThemedText>- Stronger savings watchlist follow-up</ThemedText>
              <ThemedText>- Earlier reminder coverage for recurring costs</ThemedText>
            </View>
          </SectionCard>

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
  metricList: {
    gap: Spacing.two,
  },
  planGrid: {
    gap: Spacing.three,
  },
});
