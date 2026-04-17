import type { Subscription } from '@/types/domain';
import { getNormalizedPreviewUserId } from '@/features/auth/utils/preview-user';

import type { SubscriptionRepository } from './subscription-repository';

const previewSeed: Omit<Subscription, 'userId'>[] = [
  {
    id: 'preview-netflix',
    serviceName: 'Netflix Premium',
    category: 'OTT',
    billingCycle: 'monthly',
    amount: 17000,
    currency: 'KRW',
    paymentMethodType: 'card',
    nextBillingDate: '2026-04-19',
    isTrial: false,
    usageFrequency: 'high',
    isActive: true,
    createdAt: '2026-04-01T09:00:00.000Z',
    updatedAt: '2026-04-01T09:00:00.000Z',
  },
  {
    id: 'preview-chatgpt',
    serviceName: 'ChatGPT Plus',
    category: 'AI',
    billingCycle: 'monthly',
    amount: 20,
    currency: 'USD',
    paymentMethodType: 'card',
    nextBillingDate: '2026-04-20',
    isTrial: false,
    usageFrequency: 'high',
    note: '업무 자동화와 글쓰기용',
    isActive: true,
    createdAt: '2026-04-03T09:00:00.000Z',
    updatedAt: '2026-04-03T09:00:00.000Z',
  },
  {
    id: 'preview-watcha',
    serviceName: 'Watcha Trial',
    category: 'OTT',
    billingCycle: 'monthly',
    amount: 7900,
    currency: 'KRW',
    paymentMethodType: 'card',
    nextBillingDate: '2026-04-17',
    isTrial: true,
    trialEndDate: '2026-04-17',
    usageFrequency: 'low',
    isActive: true,
    createdAt: '2026-04-12T09:00:00.000Z',
    updatedAt: '2026-04-12T09:00:00.000Z',
  },
];

const previewDb = new Map<string, Subscription[]>();

function getUserIdOrPreview(userId: string) {
  return getNormalizedPreviewUserId(userId);
}

function sortSubscriptions(subscriptions: Subscription[]) {
  return subscriptions
    .slice()
    .sort((left, right) => left.nextBillingDate.localeCompare(right.nextBillingDate));
}

function ensureSubscriptions(userId: string) {
  const normalizedUserId = getUserIdOrPreview(userId);

  if (!previewDb.has(normalizedUserId)) {
    previewDb.set(
      normalizedUserId,
      previewSeed.map((subscription) => ({
        ...subscription,
        userId: normalizedUserId,
      }))
    );
  }

  return previewDb.get(normalizedUserId) ?? [];
}

function createPreviewId() {
  return `preview-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const previewSubscriptionRepository: SubscriptionRepository = {
  async list(userId) {
    return {
      data: sortSubscriptions(ensureSubscriptions(userId)),
      source: 'preview',
    };
  },

  async getById(userId, subscriptionId) {
    const subscriptions = ensureSubscriptions(userId);

    return {
      data: subscriptions.find((subscription) => subscription.id === subscriptionId) ?? null,
      source: 'preview',
    };
  },

  async create(userId, input) {
    const normalizedUserId = getUserIdOrPreview(userId);
    const subscriptions = ensureSubscriptions(normalizedUserId);
    const timestamp = new Date().toISOString();
    const nextSubscription: Subscription = {
      ...input,
      id: createPreviewId(),
      userId: normalizedUserId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    previewDb.set(normalizedUserId, sortSubscriptions([...subscriptions, nextSubscription]));

    return {
      data: nextSubscription,
      source: 'preview',
    };
  },

  async update(userId, subscriptionId, input) {
    const normalizedUserId = getUserIdOrPreview(userId);
    const subscriptions = ensureSubscriptions(normalizedUserId);
    const current = subscriptions.find((subscription) => subscription.id === subscriptionId);

    if (!current) {
      throw new Error('수정할 구독을 찾을 수 없어요.');
    }

    const updatedSubscription: Subscription = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    previewDb.set(
      normalizedUserId,
      sortSubscriptions(
        subscriptions.map((subscription) =>
          subscription.id === subscriptionId ? updatedSubscription : subscription
        )
      )
    );

    return {
      data: updatedSubscription,
      source: 'preview',
    };
  },

  async remove(userId, subscriptionId) {
    const normalizedUserId = getUserIdOrPreview(userId);
    const subscriptions = ensureSubscriptions(normalizedUserId);

    previewDb.set(
      normalizedUserId,
      subscriptions.filter((subscription) => subscription.id !== subscriptionId)
    );

    return {
      data: null,
      source: 'preview',
    };
  },
};
