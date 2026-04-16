import { describe, expect, it } from 'vitest';

import {
  moneyPlanFormSchema,
  mapFormValuesToFinancialProfileInput,
} from '../../src/features/money-plan/schemas/money-plan-form-schema';

describe('moneyPlanFormSchema', () => {
  it('accepts a valid salary and fixed cost input', () => {
    const result = moneyPlanFormSchema.safeParse({
      monthlyNetSalary: '3200000',
      monthlyFixedCosts: '1450000',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a zero salary', () => {
    const result = moneyPlanFormSchema.safeParse({
      monthlyNetSalary: '0',
      monthlyFixedCosts: '1450000',
    });

    expect(result.success).toBe(false);
  });

  it('maps valid form values into a financial profile input', () => {
    expect(
      mapFormValuesToFinancialProfileInput({
        monthlyNetSalary: '3200000',
        monthlyFixedCosts: '1450000',
      })
    ).toEqual({
      monthlyNetSalary: 3200000,
      monthlyFixedCosts: 1450000,
    });
  });
});
