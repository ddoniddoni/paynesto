export const subscriptionStatuses = ['trial', 'active', 'past_due', 'canceled'] as const;

export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export type PlanAvailability = 'available' | 'coming_soon';

export type BillingCycle = 'monthly' | 'annual';

export type Plan = {
  id: string;
  name: string;
  priceLabel: string;
  billingCycle: BillingCycle;
  description: string;
  seatLabel: string;
  availability: PlanAvailability;
  features: string[];
};
