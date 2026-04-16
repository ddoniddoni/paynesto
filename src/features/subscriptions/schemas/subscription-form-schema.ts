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
    serviceName: z.string().trim().min(1, '서비스 이름을 입력해 주세요.'),
    category: z.enum(subscriptionCategories, {
      message: '카테고리를 선택해 주세요.',
    }),
    billingCycle: z.enum(subscriptionBillingCycles),
    amount: z
      .string()
      .trim()
      .min(1, '금액을 입력해 주세요.')
      .refine((value) => Number(value) > 0, '금액은 0보다 커야 합니다.'),
    currency: z.enum(supportedCurrencies),
    paymentMethodType: z.enum(paymentMethodTypes),
    nextBillingDate: z
      .string()
      .trim()
      .min(1, '다음 결제일을 입력해 주세요.')
      .refine(isIsoDateString, '날짜는 YYYY-MM-DD 형식으로 입력해 주세요.'),
    isTrial: z.boolean(),
    trialEndDate: z.string().trim().optional(),
    usageFrequency: z.enum(usageFrequencies),
    note: z.string().trim().max(240, '메모는 240자 이하로 입력해 주세요.').optional(),
    isActive: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.isTrial && (!value.trialEndDate || !isIsoDateString(value.trialEndDate))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: '체험 종료일을 YYYY-MM-DD 형식으로 입력해 주세요.',
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
