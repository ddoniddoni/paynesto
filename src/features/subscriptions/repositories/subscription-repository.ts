import { hasSupabaseClientEnv } from '@/lib/env';
import type {
  Subscription,
  SubscriptionDataSource,
  SubscriptionWriteInput,
} from '@/types/domain';

import { previewSubscriptionRepository } from './preview-subscription-repository';
import { supabaseSubscriptionRepository } from './supabase-subscription-repository';

export type RepositoryResult<T> = {
  data: T;
  source: SubscriptionDataSource;
};

export type SubscriptionRepository = {
  list: (userId: string) => Promise<RepositoryResult<Subscription[]>>;
  getById: (userId: string, subscriptionId: string) => Promise<RepositoryResult<Subscription | null>>;
  create: (
    userId: string,
    input: SubscriptionWriteInput
  ) => Promise<RepositoryResult<Subscription>>;
  update: (
    userId: string,
    subscriptionId: string,
    input: SubscriptionWriteInput
  ) => Promise<RepositoryResult<Subscription>>;
  remove: (userId: string, subscriptionId: string) => Promise<RepositoryResult<null>>;
};

export function getSubscriptionRepository(): SubscriptionRepository {
  return hasSupabaseClientEnv ? supabaseSubscriptionRepository : previewSubscriptionRepository;
}
