import { differenceInCalendarDays, isValid, parseISO } from 'date-fns';

import type {
  Subscription,
  SubscriptionBillingCycle,
  SubscriptionStatus,
  SupportedCurrency,
  UsageFrequency,
} from '@/types/domain';

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
