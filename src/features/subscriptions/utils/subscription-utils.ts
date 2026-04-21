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

export type SubscriptionSortKey = 'next_billing_asc' | 'monthly_cost_desc' | 'service_name_asc';

export type SubscriptionListViewOptions = {
  filters: SubscriptionFilters;
  searchQuery: string;
  sortKey: SubscriptionSortKey;
};

export type TrialManagementStatus =
  | 'not_trial'
  | 'inactive'
  | 'missing_end_date'
  | 'active'
  | 'ending_soon'
  | 'ended';

export type TrialManagementSummary = {
  status: TrialManagementStatus;
  daysUntilTrialEnd: number | null;
  title: string;
  description: string;
  nextAction: string;
};

export const defaultSubscriptionFilters: SubscriptionFilters = {
  category: 'all',
  currency: 'all',
  billingCycle: 'all',
};

export const defaultSubscriptionSortKey: SubscriptionSortKey = 'next_billing_asc';

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

function getSortableDateTime(isoDate: string) {
  const parsedDate = parseISO(isoDate);

  if (!isValid(parsedDate)) {
    return Number.POSITIVE_INFINITY;
  }

  return parsedDate.getTime();
}

function normalizeSearchQuery(searchQuery: string) {
  return searchQuery.trim().toLocaleLowerCase();
}

function getDaysUntilIsoDate(isoDate: string, referenceDate: Date) {
  const parsedDate = parseISO(isoDate);

  if (!isValid(parsedDate)) {
    return null;
  }

  return differenceInCalendarDays(parsedDate, referenceDate);
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

export function searchSubscriptions(subscriptions: Subscription[], searchQuery: string) {
  const normalizedQuery = normalizeSearchQuery(searchQuery);

  if (!normalizedQuery) {
    return subscriptions;
  }

  return subscriptions.filter((subscription) => {
    const serviceName = subscription.serviceName.toLocaleLowerCase();
    const note = subscription.note?.toLocaleLowerCase() ?? '';

    return serviceName.includes(normalizedQuery) || note.includes(normalizedQuery);
  });
}

export function sortSubscriptions(subscriptions: Subscription[], sortKey: SubscriptionSortKey) {
  return subscriptions.slice().sort((left, right) => {
    if (sortKey === 'monthly_cost_desc') {
      const leftMonthlyAmount = getMonthlyNormalizedAmount(left.amount, left.billingCycle);
      const rightMonthlyAmount = getMonthlyNormalizedAmount(right.amount, right.billingCycle);

      if (rightMonthlyAmount !== leftMonthlyAmount) {
        return rightMonthlyAmount - leftMonthlyAmount;
      }

      return left.serviceName.localeCompare(right.serviceName);
    }

    if (sortKey === 'service_name_asc') {
      return left.serviceName.localeCompare(right.serviceName);
    }

    const leftBillingTime = getSortableDateTime(left.nextBillingDate);
    const rightBillingTime = getSortableDateTime(right.nextBillingDate);

    if (leftBillingTime !== rightBillingTime) {
      return leftBillingTime - rightBillingTime;
    }

    return left.serviceName.localeCompare(right.serviceName);
  });
}

export function getSubscriptionListView(
  subscriptions: Subscription[],
  options: SubscriptionListViewOptions
) {
  return sortSubscriptions(
    searchSubscriptions(filterSubscriptions(subscriptions, options.filters), options.searchQuery),
    options.sortKey
  );
}

export function getTrialManagementSummary(
  subscription: Subscription,
  referenceDate = new Date()
): TrialManagementSummary {
  if (!subscription.isTrial) {
    return {
      status: 'not_trial',
      daysUntilTrialEnd: null,
      title: 'Standard subscription',
      description: 'This subscription is not marked as a free trial.',
      nextAction: 'Review the next billing date and usage frequency instead.',
    };
  }

  if (!subscription.isActive) {
    return {
      status: 'inactive',
      daysUntilTrialEnd: null,
      title: 'Inactive trial',
      description: 'This trial is not active in your current subscription list.',
      nextAction: 'Keep it inactive unless the service starts charging again.',
    };
  }

  if (!subscription.trialEndDate) {
    return {
      status: 'missing_end_date',
      daysUntilTrialEnd: null,
      title: 'Trial end date needed',
      description: 'This trial is active, but no trial end date is saved.',
      nextAction: 'Add the trial end date so reminders and review guidance can work.',
    };
  }

  const daysUntilTrialEnd = getDaysUntilIsoDate(subscription.trialEndDate, referenceDate);

  if (daysUntilTrialEnd === null) {
    return {
      status: 'missing_end_date',
      daysUntilTrialEnd: null,
      title: 'Trial end date needs review',
      description: 'The saved trial end date could not be read.',
      nextAction: 'Edit the subscription and save the trial end date as YYYY-MM-DD.',
    };
  }

  if (daysUntilTrialEnd < 0) {
    return {
      status: 'ended',
      daysUntilTrialEnd,
      title: 'Trial may have ended',
      description: `The saved trial end date passed ${Math.abs(daysUntilTrialEnd)} day(s) ago.`,
      nextAction: 'Confirm whether the trial converted to paid billing or should be canceled.',
    };
  }

  if (daysUntilTrialEnd <= 3) {
    return {
      status: 'ending_soon',
      daysUntilTrialEnd,
      title: 'Trial ending soon',
      description:
        daysUntilTrialEnd === 0
          ? 'This trial ends today.'
          : `This trial ends in ${daysUntilTrialEnd} day(s).`,
      nextAction: 'Decide today whether to keep, downgrade, or cancel before billing starts.',
    };
  }

  return {
    status: 'active',
    daysUntilTrialEnd,
    title: 'Trial is being tracked',
    description: `This trial ends in ${daysUntilTrialEnd} day(s).`,
    nextAction: 'Keep the reminder enabled and review usage before the trial ends.',
  };
}

export function formatTrialManagementStatus(status: TrialManagementStatus) {
  if (status === 'ending_soon') {
    return 'Ending soon';
  }

  if (status === 'missing_end_date') {
    return 'Needs date';
  }

  if (status === 'not_trial') {
    return 'Not a trial';
  }

  if (status === 'inactive') {
    return 'Inactive';
  }

  if (status === 'ended') {
    return 'Ended';
  }

  return 'Active trial';
}
