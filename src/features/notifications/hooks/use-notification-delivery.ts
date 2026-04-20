import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getNotificationDeliverySnapshot,
  requestNotificationPermission,
  syncNotificationSchedule,
} from '@/features/notifications/services/notification-device-service';
import type { NotificationScheduleItem } from '@/types/domain';

const notificationDeliveryKeys = {
  all: ['notification-delivery'] as const,
  snapshot: () => [...notificationDeliveryKeys.all, 'snapshot'] as const,
};

export function useNotificationDeliverySnapshotQuery() {
  return useQuery({
    queryKey: notificationDeliveryKeys.snapshot(),
    queryFn: getNotificationDeliverySnapshot,
  });
}

export function useRequestNotificationPermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestNotificationPermission,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationDeliveryKeys.all });
    },
  });
}

export function useSyncNotificationScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: NotificationScheduleItem[]) => syncNotificationSchedule({ items }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationDeliveryKeys.all });
    },
  });
}
