import { assertSupabaseConfigured } from '@/services/supabase';
import type { Subscription, SubscriptionWriteInput } from '@/types/domain';

import type { SubscriptionRepository } from './subscription-repository';

type SubscriptionRecord = {
  id: string;
  user_id: string;
  service_name: string;
  category: Subscription['category'];
  billing_cycle: Subscription['billingCycle'];
  amount: number;
  currency: Subscription['currency'];
  payment_method_type: Subscription['paymentMethodType'];
  next_billing_date: string;
  is_trial: boolean;
  trial_end_date: string | null;
  usage_frequency: Subscription['usageFrequency'];
  note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function mapRecordToSubscription(record: SubscriptionRecord): Subscription {
  return {
    id: record.id,
    userId: record.user_id,
    serviceName: record.service_name,
    category: record.category,
    billingCycle: record.billing_cycle,
    amount: record.amount,
    currency: record.currency,
    paymentMethodType: record.payment_method_type,
    nextBillingDate: record.next_billing_date,
    isTrial: record.is_trial,
    trialEndDate: record.trial_end_date ?? undefined,
    usageFrequency: record.usage_frequency,
    note: record.note ?? undefined,
    isActive: record.is_active,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapInputToRecord(userId: string, input: SubscriptionWriteInput) {
  return {
    user_id: userId,
    service_name: input.serviceName,
    category: input.category,
    billing_cycle: input.billingCycle,
    amount: input.amount,
    currency: input.currency,
    payment_method_type: input.paymentMethodType,
    next_billing_date: input.nextBillingDate,
    is_trial: input.isTrial,
    trial_end_date: input.trialEndDate ?? null,
    usage_frequency: input.usageFrequency,
    note: input.note ?? null,
    is_active: input.isActive,
  };
}

export const supabaseSubscriptionRepository: SubscriptionRepository = {
  async list(userId) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('next_billing_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: (data as SubscriptionRecord[]).map(mapRecordToSubscription),
      source: 'supabase',
    };
  },

  async getById(userId, subscriptionId) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('id', subscriptionId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data ? mapRecordToSubscription(data as SubscriptionRecord) : null,
      source: 'supabase',
    };
  },

  async create(userId, input) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('subscriptions')
      .insert(mapInputToRecord(userId, input))
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: mapRecordToSubscription(data as SubscriptionRecord),
      source: 'supabase',
    };
  },

  async update(userId, subscriptionId, input) {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('subscriptions')
      .update(mapInputToRecord(userId, input))
      .eq('user_id', userId)
      .eq('id', subscriptionId)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: mapRecordToSubscription(data as SubscriptionRecord),
      source: 'supabase',
    };
  },

  async remove(userId, subscriptionId) {
    const client = assertSupabaseConfigured();
    const { error } = await client
      .from('subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('id', subscriptionId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: null,
      source: 'supabase',
    };
  },
};
