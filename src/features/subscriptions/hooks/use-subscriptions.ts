import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { getSubscriptionRepository } from '@/features/subscriptions/repositories/subscription-repository';
import type { SubscriptionWriteInput } from '@/types/domain';

const subscriptionKeys = {
  all: ['subscriptions'] as const,
  list: (userId: string) => [...subscriptionKeys.all, userId] as const,
  detail: (userId: string, subscriptionId: string) =>
    [...subscriptionKeys.list(userId), subscriptionId] as const,
};

function useUserId() {
  const { user } = useAuthSession();

  if (!user?.id) {
    throw new Error('로그인된 사용자 정보가 필요합니다.');
  }

  return user.id;
}

export function useSubscriptionsQuery() {
  const userId = useUserId();

  return useQuery({
    queryKey: subscriptionKeys.list(userId),
    queryFn: () => getSubscriptionRepository(userId).list(userId),
  });
}

export function useSubscriptionQuery(subscriptionId: string) {
  const userId = useUserId();

  return useQuery({
    enabled: Boolean(subscriptionId),
    queryKey: subscriptionKeys.detail(userId, subscriptionId),
    queryFn: () => getSubscriptionRepository(userId).getById(userId, subscriptionId),
  });
}

export function useCreateSubscriptionMutation() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubscriptionWriteInput) =>
      getSubscriptionRepository(userId).create(userId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: subscriptionKeys.list(userId) });
    },
  });
}

export function useUpdateSubscriptionMutation(subscriptionId: string) {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubscriptionWriteInput) =>
      getSubscriptionRepository(userId).update(userId, subscriptionId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.list(userId) }),
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(userId, subscriptionId) }),
      ]);
    },
  });
}

export function useDeleteSubscriptionMutation(subscriptionId: string) {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getSubscriptionRepository(userId).remove(userId, subscriptionId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
        queryClient.removeQueries({ queryKey: subscriptionKeys.detail(userId, subscriptionId) }),
      ]);
    },
  });
}
