import { isAfter, parseISO } from 'date-fns';

import type {
  DeviceScheduledNotification,
  NotificationCapability,
  NotificationPermissionState,
  NotificationScheduleBuildResult,
  PaynestoNotificationRequest,
} from '@/features/notifications/types/notification-delivery';
import {
  notificationScheduleKinds,
  type NotificationScheduleItem,
  type NotificationScheduleKind,
} from '@/types/domain';

export const PAYNESTO_NOTIFICATION_CHANNEL_ID = 'paynesto-reminders';
export const PAYNESTO_NOTIFICATION_PREFIX = 'paynesto:';
export const MAX_DEVICE_NOTIFICATION_SCHEDULE = 8;

function formatEnvironmentLabel(platformOs: string, isPhysicalDevice: boolean) {
  if (platformOs === 'web') {
    return 'Web preview';
  }

  if (!isPhysicalDevice) {
    return platformOs === 'ios' ? 'iOS simulator' : 'Android emulator';
  }

  return platformOs === 'ios' ? 'iPhone / iPad' : 'Android device';
}

export function isSupportedNotificationPlatform(platformOs: string) {
  return platformOs === 'ios' || platformOs === 'android';
}

export function createNotificationCapability(input: {
  platformOs: string;
  isPhysicalDevice: boolean;
  permissionStatus: NotificationPermissionState;
}): NotificationCapability {
  const isSupported = isSupportedNotificationPlatform(input.platformOs);
  const environmentLabel = formatEnvironmentLabel(input.platformOs, input.isPhysicalDevice);

  if (!isSupported) {
    return {
      isSupported: false,
      permissionStatus: 'unsupported',
      canRequestPermission: false,
      environmentLabel,
      detail: 'Local device reminders are available only in native iOS and Android builds.',
    };
  }

  if (input.permissionStatus === 'granted') {
    return {
      isSupported: true,
      permissionStatus: 'granted',
      canRequestPermission: false,
      environmentLabel,
      detail: input.isPhysicalDevice
        ? 'Local reminders are allowed on this device.'
        : 'Scheduling is available here, but actual delivery can vary in simulator or emulator environments.',
    };
  }

  if (input.permissionStatus === 'denied') {
    return {
      isSupported: true,
      permissionStatus: 'denied',
      canRequestPermission: false,
      environmentLabel,
      detail: 'Notifications were previously denied, so reminder delivery must be re-enabled from system settings.',
    };
  }

  return {
    isSupported: true,
    permissionStatus: 'undetermined',
    canRequestPermission: true,
    environmentLabel,
    detail: 'Allow notifications so Paynesto can remind you before billing dates and trial endings.',
  };
}

export function mapNotificationPermissionStatus(status: string | null | undefined) {
  if (status === 'granted' || status === 'denied') {
    return status;
  }

  return 'undetermined' satisfies NotificationPermissionState;
}

export function createPaynestoNotificationIdentifier(item: NotificationScheduleItem) {
  const baseId = item.subscriptionId ?? item.sourceDate;

  return `${PAYNESTO_NOTIFICATION_PREFIX}${item.kind}:${baseId}`;
}

export function isPaynestoNotificationIdentifier(identifier: string) {
  return identifier.startsWith(PAYNESTO_NOTIFICATION_PREFIX);
}

export function isNotificationScheduleKind(value: unknown): value is NotificationScheduleKind {
  return (
    typeof value === 'string' &&
    notificationScheduleKinds.includes(value as NotificationScheduleKind)
  );
}

function createNotificationRequest(item: NotificationScheduleItem): PaynestoNotificationRequest {
  return {
    identifier: createPaynestoNotificationIdentifier(item),
    title: item.title,
    body: item.description,
    scheduledFor: item.scheduledFor,
    data: {
      kind: item.kind,
      scheduledFor: item.scheduledFor,
      sourceDate: item.sourceDate,
      requiresPremium: item.requiresPremium,
      subscriptionId: item.subscriptionId,
      serviceName: item.serviceName,
    },
  };
}

export function buildPaynestoNotificationRequests(
  items: NotificationScheduleItem[],
  now: Date = new Date()
): NotificationScheduleBuildResult {
  const sortedItems = items
    .slice()
    .sort((left, right) => left.scheduledFor.localeCompare(right.scheduledFor));

  let skippedCount = 0;
  const requests: PaynestoNotificationRequest[] = [];

  for (const item of sortedItems) {
    const scheduledDate = parseISO(item.scheduledFor);

    if (!isAfter(scheduledDate, now)) {
      skippedCount += 1;
      continue;
    }

    if (requests.length >= MAX_DEVICE_NOTIFICATION_SCHEDULE) {
      skippedCount += 1;
      continue;
    }

    requests.push(createNotificationRequest(item));
  }

  return {
    requests,
    skippedCount,
  };
}

export function mapStoredNotificationDataToScheduledNotification(input: {
  identifier: string;
  title?: string | null;
  body?: string | null;
  data: Record<string, unknown>;
}): DeviceScheduledNotification | null {
  const { data } = input;
  const kind = data.kind;
  const scheduledFor = data.scheduledFor;

  if (!isNotificationScheduleKind(kind) || typeof scheduledFor !== 'string') {
    return null;
  }

  const serviceName =
    typeof data.serviceName === 'string' && data.serviceName.length > 0 ? data.serviceName : undefined;

  return {
    identifier: input.identifier,
    kind,
    title: input.title ?? 'Paynesto reminder',
    description: input.body ?? '',
    scheduledFor,
    serviceName,
  };
}
