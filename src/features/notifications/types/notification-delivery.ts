import type { NotificationScheduleItem, NotificationScheduleKind } from '@/types/domain';

export const notificationPermissionStates = [
  'granted',
  'denied',
  'undetermined',
  'unsupported',
] as const;

export type NotificationPermissionState = (typeof notificationPermissionStates)[number];

export type NotificationCapability = {
  isSupported: boolean;
  permissionStatus: NotificationPermissionState;
  canRequestPermission: boolean;
  environmentLabel: string;
  detail: string;
};

export type DeviceScheduledNotification = {
  identifier: string;
  kind: NotificationScheduleKind;
  title: string;
  description: string;
  scheduledFor: string;
  serviceName?: string;
};

export type NotificationDeliverySnapshot = {
  capability: NotificationCapability;
  scheduledNotifications: DeviceScheduledNotification[];
};

export type PaynestoNotificationRequest = {
  identifier: string;
  title: string;
  body: string;
  scheduledFor: string;
  data: {
    kind: NotificationScheduleKind;
    scheduledFor: string;
    sourceDate: string;
    requiresPremium: boolean;
    subscriptionId?: string;
    serviceName?: string;
  };
};

export type NotificationScheduleBuildResult = {
  requests: PaynestoNotificationRequest[];
  skippedCount: number;
};

export type NotificationSyncResult =
  | {
      status: 'success';
      scheduledCount: number;
      canceledCount: number;
      skippedCount: number;
      scheduledNotifications: DeviceScheduledNotification[];
    }
  | {
      status: 'permission_required' | 'unsupported';
      scheduledCount: 0;
      canceledCount: 0;
      skippedCount: number;
      scheduledNotifications: DeviceScheduledNotification[];
      message: string;
    };

export type NotificationSyncInput = {
  items: NotificationScheduleItem[];
  now?: Date;
};
