import { z } from 'zod';

import type { UserFinancialProfileWriteInput } from '@/types/domain';

export const moneyPlanFormSchema = z.object({
  monthlyNetSalary: z
    .string()
    .trim()
    .min(1, 'Enter your monthly net salary.')
    .refine((value) => Number(value) > 0, 'Monthly net salary must be greater than 0.'),
  monthlyFixedCosts: z
    .string()
    .trim()
    .min(1, 'Enter your monthly fixed costs.')
    .refine((value) => Number(value) >= 0, 'Monthly fixed costs cannot be negative.'),
});

export type MoneyPlanFormValues = z.infer<typeof moneyPlanFormSchema>;

export function createMoneyPlanFormDefaults(
  input?: Partial<UserFinancialProfileWriteInput>
): MoneyPlanFormValues {
  return {
    monthlyNetSalary: input?.monthlyNetSalary ? String(input.monthlyNetSalary) : '',
    monthlyFixedCosts:
      input?.monthlyFixedCosts || input?.monthlyFixedCosts === 0
        ? String(input.monthlyFixedCosts)
        : '',
  };
}

export function mapFormValuesToFinancialProfileInput(
  values: MoneyPlanFormValues
): UserFinancialProfileWriteInput {
  return {
    monthlyNetSalary: Number(values.monthlyNetSalary),
    monthlyFixedCosts: Number(values.monthlyFixedCosts),
  };
}
