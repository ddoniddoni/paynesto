import { addMonths, addYears, isAfter, parseISO } from 'date-fns';

import type {
  PremiumBillingCycle,
  PremiumCheckoutInput,
  PremiumPlan,
  PremiumTransaction,
} from '@/types/domain';

export function createPremiumExpiryDate(purchasedAt: string, billingCycle: PremiumBillingCycle) {
  const purchaseDate = parseISO(purchasedAt);

  return (
    billingCycle === 'yearly' ? addYears(purchaseDate, 1) : addMonths(purchaseDate, 1)
  ).toISOString();
}

export function getActivePremiumTransaction(
  transactions: PremiumTransaction[],
  now: Date = new Date()
) {
  return transactions.find((transaction) => {
    if (transaction.status !== 'active') {
      return false;
    }

    if (!transaction.expiresAt) {
      return true;
    }

    return isAfter(parseISO(transaction.expiresAt), now);
  }) ?? null;
}

export function hasPremiumAccess(
  transactions: PremiumTransaction[],
  now: Date = new Date()
) {
  return getActivePremiumTransaction(transactions, now) !== null;
}

export function canUseFxAlertNotifications(
  transactions: PremiumTransaction[],
  now: Date = new Date()
) {
  return hasPremiumAccess(transactions, now);
}

export function createCheckoutInputFromPlan(plan: PremiumPlan): PremiumCheckoutInput {
  return {
    planId: plan.id,
    billingCycle: plan.billingCycle,
    priceUsd: plan.priceUsd,
  };
}

export function formatPremiumStatusCopy(transactions: PremiumTransaction[]) {
  const activeTransaction = getActivePremiumTransaction(transactions);

  if (!activeTransaction) {
    return 'Free plan';
  }

  return activeTransaction.billingCycle === 'yearly' ? 'Premium Yearly' : 'Premium Monthly';
}
