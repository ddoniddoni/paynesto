import { isValid, parseISO } from 'date-fns';
import { z } from 'zod';

import {
  paymentMethodTypes,
  subscriptionBillingCycles,
  subscriptionCategories,
  supportedCurrencies,
  usageFrequencies,
  type SubscriptionWriteInput,
} from '@/types/domain';

function isIsoDateString(value: string) {
  const parsed = parseISO(value);
  return isValid(parsed);
}

export const subscriptionFormSchema = z
  .object({
    serviceName: z.string().trim().min(1, 'Enter a service name.'),
    category: z.enum(subscriptionCategories, {
      message: 'Choose a category.',
    }),
    billingCycle: z.enum(subscriptionBillingCycles),
    amount: z
      .string()
      .trim()
      .min(1, 'Enter a billing amount.')
      .refine((value) => Number(value) > 0, 'Amount must be greater than 0.'),
    currency: z.enum(supportedCurrencies),
    paymentMethodType: z.enum(paymentMethodTypes),
    nextBillingDate: z
      .string()
      .trim()
      .min(1, 'Enter the next billing date.')
      .refine(isIsoDateString, 'Enter the date as YYYY-MM-DD.'),
    isTrial: z.boolean(),
    trialEndDate: z.string().trim().optional(),
    usageFrequency: z.enum(usageFrequencies),
    note: z.string().trim().max(240, 'Keep notes under 240 characters.').optional(),
    isActive: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.isTrial && (!value.trialEndDate || !isIsoDateString(value.trialEndDate))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter the trial end date as YYYY-MM-DD.',
        path: ['trialEndDate'],
      });
    }
  });

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

export function createSubscriptionFormDefaults(
  input?: Partial<SubscriptionWriteInput>
): SubscriptionFormValues {
  return {
    serviceName: input?.serviceName ?? '',
    category: input?.category ?? 'OTT',
    billingCycle: input?.billingCycle ?? 'monthly',
    amount: input?.amount ? String(input.amount) : '',
    currency: input?.currency ?? 'KRW',
    paymentMethodType: input?.paymentMethodType ?? 'card',
    nextBillingDate: input?.nextBillingDate ?? '',
    isTrial: input?.isTrial ?? false,
    trialEndDate: input?.trialEndDate ?? '',
    usageFrequency: input?.usageFrequency ?? 'medium',
    note: input?.note ?? '',
    isActive: input?.isActive ?? true,
  };
}

export function mapFormValuesToSubscriptionInput(
  values: SubscriptionFormValues
): SubscriptionWriteInput {
  return {
    serviceName: values.serviceName.trim(),
    category: values.category,
    billingCycle: values.billingCycle,
    amount: Number(values.amount),
    currency: values.currency,
    paymentMethodType: values.paymentMethodType,
    nextBillingDate: values.nextBillingDate,
    isTrial: values.isTrial,
    trialEndDate: values.isTrial ? values.trialEndDate?.trim() || undefined : undefined,
    usageFrequency: values.usageFrequency,
    note: values.note?.trim() || undefined,
    isActive: values.isActive,
  };
}
