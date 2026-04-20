import AsyncStorage from '@react-native-async-storage/async-storage';

import { getNormalizedPreviewUserId } from '@/features/auth/utils/preview-user';
import type { OnboardingCompletionInput, OnboardingStatus } from '@/types/domain';

import type { OnboardingRepository } from './onboarding-repository';

const STORAGE_PREFIX = 'paynesto.onboarding-status';
const memoryDb = new Map<string, OnboardingStatus>();

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}.${getNormalizedPreviewUserId(userId)}`;
}

function createPreviewId(userId: string) {
  return `onboarding-${getNormalizedPreviewUserId(userId)}-${Date.now().toString(36)}`;
}

function createFinishedStatus(
  userId: string,
  input: OnboardingCompletionInput,
  current?: OnboardingStatus | null
): OnboardingStatus {
  const normalizedUserId = getNormalizedPreviewUserId(userId);
  const timestamp = new Date().toISOString();

  return {
    id: current?.id ?? createPreviewId(normalizedUserId),
    userId: normalizedUserId,
    completedAt: input.kind === 'completed' ? timestamp : undefined,
    skippedAt: input.kind === 'skipped' ? timestamp : undefined,
    createdAt: current?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

async function readStatus(userId: string) {
  const normalizedUserId = getNormalizedPreviewUserId(userId);
  const memoryValue = memoryDb.get(normalizedUserId);

  if (memoryValue) {
    return memoryValue;
  }

  const storedValue = await AsyncStorage.getItem(getStorageKey(normalizedUserId));

  if (!storedValue) {
    return null;
  }

  const parsed = JSON.parse(storedValue) as OnboardingStatus;
  memoryDb.set(normalizedUserId, parsed);

  return parsed;
}

async function writeStatus(userId: string, status: OnboardingStatus) {
  const normalizedUserId = getNormalizedPreviewUserId(userId);

  memoryDb.set(normalizedUserId, status);
  await AsyncStorage.setItem(getStorageKey(normalizedUserId), JSON.stringify(status));
}

export const previewOnboardingRepository: OnboardingRepository = {
  async getStatus(userId) {
    return {
      data: await readStatus(userId),
      source: 'preview',
    };
  },

  async finish(userId, input) {
    const current = await readStatus(userId);
    const status = createFinishedStatus(userId, input, current);

    await writeStatus(userId, status);

    return {
      data: status,
      source: 'preview',
    };
  },
};
