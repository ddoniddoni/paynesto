import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { parseISO } from 'date-fns';
import { Platform } from 'react-native';

import type {
  NotificationDeliverySnapshot,
  NotificationPermissionState,
  NotificationSyncInput,
  NotificationSyncResult,
} from '@/features/notifications/types/notification-delivery';
import {
  PAYNESTO_NOTIFICATION_CHANNEL_ID,
  buildPaynestoNotificationRequests,
  createNotificationCapability,
  isPaynestoNotificationIdentifier,
  mapNotificationPermissionStatus,
  mapStoredNotificationDataToScheduledNotification,
} from '@/features/notifications/utils/notification-delivery-utils';

let hasConfiguredNotificationRuntime = false;

function getPermissionState(status: Notifications.NotificationPermissionsStatus) {
  const permissionResponse = status as Notifications.NotificationPermissionsStatus & {
    granted?: boolean;
    status?: string;
  };

  if (permissionResponse.granted) {
    return 'granted' satisfies NotificationPermissionState;
  }

  if (permissionResponse.status) {
    return mapNotificationPermissionStatus(permissionResponse.status);
  }

  if (
    status.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    status.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
  ) {
    return 'granted' satisfies NotificationPermissionState;
  }

  if (status.ios?.status === Notifications.IosAuthorizationStatus.DENIED) {
    return 'denied' satisfies NotificationPermissionState;
  }

  return 'undetermined' satisfies NotificationPermissionState;
}

function isNativeNotificationEnvironment() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(PAYNESTO_NOTIFICATION_CHANNEL_ID, {
    name: 'Billing reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function createUnsupportedSnapshot(): NotificationDeliverySnapshot {
  return {
    capability: createNotificationCapability({
      platformOs: Platform.OS,
      isPhysicalDevice: Device.isDevice,
      permissionStatus: 'unsupported',
    }),
    scheduledNotifications: [],
  };
}

async function getPaynestoScheduledNotifications() {
  const requests = await Notifications.getAllScheduledNotificationsAsync();

  return requests
    .filter((request) => isPaynestoNotificationIdentifier(request.identifier))
    .map((request) =>
      mapStoredNotificationDataToScheduledNotification({
        identifier: request.identifier,
        title: request.content.title,
        body: request.content.body,
        data: request.content.data ?? {},
      })
    )
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((left, right) => left.scheduledFor.localeCompare(right.scheduledFor));
}

export async function configureNotificationRuntime() {
  if (!isNativeNotificationEnvironment() || hasConfiguredNotificationRuntime) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  await ensureNotificationChannel();
  hasConfiguredNotificationRuntime = true;
}

export async function getNotificationDeliverySnapshot(): Promise<NotificationDeliverySnapshot> {
  if (!isNativeNotificationEnvironment()) {
    return createUnsupportedSnapshot();
  }

  await configureNotificationRuntime();
  const permissionResponse = await Notifications.getPermissionsAsync();

  return {
    capability: createNotificationCapability({
      platformOs: Platform.OS,
      isPhysicalDevice: Device.isDevice,
      permissionStatus: getPermissionState(permissionResponse),
    }),
    scheduledNotifications: await getPaynestoScheduledNotifications(),
  };
}

export async function requestNotificationPermission(): Promise<NotificationDeliverySnapshot> {
  if (!isNativeNotificationEnvironment()) {
    return createUnsupportedSnapshot();
  }

  await configureNotificationRuntime();
  const permissionResponse = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return {
    capability: createNotificationCapability({
      platformOs: Platform.OS,
      isPhysicalDevice: Device.isDevice,
      permissionStatus: getPermissionState(permissionResponse),
    }),
    scheduledNotifications: await getPaynestoScheduledNotifications(),
  };
}

export async function syncNotificationSchedule({
  items,
  now = new Date(),
}: NotificationSyncInput): Promise<NotificationSyncResult> {
  const snapshot = await getNotificationDeliverySnapshot();

  if (!snapshot.capability.isSupported) {
    return {
      status: 'unsupported',
      scheduledCount: 0,
      canceledCount: 0,
      skippedCount: items.length,
      scheduledNotifications: [],
      message: 'This environment can preview reminders, but local device delivery needs an iOS or Android build.',
    };
  }

  if (snapshot.capability.permissionStatus !== 'granted') {
    return {
      status: 'permission_required',
      scheduledCount: 0,
      canceledCount: 0,
      skippedCount: items.length,
      scheduledNotifications: snapshot.scheduledNotifications,
      message: 'Enable notifications first, then sync reminders to this device.',
    };
  }

  await configureNotificationRuntime();

  const existingRequests = await Notifications.getAllScheduledNotificationsAsync();
  const paynestoIdentifiers = existingRequests
    .filter((request) => isPaynestoNotificationIdentifier(request.identifier))
    .map((request) => request.identifier);

  await Promise.all(
    paynestoIdentifiers.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier)
    )
  );

  const buildResult = buildPaynestoNotificationRequests(items, now);

  for (const request of buildResult.requests) {
    await Notifications.scheduleNotificationAsync({
      identifier: request.identifier,
      content: {
        title: request.title,
        body: request.body,
        data: request.data,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: parseISO(request.scheduledFor),
        channelId: Platform.OS === 'android' ? PAYNESTO_NOTIFICATION_CHANNEL_ID : undefined,
      },
    });
  }

  return {
    status: 'success',
    scheduledCount: buildResult.requests.length,
    canceledCount: paynestoIdentifiers.length,
    skippedCount: buildResult.skippedCount,
    scheduledNotifications: await getPaynestoScheduledNotifications(),
  };
}
