import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { getPremiumRepository } from '@/features/premium/repositories/premium-repository';
import type { PremiumCheckoutInput } from '@/types/domain';

const premiumKeys = {
  all: ['premium'] as const,
  transactions: (userId: string) => [...premiumKeys.all, userId] as const,
};

function useUserId() {
  const { user } = useAuthSession();

  if (!user?.id) {
    throw new Error('An authenticated user is required to open premium.');
  }

  return user.id;
}

export function usePremiumTransactionsQuery() {
  const userId = useUserId();

  return useQuery({
    queryKey: premiumKeys.transactions(userId),
    queryFn: () => getPremiumRepository(userId).listTransactions(userId),
  });
}

export function useActivatePremiumPlanMutation() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PremiumCheckoutInput) =>
      getPremiumRepository(userId).activatePlan(userId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: premiumKeys.transactions(userId) });
    },
  });
}
