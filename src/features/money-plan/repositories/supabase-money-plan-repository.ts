import { assertSupabaseConfigured } from '@/services/supabase';
import type { UserFinancialProfile, UserFinancialProfileWriteInput } from '@/types/domain';

import { previewMoneyPlanRepository } from './preview-money-plan-repository';
import type { MoneyPlanRepository } from './money-plan-repository';

type FinancialProfileRecord = {
  id: string;
  user_id: string;
  monthly_net_salary: number;
  monthly_fixed_costs: number;
  created_at: string;
  updated_at: string;
};

function shouldFallbackToPreview(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('user_financial_profiles') &&
    (normalized.includes('does not exist') ||
      normalized.includes('schema cache') ||
      normalized.includes('could not find the table'))
  );
}

function mapRecordToProfile(record: FinancialProfileRecord): UserFinancialProfile {
  return {
    id: record.id,
    userId: record.user_id,
    monthlyNetSalary: record.monthly_net_salary,
    monthlyFixedCosts: record.monthly_fixed_costs,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapInputToRecord(userId: string, input: UserFinancialProfileWriteInput) {
  return {
    user_id: userId,
    monthly_net_salary: input.monthlyNetSalary,
    monthly_fixed_costs: input.monthlyFixedCosts,
  };
}

export const supabaseMoneyPlanRepository: MoneyPlanRepository = {
  async getProfile(userId) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('user_financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (shouldFallbackToPreview(error.message)) {
        return previewMoneyPlanRepository.getProfile(userId);
      }

      throw new Error(error.message);
    }

    return {
      data: data ? mapRecordToProfile(data as FinancialProfileRecord) : null,
      source: 'supabase',
    };
  },

  async upsertProfile(userId, input) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('user_financial_profiles')
      .upsert(mapInputToRecord(userId, input), { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      if (shouldFallbackToPreview(error.message)) {
        return previewMoneyPlanRepository.upsertProfile(userId, input);
      }

      throw new Error(error.message);
    }

    return {
      data: mapRecordToProfile(data as FinancialProfileRecord),
      source: 'supabase',
    };
  },
};
