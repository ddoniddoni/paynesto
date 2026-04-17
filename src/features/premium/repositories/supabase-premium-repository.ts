import { assertSupabaseConfigured } from '@/services/supabase';
import type { PremiumCheckoutInput, PremiumTransaction } from '@/types/domain';

import { createPremiumExpiryDate } from '@/features/premium/utils/premium-utils';

import { previewPremiumRepository } from './preview-premium-repository';
import type { PremiumRepository } from './premium-repository';

type PremiumTransactionRecord = {
  id: string;
  user_id: string;
  plan_id: string;
  status: PremiumTransaction['status'];
  billing_cycle: PremiumTransaction['billingCycle'];
  price_usd: number;
  purchased_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

function shouldFallbackToPreview(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('premium_transactions') &&
    (normalized.includes('does not exist') ||
      normalized.includes('schema cache') ||
      normalized.includes('could not find the table'))
  );
}

function mapRecordToTransaction(record: PremiumTransactionRecord): PremiumTransaction {
  return {
    id: record.id,
    userId: record.user_id,
    planId: record.plan_id,
    status: record.status,
    billingCycle: record.billing_cycle,
    priceUsd: record.price_usd,
    purchasedAt: record.purchased_at,
    expiresAt: record.expires_at ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapInputToRecord(userId: string, input: PremiumCheckoutInput) {
  const timestamp = new Date().toISOString();

  return {
    user_id: userId,
    plan_id: input.planId,
    status: 'active' as const,
    billing_cycle: input.billingCycle,
    price_usd: input.priceUsd,
    purchased_at: timestamp,
    expires_at: createPremiumExpiryDate(timestamp, input.billingCycle),
  };
}

export const supabasePremiumRepository: PremiumRepository = {
  async listTransactions(userId) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('premium_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (shouldFallbackToPreview(error.message)) {
        return previewPremiumRepository.listTransactions(userId);
      }

      throw new Error(error.message);
    }

    return {
      data: (data as PremiumTransactionRecord[]).map(mapRecordToTransaction),
      source: 'supabase',
    };
  },

  async activatePlan(userId, input) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('premium_transactions')
      .insert(mapInputToRecord(userId, input))
      .select('*')
      .single();

    if (error) {
      if (shouldFallbackToPreview(error.message)) {
        return previewPremiumRepository.activatePlan(userId, input);
      }

      throw new Error(error.message);
    }

    return {
      data: mapRecordToTransaction(data as PremiumTransactionRecord),
      source: 'supabase',
    };
  },
};
