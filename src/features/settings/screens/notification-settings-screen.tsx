import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  createNotificationSchedulePreview,
  formatNotificationScheduleKind,
} from '@/features/notifications/utils/notification-schedule-utils';
import { usePremiumTransactionsQuery } from '@/features/premium/hooks/use-premium';
import { canUseFxAlertNotifications } from '@/features/premium/utils/premium-utils';
import { useSubscriptionsQuery } from '@/features/subscriptions/hooks/use-subscriptions';
import { SubscriptionOptionGroup } from '@/features/subscriptions/components/subscription-option-group';
import type { NotificationLeadDays, NotificationSettingsWriteInput } from '@/types/domain';
import { formatAppDate } from '@/lib/date';

import { useNotificationSettingsQuery, useUpsertNotificationSettingsMutation } from '../hooks/use-notification-settings';
import { SettingToggleCard } from '../components/setting-toggle-card';
import {
  createNotificationSettingsWriteInput,
  getFxAlertGateCopy,
  reminderLeadDayLabels,
} from '../utils/notification-settings-utils';

const reminderLeadDayOptions: readonly NotificationLeadDays[] = [1, 3, 7];

export function NotificationSettingsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const settingsQuery = useNotificationSettingsQuery();
  const premiumTransactionsQuery = usePremiumTransactionsQuery();
  const subscriptionsQuery = useSubscriptionsQuery();
  const upsertSettingsMutation = useUpsertNotificationSettingsMutation();
  const [draft, setDraft] = useState<NotificationSettingsWriteInput | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const subscriptions = useMemo(
    () => subscriptionsQuery.data?.data ?? [],
    [subscriptionsQuery.data?.data]
  );
  const premiumTransactions = useMemo(
    () => premiumTransactionsQuery.data?.data ?? [],
    [premiumTransactionsQuery.data?.data]
  );

  useEffect(() => {
    if (!settingsQuery.data?.data) {
      return;
    }

    setDraft(
      createNotificationSettingsWriteInput({
        billingRemindersEnabled: settingsQuery.data.data.billingRemindersEnabled,
        trialEndingRemindersEnabled: settingsQuery.data.data.trialEndingRemindersEnabled,
        fxVolatilityAlertsEnabled: settingsQuery.data.data.fxVolatilityAlertsEnabled,
        marketingUpdatesEnabled: settingsQuery.data.data.marketingUpdatesEnabled,
        reminderLeadDays: settingsQuery.data.data.reminderLeadDays,
      })
    );
  }, [settingsQuery.data?.data]);

  const schedulePreview = useMemo(() => {
    if (!draft) {
      return [];
    }

    return createNotificationSchedulePreview({
      settings: {
        id: 'preview-settings',
        userId: 'preview-user',
        ...draft,
        createdAt: '',
        updatedAt: '',
      },
      subscriptions,
      premiumTransactions,
    });
  }, [draft, premiumTransactions, subscriptions]);

  if (settingsQuery.isPending || premiumTransactionsQuery.isPending || subscriptionsQuery.isPending || !draft) {
    return (
      <CenteredState
        eyebrow="Notifications"
        title="Loading reminder preferences"
        description="We are preparing your notification settings, subscriptions, and premium access state."
        isLoading
      />
    );
  }

  if (settingsQuery.isError || premiumTransactionsQuery.isError || subscriptionsQuery.isError) {
    const message =
      settingsQuery.error instanceof Error
        ? settingsQuery.error.message
        : premiumTransactionsQuery.error instanceof Error
          ? premiumTransactionsQuery.error.message
          : subscriptionsQuery.error instanceof Error
            ? subscriptionsQuery.error.message
          : 'Please try again in a moment.';

    return (
      <CenteredState
        eyebrow="Notifications"
        title="Could not load notification settings"
        description={message}
        actionLabel="Try again"
        onAction={() => {
          void Promise.all([
            settingsQuery.refetch(),
            premiumTransactionsQuery.refetch(),
            subscriptionsQuery.refetch(),
          ]);
        }}
      />
    );
  }

  const isPremium = canUseFxAlertNotifications(premiumTransactions);

  function updateDraft<K extends keyof NotificationSettingsWriteInput>(
    key: K,
    value: NotificationSettingsWriteInput[K]
  ) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    setSubmitError(null);
    setSubmitMessage(null);

    try {
      const nextSettings = createNotificationSettingsWriteInput({
        ...draft,
        fxVolatilityAlertsEnabled: isPremium ? draft.fxVolatilityAlertsEnabled : false,
      });

      await upsertSettingsMutation.mutateAsync(nextSettings);
      setSubmitMessage('Notification preferences were saved.');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Could not save notification settings.'
      );
    }
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
          <ThemedView type="surfaceElevated" style={styles.heroCard}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Notifications
            </ThemedText>
            <ThemedText type="title">Reminder settings</ThemedText>
            <ThemedText themeColor="textSecondary">
              Choose how early Paynesto should highlight billing, trial, and FX-sensitive subscription events.
            </ThemedText>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Settings source: {settingsQuery.data.source === 'preview' ? 'Preview mode' : 'Supabase sync'}
            </ThemedText>
          </ThemedView>

          <SectionCard
            eyebrow="Reminder lead time"
            title={`${draft.reminderLeadDays} day notice`}
            description="Use a shorter lead time if you only want reminders near the billing date.">
            <SubscriptionOptionGroup
              label="How early should reminders appear?"
              helperText="This applies to billing and trial reminder timing."
              value={draft.reminderLeadDays}
              options={reminderLeadDayOptions}
              labels={reminderLeadDayLabels}
              onChange={(value) => updateDraft('reminderLeadDays', value)}
            />
          </SectionCard>

          <SettingToggleCard
            title="Billing reminders"
            description="Stay ahead of the next subscription payment before it lands."
            value={draft.billingRemindersEnabled}
            onChange={(value) => updateDraft('billingRemindersEnabled', value)}
          />

          <SettingToggleCard
            title="Trial ending reminders"
            description="Get nudged before a free trial starts charging as a paid plan."
            value={draft.trialEndingRemindersEnabled}
            onChange={(value) => updateDraft('trialEndingRemindersEnabled', value)}
          />

          <SettingToggleCard
            title="FX volatility alerts"
            description="Receive alerts when USD subscription estimates move enough to review."
            value={isPremium ? draft.fxVolatilityAlertsEnabled : false}
            disabled={!isPremium}
            helperText={getFxAlertGateCopy(isPremium)}
            actionLabel={!isPremium ? 'View Premium' : undefined}
            onAction={!isPremium ? () => router.push('/my-page/premium' as Href) : undefined}
            onChange={(value) => updateDraft('fxVolatilityAlertsEnabled', value)}
          />

          <SettingToggleCard
            title="Product updates"
            description="Receive occasional updates about new Paynesto planning features."
            value={draft.marketingUpdatesEnabled}
            onChange={(value) => updateDraft('marketingUpdatesEnabled', value)}
          />

          <SectionCard
            eyebrow="Delivery note"
            title="Preference management is ready"
            description="This step stores account preferences first. Native push scheduling and device permission prompts can be connected in a later step."
          />

          <SectionCard
            eyebrow="Schedule preview"
            title={
              schedulePreview.length > 0
                ? `${schedulePreview.length} reminder candidate(s)`
                : 'No upcoming reminder candidates'
            }
            description={
              schedulePreview.length > 0
                ? 'This preview shows what Paynesto would schedule next from your current settings and subscriptions.'
                : subscriptions.length > 0
                  ? 'Your current settings do not produce any future reminder windows yet.'
                  : 'Add subscriptions first to generate billing and trial reminder candidates.'
            }>
            {schedulePreview.length > 0 ? (
              <View style={styles.previewList}>
                {schedulePreview.slice(0, 5).map((item) => (
                  <View key={item.id} style={styles.previewItem}>
                    <ThemedText type="smallBold">{item.title}</ThemedText>
                    <ThemedText type="bodySm" themeColor="textSecondary">
                      {formatNotificationScheduleKind(item.kind)} · {formatAppDate(item.scheduledFor, 'yyyy.MM.dd')}
                    </ThemedText>
                    <ThemedText type="bodySm" themeColor="textSecondary">
                      {item.description}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.previewList}>
                <ThemedText themeColor="textSecondary">
                  - Billing reminders need an active subscription with enough lead time before the next billing date.
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  - Trial reminders need an active trial subscription with a trial end date.
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  - FX watch reminders only appear for premium users with active USD subscriptions.
                </ThemedText>
              </View>
            )}
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

          <View style={styles.actionsRow}>
            <Button loading={upsertSettingsMutation.isPending} onPress={() => void handleSave()}>
              Save settings
            </Button>
            <Button variant="secondary" onPress={() => router.back()}>
              Back
            </Button>
          </View>
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
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  previewList: {
    gap: Spacing.two,
  },
  previewItem: {
    gap: Spacing.one,
  },
});
