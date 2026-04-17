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
import {
  useNotificationDeliverySnapshotQuery,
  useRequestNotificationPermissionMutation,
  useSyncNotificationScheduleMutation,
} from '@/features/notifications/hooks/use-notification-delivery';
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
import { PREVIEW_USER_ID } from '@/features/auth/utils/preview-user';

const reminderLeadDayOptions: readonly NotificationLeadDays[] = [1, 3, 7];

export function NotificationSettingsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const settingsQuery = useNotificationSettingsQuery();
  const premiumTransactionsQuery = usePremiumTransactionsQuery();
  const subscriptionsQuery = useSubscriptionsQuery();
  const upsertSettingsMutation = useUpsertNotificationSettingsMutation();
  const deliveryQuery = useNotificationDeliverySnapshotQuery();
  const requestPermissionMutation = useRequestNotificationPermissionMutation();
  const syncScheduleMutation = useSyncNotificationScheduleMutation();
  const [draft, setDraft] = useState<NotificationSettingsWriteInput | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
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
        userId: PREVIEW_USER_ID,
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
  const capability = deliveryQuery.data?.capability ?? null;
  const scheduledNotifications = deliveryQuery.data?.scheduledNotifications ?? [];

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

  async function handleEnableNotifications() {
    setDeliveryError(null);
    setDeliveryMessage(null);

    try {
      const result = await requestPermissionMutation.mutateAsync();

      setDeliveryMessage(
        result.capability.permissionStatus === 'granted'
          ? 'Notifications are enabled for this device.'
          : result.capability.permissionStatus === 'denied'
            ? 'Notifications were denied. You can re-enable them from system settings.'
            : 'Notification permission was not granted yet.'
      );
    } catch (error) {
      setDeliveryError(
        error instanceof Error ? error.message : 'Could not update notification permission.'
      );
    }
  }

  async function handleSyncSchedule() {
    if (!draft) {
      return;
    }

    setSubmitError(null);
    setSubmitMessage(null);
    setDeliveryError(null);
    setDeliveryMessage(null);

    try {
      const nextSettings = createNotificationSettingsWriteInput({
        ...draft,
        fxVolatilityAlertsEnabled: isPremium ? draft.fxVolatilityAlertsEnabled : false,
      });

      await upsertSettingsMutation.mutateAsync(nextSettings);
      setSubmitMessage('Notification preferences were saved.');

      const result = await syncScheduleMutation.mutateAsync(schedulePreview);

      if (result.status === 'success') {
        const skippedCopy =
          result.skippedCount > 0
            ? ` ${result.skippedCount} old or extra item(s) were skipped.`
            : '';
        setDeliveryMessage(
          `${result.scheduledCount} reminder(s) synced to this device.${skippedCopy}`
        );
        return;
      }

      setDeliveryMessage(result.message);
    } catch (error) {
      setDeliveryError(
        error instanceof Error ? error.message : 'Could not sync reminders to this device.'
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
            title={capability ? capability.environmentLabel : 'Preparing device delivery'}
            description={
              capability
                ? capability.detail
                : 'We are checking whether local reminder delivery is available in this runtime.'
            }>
            {deliveryQuery.isPending ? (
              <ThemedText themeColor="textSecondary">
                Checking notification permissions and scheduled reminders...
              </ThemedText>
            ) : deliveryQuery.isError ? (
              <View style={styles.previewList}>
                <ThemedText themeColor="danger">
                  {deliveryQuery.error instanceof Error
                    ? deliveryQuery.error.message
                    : 'Could not inspect device notification state.'}
                </ThemedText>
                <Button variant="secondary" onPress={() => void deliveryQuery.refetch()}>
                  Retry delivery check
                </Button>
              </View>
            ) : capability ? (
              <View style={styles.previewList}>
                <ThemedText type="bodySm" themeColor="textSecondary">
                  Permission: {capability.permissionStatus}
                </ThemedText>
                <ThemedText type="bodySm" themeColor="textSecondary">
                  Scheduled on device: {scheduledNotifications.length}
                </ThemedText>
                <View style={styles.actionsRow}>
                  {capability.canRequestPermission ? (
                    <Button
                      variant="secondary"
                      loading={requestPermissionMutation.isPending}
                      onPress={() => void handleEnableNotifications()}>
                      Enable notifications
                    </Button>
                  ) : null}
                  <Button
                    loading={syncScheduleMutation.isPending || upsertSettingsMutation.isPending}
                    disabled={!capability.isSupported || capability.permissionStatus !== 'granted'}
                    onPress={() => void handleSyncSchedule()}>
                    Save and sync reminders
                  </Button>
                </View>
              </View>
            ) : null}
          </SectionCard>

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

          <SectionCard
            eyebrow="Scheduled on device"
            title={
              scheduledNotifications.length > 0
                ? `${scheduledNotifications.length} device reminder(s)`
                : 'No synced device reminders'
            }
            description={
              capability?.permissionStatus === 'granted'
                ? 'These are the reminders currently scheduled through Expo local notifications.'
                : 'Grant permission and sync reminders to create on-device notification requests.'
            }>
            {deliveryQuery.isPending ? (
              <ThemedText themeColor="textSecondary">
                Loading scheduled reminder requests...
              </ThemedText>
            ) : deliveryQuery.isError ? (
              <ThemedText themeColor="danger">
                {deliveryQuery.error instanceof Error
                  ? deliveryQuery.error.message
                  : 'Could not load scheduled reminders.'}
              </ThemedText>
            ) : scheduledNotifications.length > 0 ? (
              <View style={styles.previewList}>
                {scheduledNotifications.slice(0, 5).map((item) => (
                  <View key={item.identifier} style={styles.previewItem}>
                    <ThemedText type="smallBold">{item.title}</ThemedText>
                    <ThemedText type="bodySm" themeColor="textSecondary">
                      {formatNotificationScheduleKind(item.kind)} on{' '}
                      {formatAppDate(item.scheduledFor, 'yyyy.MM.dd')}
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
                  - Save and sync reminders after enabling notifications to schedule billing and trial alerts.
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  - Paynesto currently keeps a small upcoming reminder set on device so the schedule stays easy to review.
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

          {deliveryError ? (
            <ThemedText type="bodySm" themeColor="danger">
              {deliveryError}
            </ThemedText>
          ) : null}

          {deliveryMessage ? (
            <ThemedText type="bodySm" themeColor="success">
              {deliveryMessage}
            </ThemedText>
          ) : null}

          <View style={styles.actionsRow}>
            <Button
              loading={upsertSettingsMutation.isPending && !syncScheduleMutation.isPending}
              onPress={() => void handleSave()}>
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
