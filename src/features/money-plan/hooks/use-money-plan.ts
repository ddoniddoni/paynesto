import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { getMoneyPlanRepository } from '@/features/money-plan/repositories/money-plan-repository';
import type { UserFinancialProfileWriteInput } from '@/types/domain';

const moneyPlanKeys = {
  all: ['money-plan'] as const,
  profile: (userId: string) => [...moneyPlanKeys.all, userId] as const,
};

function useUserId() {
  const { user } = useAuthSession();

  if (!user?.id) {
    throw new Error('An authenticated user is required to open Money Plan.');
  }

  return user.id;
}

export function useFinancialProfileQuery() {
  const userId = useUserId();

  return useQuery({
    queryKey: moneyPlanKeys.profile(userId),
    queryFn: () => getMoneyPlanRepository().getProfile(userId),
  });
}

export function useUpsertFinancialProfileMutation() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UserFinancialProfileWriteInput) =>
      getMoneyPlanRepository().upsertProfile(userId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: moneyPlanKeys.profile(userId) });
    },
  });
}
