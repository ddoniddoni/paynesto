import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { getOnboardingRepository } from '@/features/onboarding/repositories/onboarding-repository';
import type { OnboardingCompletionInput } from '@/types/domain';

const onboardingKeys = {
  all: ['onboarding'] as const,
  status: (userId: string) => [...onboardingKeys.all, userId] as const,
};

function isSignedInStatus(status: string) {
  return status === 'authenticated' || status === 'preview';
}

function useRequiredUserId() {
  const { user } = useAuthSession();

  if (!user?.id) {
    throw new Error('An authenticated user is required to update onboarding.');
  }

  return user.id;
}

export function useOnboardingStatusQuery() {
  const { status, user } = useAuthSession();
  const userId = user?.id ?? 'anonymous';
  const enabled = isSignedInStatus(status) && Boolean(user?.id);

  return useQuery({
    queryKey: onboardingKeys.status(userId),
    queryFn: () => getOnboardingRepository(userId).getStatus(userId),
    enabled,
  });
}

export function useFinishOnboardingMutation() {
  const userId = useRequiredUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OnboardingCompletionInput) =>
      getOnboardingRepository(userId).finish(userId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: onboardingKeys.status(userId) });
    },
  });
}
