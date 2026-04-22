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
import { useFinancialProfileQuery } from '@/features/money-plan/hooks/use-money-plan';
import { usePremiumTransactionsQuery } from '@/features/premium/hooks/use-premium';
import { useNotificationSettingsQuery } from '@/features/settings/hooks/use-notification-settings';
import { useSubscriptionsQuery } from '@/features/subscriptions/hooks/use-subscriptions';

import { MyPageLinkCard } from '../components/my-page-link-card';
import { createMyPageSummary } from '../utils/my-page-utils';

export function MyPageScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const { status, user, exitPreviewMode } = useAuthSession();
  const subscriptionsQuery = useSubscriptionsQuery();
  const profileQuery = useFinancialProfileQuery();
  const notificationSettingsQuery = useNotificationSettingsQuery();
  const premiumTransactionsQuery = usePremiumTransactionsQuery();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (notificationSettingsQuery.isPending || premiumTransactionsQuery.isPending) {
    return (
      <CenteredState
        eyebrow="My Page"
        title="Preparing account details"
        description="We are loading your notification preferences and premium status."
        isLoading
      />
    );
  }

  if (notificationSettingsQuery.isError || premiumTransactionsQuery.isError) {
    const message =
      notificationSettingsQuery.error instanceof Error
        ? notificationSettingsQuery.error.message
        : premiumTransactionsQuery.error instanceof Error
          ? premiumTransactionsQuery.error.message
          : 'Please try again in a moment.';

    return (
      <CenteredState
        eyebrow="My Page"
        title="Could not load My Page"
        description={message}
        actionLabel="Try again"
        onAction={() => {
          void Promise.all([
            notificationSettingsQuery.refetch(),
            premiumTransactionsQuery.refetch(),
          ]);
        }}
      />
    );
  }

  const subscriptions = subscriptionsQuery.data?.data ?? [];
  const profile = profileQuery.data?.data ?? null;
  const notificationSettings = notificationSettingsQuery.data.data;
  const premiumTransactions = premiumTransactionsQuery.data.data;
  const summary = createMyPageSummary({
    subscriptions,
    profile,
    notificationSettings,
    premiumTransactions,
  });

  async function handleSignOut() {
    setSignOutError(null);
    setIsSigningOut(true);

    if (status === 'preview') {
      await exitPreviewMode();
      setIsSigningOut(false);
      return;
    }

    const result = await signOut();

    if (!result.ok) {
      setSignOutError(result.errorMessage);
    }

    setIsSigningOut(false);
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
              My Page
            </ThemedText>
            <ThemedText type="title">{user?.email ?? 'Signed-in account'}</ThemedText>
            <ThemedText themeColor="textSecondary">
              Manage reminders, premium access, support details, and account actions from one place.
            </ThemedText>

            <View style={styles.heroMeta}>
              <ThemedText type="bodySm" themeColor="textSecondary">
                Notifications: {notificationSettingsQuery.data.source === 'preview' ? 'Preview mode' : 'Supabase sync'}
              </ThemedText>
              <ThemedText type="bodySm" themeColor="textSecondary">
                Premium: {premiumTransactionsQuery.data.source === 'preview' ? 'Preview mode' : 'Supabase sync'}
              </ThemedText>
            </View>
          </ThemedView>

          <SectionCard
            eyebrow="Account snapshot"
            title={summary.premiumStatusLabel}
            description="A quick summary of how your account, recurring spend setup, and notifications are configured.">
            <View style={styles.metricList}>
              <ThemedText>- Active subscriptions: {summary.activeSubscriptionCount}</ThemedText>
              <ThemedText>- Money Plan: {summary.moneyPlanStatusLabel}</ThemedText>
              <ThemedText>- Notifications: {summary.reminderStatusLabel}</ThemedText>
              <ThemedText>- FX alert access: {summary.fxAlertStatusLabel}</ThemedText>
            </View>
          </SectionCard>

          <View style={styles.linkGrid}>
            <MyPageLinkCard
              eyebrow="Notifications"
              title="Reminder preferences"
              description="Control billing, trial-ending, and FX alert preferences."
              actionLabel="Open settings"
              onPress={() => router.push('/my-page/notifications' as Href)}
            />
            <MyPageLinkCard
              eyebrow="Premium"
              title={summary.isPremium ? 'Premium is active' : 'Unlock Premium'}
              description={
                summary.isPremium
                  ? 'Review your current plan and switch plans if needed.'
                  : 'Unlock FX volatility alerts and richer recommendation flows.'
              }
              actionLabel={summary.premiumCtaLabel}
              tone="accent"
              onPress={() => router.push('/my-page/premium' as Href)}
            />
          </View>

          <SectionCard
            eyebrow="Legal and support"
            title="Support information"
            description="Keep policy and support details close to the account area so the MVP already feels service-ready.">
            <View style={styles.metricList}>
              <ThemedText>- Terms of Service: Paynesto subscription management service terms</ThemedText>
              <ThemedText>- Privacy Policy: Budget inputs and subscription data stay tied to your account</ThemedText>
              <ThemedText>- Support: support@paynesto.app</ThemedText>
              <ThemedText>- Response goal: within 2 business days for MVP support requests</ThemedText>
            </View>
          </SectionCard>

          {(subscriptionsQuery.isError || profileQuery.isError) && (
            <SectionCard
              eyebrow="Limited sync"
              title="Some account summary data is unavailable"
              description="My Page still loads, but one or more summary sources could not be refreshed.">
              <View style={styles.metricList}>
                {subscriptionsQuery.isError ? (
                  <ThemedText themeColor="danger">
                    - Subscriptions: {subscriptionsQuery.error instanceof Error ? subscriptionsQuery.error.message : 'Could not load subscriptions.'}
                  </ThemedText>
                ) : null}
                {profileQuery.isError ? (
                  <ThemedText themeColor="danger">
                    - Money Plan: {profileQuery.error instanceof Error ? profileQuery.error.message : 'Could not load Money Plan.'}
                  </ThemedText>
                ) : null}
              </View>
            </SectionCard>
          )}

          <SectionCard
            eyebrow="Account actions"
            title={status === 'preview' ? 'Exit preview' : 'Sign out'}
            description={
              status === 'preview'
                ? 'Leave preview mode and return to the sign-in screen.'
                : 'Use account actions here instead of keeping them on the Home dashboard.'
            }>
            <Button variant="secondary" loading={isSigningOut} onPress={handleSignOut}>
              {status === 'preview' ? 'Exit preview' : 'Sign out'}
            </Button>
            {signOutError ? (
              <ThemedText type="bodySm" themeColor="danger">
                {signOutError}
              </ThemedText>
            ) : null}
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
    gap: Spacing.two,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  heroMeta: {
    gap: Spacing.one,
  },
  metricList: {
    gap: Spacing.two,
  },
  linkGrid: {
    gap: Spacing.three,
  },
});
