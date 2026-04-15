import { Plan } from '@/types/domain';

export const plans: Plan[] = [
  {
    id: 'starter-monthly',
    name: 'Starter',
    priceLabel: '$12',
    billingCycle: 'monthly',
    description: 'For solo operators who need clear billing and renewal visibility.',
    seatLabel: 'Up to 3 managed workspaces',
    availability: 'available',
    features: ['Customer timeline', 'Billing history', 'Basic alerts'],
  },
  {
    id: 'growth-monthly',
    name: 'Growth',
    priceLabel: '$29',
    billingCycle: 'monthly',
    description: 'For teams handling refunds, payment recovery, and plan changes daily.',
    seatLabel: 'Up to 10 managed workspaces',
    availability: 'available',
    features: ['Refund queue', 'Retry automation', 'Coupon controls'],
  },
  {
    id: 'scale-annual',
    name: 'Scale',
    priceLabel: '$199',
    billingCycle: 'annual',
    description: 'For larger ops teams that need auditability and role-based oversight.',
    seatLabel: 'Unlimited workspaces',
    availability: 'coming_soon',
    features: ['Admin roles', 'Audit exports', 'Executive analytics'],
  },
];
