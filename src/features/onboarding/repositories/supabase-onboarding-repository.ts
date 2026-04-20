import { assertSupabaseConfigured } from '@/services/supabase';
import type { OnboardingCompletionInput, OnboardingStatus } from '@/types/domain';

import type { OnboardingRepository } from './onboarding-repository';
import { previewOnboardingRepository } from './preview-onboarding-repository';

type OnboardingStatusRecord = {
  id: string;
  user_id: string;
  completed_at: string | null;
  skipped_at: string | null;
  created_at: string;
  updated_at: string;
};

function shouldFallbackToPreview(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('onboarding_statuses') &&
    (normalized.includes('does not exist') ||
      normalized.includes('schema cache') ||
      normalized.includes('could not find the table'))
  );
}

function mapRecordToStatus(record: OnboardingStatusRecord): OnboardingStatus {
  return {
    id: record.id,
    userId: record.user_id,
    completedAt: record.completed_at ?? undefined,
    skippedAt: record.skipped_at ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapInputToRecord(userId: string, input: OnboardingCompletionInput) {
  const timestamp = new Date().toISOString();

  return {
    user_id: userId,
    completed_at: input.kind === 'completed' ? timestamp : null,
    skipped_at: input.kind === 'skipped' ? timestamp : null,
  };
}

export const supabaseOnboardingRepository: OnboardingRepository = {
  async getStatus(userId) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('onboarding_statuses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (shouldFallbackToPreview(error.message)) {
        return previewOnboardingRepository.getStatus(userId);
      }

      throw new Error(error.message);
    }

    return {
      data: data ? mapRecordToStatus(data as OnboardingStatusRecord) : null,
      source: 'supabase',
    };
  },

  async finish(userId, input) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('onboarding_statuses')
      .upsert(mapInputToRecord(userId, input), { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      if (shouldFallbackToPreview(error.message)) {
        return previewOnboardingRepository.finish(userId, input);
      }

      throw new Error(error.message);
    }

    return {
      data: mapRecordToStatus(data as OnboardingStatusRecord),
      source: 'supabase',
    };
  },
};
