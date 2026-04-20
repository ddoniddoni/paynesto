import { describe, expect, it } from 'vitest';

import {
  MAX_DEVICE_NOTIFICATION_SCHEDULE,
  PAYNESTO_NOTIFICATION_PREFIX,
  buildPaynestoNotificationRequests,
  createNotificationCapability,
  createPaynestoNotificationIdentifier,
  isPaynestoNotificationIdentifier,
  mapStoredNotificationDataToScheduledNotification,
} from '@/features/notifications/utils/notification-delivery-utils';
import type { NotificationScheduleItem } from '@/types/domain';

const baseScheduleItem: NotificationScheduleItem = {
  id: 'billing-netflix',
  kind: 'billing_reminder',
  subscriptionId: 'sub-1',
  serviceName: 'Netflix',
  title: 'Netflix billing reminder',
  description: 'Remind 3 days before billing.',
  scheduledFor: '2026-04-20T00:00:00.000Z',
  sourceDate: '2026-04-23',
  requiresPremium: false,
};

describe('notification delivery utils', () => {
  it('creates unsupported capability state for web', () => {
    expect(
      createNotificationCapability({
        platformOs: 'web',
        isPhysicalDevice: false,
        permissionStatus: 'unsupported',
      })
    ).toMatchObject({
      isSupported: false,
      permissionStatus: 'unsupported',
      canRequestPermission: false,
    });
  });

  it('creates deterministic Paynesto notification identifiers', () => {
    expect(createPaynestoNotificationIdentifier(baseScheduleItem)).toBe(
      `${PAYNESTO_NOTIFICATION_PREFIX}billing_reminder:sub-1`
    );
    expect(isPaynestoNotificationIdentifier(`${PAYNESTO_NOTIFICATION_PREFIX}trial_ending_reminder:sub-2`)).toBe(true);
    expect(isPaynestoNotificationIdentifier('other-app:123')).toBe(false);
  });

  it('builds future notification requests and skips past items', () => {
    const result = buildPaynestoNotificationRequests(
      [
        baseScheduleItem,
        {
          ...baseScheduleItem,
          id: 'past-item',
          scheduledFor: '2026-04-10T00:00:00.000Z',
        },
      ],
      new Date('2026-04-15T00:00:00.000Z')
    );

    expect(result.requests).toHaveLength(1);
    expect(result.skippedCount).toBe(1);
    expect(result.requests[0]).toMatchObject({
      identifier: `${PAYNESTO_NOTIFICATION_PREFIX}billing_reminder:sub-1`,
      title: 'Netflix billing reminder',
    });
  });

  it('caps the number of device schedules to the configured maximum', () => {
    const items = Array.from({ length: MAX_DEVICE_NOTIFICATION_SCHEDULE + 2 }, (_, index) => ({
      ...baseScheduleItem,
      id: `item-${index}`,
      subscriptionId: `sub-${index}`,
      scheduledFor: `2026-04-${String(20 + index).padStart(2, '0')}T00:00:00.000Z`,
      sourceDate: `2026-04-${String(23 + index).padStart(2, '0')}`,
    }));

    const result = buildPaynestoNotificationRequests(items, new Date('2026-04-15T00:00:00.000Z'));

    expect(result.requests).toHaveLength(MAX_DEVICE_NOTIFICATION_SCHEDULE);
    expect(result.skippedCount).toBe(2);
  });

  it('maps stored notification data back into a scheduled reminder shape', () => {
    expect(
      mapStoredNotificationDataToScheduledNotification({
        identifier: `${PAYNESTO_NOTIFICATION_PREFIX}billing_reminder:sub-1`,
        title: 'Netflix billing reminder',
        body: 'Remind 3 days before billing.',
        data: {
          kind: 'billing_reminder',
          scheduledFor: '2026-04-20T00:00:00.000Z',
          serviceName: 'Netflix',
        },
      })
    ).toEqual({
      identifier: `${PAYNESTO_NOTIFICATION_PREFIX}billing_reminder:sub-1`,
      kind: 'billing_reminder',
      title: 'Netflix billing reminder',
      description: 'Remind 3 days before billing.',
      scheduledFor: '2026-04-20T00:00:00.000Z',
      serviceName: 'Netflix',
    });
  });
});
