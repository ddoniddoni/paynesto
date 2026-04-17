import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { getNotificationSettingsRepository } from '@/features/settings/repositories/notification-settings-repository';
import type { NotificationSettingsWriteInput } from '@/types/domain';

const notificationSettingsKeys = {
  all: ['notification-settings'] as const,
  detail: (userId: string) => [...notificationSettingsKeys.all, userId] as const,
};

function useUserId() {
  const { user } = useAuthSession();

  if (!user?.id) {
    throw new Error('An authenticated user is required to open notification settings.');
  }

  return user.id;
}

export function useNotificationSettingsQuery() {
  const userId = useUserId();

  return useQuery({
    queryKey: notificationSettingsKeys.detail(userId),
    queryFn: () => getNotificationSettingsRepository().getSettings(userId),
  });
}

export function useUpsertNotificationSettingsMutation() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NotificationSettingsWriteInput) =>
      getNotificationSettingsRepository().upsertSettings(userId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationSettingsKeys.detail(userId) });
    },
  });
}
