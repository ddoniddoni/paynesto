import type { PremiumPlan } from '@/types/domain';

export const premiumPlans: PremiumPlan[] = [
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    priceLabel: '$4.99 / month',
    billingCycle: 'monthly',
    description: 'Best for testing premium savings guidance without a long commitment.',
    badge: 'Most flexible',
    availability: 'available',
    features: [
      'FX volatility alerts for USD subscriptions',
      'Earlier trial reminder options',
      'Priority cancellation watchlist',
    ],
    priceUsd: 4.99,
  },
  {
    id: 'premium-yearly',
    name: 'Premium Yearly',
    priceLabel: '$39 / year',
    billingCycle: 'yearly',
    description: 'Lower annual cost for users who rely on Paynesto every month.',
    badge: 'Best value',
    availability: 'available',
    features: [
      'Everything in Monthly',
      'Longer budget planning coverage',
      'Priority support queue',
    ],
    priceUsd: 39,
  },
];
