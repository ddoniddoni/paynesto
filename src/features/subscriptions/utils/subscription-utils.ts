import { differenceInCalendarDays, isValid, parseISO } from 'date-fns';

import type {
  Subscription,
  SubscriptionBillingCycle,
  SubscriptionStatus,
  SupportedCurrency,
  UsageFrequency,
} from '@/types/domain';

export type SubscriptionCategoryFilter = 'all' | Subscription['category'];
export type SubscriptionCurrencyFilter = 'all' | SupportedCurrency;
export type SubscriptionBillingCycleFilter = 'all' | SubscriptionBillingCycle;

export type SubscriptionFilters = {
  category: SubscriptionCategoryFilter;
  currency: SubscriptionCurrencyFilter;
  billingCycle: SubscriptionBillingCycleFilter;
};

export const defaultSubscriptionFilters: SubscriptionFilters = {
  category: 'all',
  currency: 'all',
  billingCycle: 'all',
};

export function getMonthlyNormalizedAmount(
  amount: number,
  billingCycle: SubscriptionBillingCycle
) {
  return billingCycle === 'monthly' ? amount : amount / 12;
}

export function formatSubscriptionAmount(amount: number, currency: SupportedCurrency) {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMonthlyEquivalent(amount: number, currency: SupportedCurrency) {
  return `${formatSubscriptionAmount(amount, currency)}/mo`;
}

export function getDaysUntilDate(isoDate: string) {
  const parsedDate = parseISO(isoDate);

  if (!isValid(parsedDate)) {
    return Number.POSITIVE_INFINITY;
  }

  return differenceInCalendarDays(parsedDate, new Date());
}

export function getSubscriptionStatus(subscription: Subscription): SubscriptionStatus {
  if (!subscription.isActive) {
    return 'canceled';
  }

  if (subscription.isTrial) {
    return 'trial';
  }

  return 'active';
}

export function getCancellationScore(input: {
  usageFrequency: UsageFrequency;
  isTrial: boolean;
  daysUntilBilling: number;
  duplicateCategoryCount: number;
}) {
  let score = 0;

  if (input.usageFrequency === 'low') {
    score += 3;
  } else if (input.usageFrequency === 'medium') {
    score += 1;
  }

  if (input.isTrial) {
    score += 2;
  }

  if (input.daysUntilBilling <= 3) {
    score += 2;
  }

  if (input.duplicateCategoryCount >= 3) {
    score += 2;
  }

  return score;
}

export function getDuplicateCategoryCount(subscriptions: Subscription[], category: Subscription['category']) {
  return subscriptions.filter((subscription) => subscription.category === category).length;
}

export function getNextUpcomingSubscription(subscriptions: Subscription[]) {
  return subscriptions
    .filter((subscription) => subscription.isActive)
    .slice()
    .sort((left, right) => left.nextBillingDate.localeCompare(right.nextBillingDate))[0] ?? null;
}

export function getTrialEndingCount(subscriptions: Subscription[]) {
  return subscriptions.filter((subscription) => subscription.isTrial && subscription.isActive).length;
}

export function hasActiveSubscriptionFilters(filters: SubscriptionFilters) {
  return (
    filters.category !== defaultSubscriptionFilters.category ||
    filters.currency !== defaultSubscriptionFilters.currency ||
    filters.billingCycle !== defaultSubscriptionFilters.billingCycle
  );
}

export function filterSubscriptions(subscriptions: Subscription[], filters: SubscriptionFilters) {
  return subscriptions.filter((subscription) => {
    const matchesCategory = filters.category === 'all' || subscription.category === filters.category;
    const matchesCurrency = filters.currency === 'all' || subscription.currency === filters.currency;
    const matchesBillingCycle =
      filters.billingCycle === 'all' || subscription.billingCycle === filters.billingCycle;

    return matchesCategory && matchesCurrency && matchesBillingCycle;
  });
}
