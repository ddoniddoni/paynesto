import { describe, expect, it } from 'vitest';

import {
  mapFormValuesToSubscriptionInput,
  subscriptionFormSchema,
} from '../../src/features/subscriptions/schemas/subscription-form-schema';

describe('subscriptionFormSchema', () => {
  it('accepts a valid subscription form payload', () => {
    const result = subscriptionFormSchema.safeParse({
      serviceName: 'ChatGPT Plus',
      category: 'AI',
      billingCycle: 'monthly',
      amount: '20',
      currency: 'USD',
      paymentMethodType: 'card',
      nextBillingDate: '2026-04-20',
      isTrial: false,
      trialEndDate: '',
      usageFrequency: 'high',
      note: '업무용',
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects a trial item without a valid trial end date', () => {
    const result = subscriptionFormSchema.safeParse({
      serviceName: 'Watcha',
      category: 'OTT',
      billingCycle: 'monthly',
      amount: '7900',
      currency: 'KRW',
      paymentMethodType: 'card',
      nextBillingDate: '2026-04-17',
      isTrial: true,
      trialEndDate: '',
      usageFrequency: 'low',
      note: '',
      isActive: true,
    });

    expect(result.success).toBe(false);
  });

  it('maps form values to a write input payload', () => {
    const payload = mapFormValuesToSubscriptionInput({
      serviceName: ' Netflix ',
      category: 'OTT',
      billingCycle: 'monthly',
      amount: '17000',
      currency: 'KRW',
      paymentMethodType: 'card',
      nextBillingDate: '2026-04-19',
      isTrial: false,
      trialEndDate: '',
      usageFrequency: 'high',
      note: ' 가족 공유 ',
      isActive: true,
    });

    expect(payload).toEqual({
      serviceName: 'Netflix',
      category: 'OTT',
      billingCycle: 'monthly',
      amount: 17000,
      currency: 'KRW',
      paymentMethodType: 'card',
      nextBillingDate: '2026-04-19',
      isTrial: false,
      trialEndDate: undefined,
      usageFrequency: 'high',
      note: '가족 공유',
      isActive: true,
    });
  });
});
