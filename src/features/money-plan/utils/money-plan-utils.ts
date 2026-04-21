import type {
  BudgetActionCard,
  BudgetGuidancePriority,
  BudgetHealthStatus,
  BudgetReport,
  Subscription,
  SubscriptionReviewCandidate,
  UserFinancialProfile,
} from '@/types/domain';
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns';

import {
  getCancellationScore,
  getMonthlyNormalizedAmount,
} from '@/features/subscriptions/utils/subscription-utils';

type SubscriptionBudgetSnapshot = {
  monthlySubscriptionTotal: number;
  foreignCurrencySubscriptionCount: number;
};

type BudgetReportOptions = {
  referenceDate?: Date;
};

const maxSubscriptionReviewCandidates = 3;

function clampCurrency(value: number) {
  return Math.max(Math.round(value), 0);
}

function calculateRatio(amount: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return amount / total;
}

function getFixedCostStatus(ratio: number): BudgetHealthStatus {
  if (ratio < 0.35) {
    return 'healthy';
  }

  if (ratio <= 0.5) {
    return 'caution';
  }

  return 'warning';
}

function getSubscriptionStatus(ratio: number): BudgetHealthStatus {
  if (ratio <= 0.03) {
    return 'healthy';
  }

  if (ratio <= 0.05) {
    return 'caution';
  }

  return 'warning';
}

function getCashFlowPriority(committedCostRatio: number, disposableIncome: number) {
  if (disposableIncome <= 0 || committedCostRatio >= 0.8) {
    return 'high';
  }

  if (committedCostRatio >= 0.65) {
    return 'medium';
  }

  return 'low';
}

function getDaysUntilBilling(nextBillingDate: string, referenceDate: Date) {
  const parsedDate = parseISO(nextBillingDate);

  if (!isValid(parsedDate)) {
    return Number.POSITIVE_INFINITY;
  }

  return differenceInCalendarDays(parsedDate, referenceDate);
}

function getActiveDuplicateCategoryCounts(subscriptions: Subscription[]) {
  return subscriptions
    .filter((subscription) => subscription.isActive)
    .reduce<Record<Subscription['category'], number>>(
      (counts, subscription) => ({
        ...counts,
        [subscription.category]: (counts[subscription.category] ?? 0) + 1,
      }),
      {} as Record<Subscription['category'], number>
    );
}

function createCandidateReasons(input: {
  subscription: Subscription;
  daysUntilBilling: number;
  duplicateCategoryCount: number;
}) {
  const reasons: string[] = [];

  if (input.subscription.usageFrequency === 'low') {
    reasons.push('Low usage');
  } else if (input.subscription.usageFrequency === 'medium') {
    reasons.push('Medium usage');
  }

  if (input.subscription.isTrial) {
    reasons.push('Trial ending or trial service');
  }

  if (input.daysUntilBilling <= 3) {
    reasons.push('Billing soon');
  }

  if (input.duplicateCategoryCount >= 3) {
    reasons.push('Duplicate category');
  }

  return reasons;
}

function getCandidateSuggestedAction(reasons: string[]) {
  if (reasons.includes('Low usage')) {
    return 'Pause or cancel if you did not use it this week.';
  }

  if (reasons.includes('Trial ending or trial service')) {
    return 'Decide before the trial turns into a paid subscription.';
  }

  if (reasons.includes('Billing soon')) {
    return 'Review it before the next billing date arrives.';
  }

  if (reasons.includes('Duplicate category')) {
    return 'Keep the service you use most and compare the rest.';
  }

  return 'Review whether it still deserves a spot in this month\'s plan.';
}

export function createSubscriptionReviewCandidates(
  subscriptions: Subscription[],
  options: BudgetReportOptions = {}
): SubscriptionReviewCandidate[] {
  const referenceDate = options.referenceDate ?? new Date();
  const duplicateCategoryCounts = getActiveDuplicateCategoryCounts(subscriptions);

  return subscriptions
    .filter((subscription) => subscription.isActive)
    .map((subscription) => {
      const daysUntilBilling = getDaysUntilBilling(subscription.nextBillingDate, referenceDate);
      const duplicateCategoryCount = duplicateCategoryCounts[subscription.category] ?? 0;
      const score = getCancellationScore({
        usageFrequency: subscription.usageFrequency,
        isTrial: subscription.isTrial,
        daysUntilBilling,
        duplicateCategoryCount,
      });
      const reasons = createCandidateReasons({
        subscription,
        daysUntilBilling,
        duplicateCategoryCount,
      });

      return {
        subscriptionId: subscription.id,
        serviceName: subscription.serviceName,
        category: subscription.category,
        monthlyEquivalentAmount: getMonthlyNormalizedAmount(
          subscription.amount,
          subscription.billingCycle
        ),
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        usageFrequency: subscription.usageFrequency,
        daysUntilBilling,
        score,
        reasons,
        suggestedAction: getCandidateSuggestedAction(reasons),
      };
    })
    .filter((candidate) => candidate.score >= 2)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (left.daysUntilBilling !== right.daysUntilBilling) {
        return left.daysUntilBilling - right.daysUntilBilling;
      }

      return right.monthlyEquivalentAmount - left.monthlyEquivalentAmount;
    })
    .slice(0, maxSubscriptionReviewCandidates);
}

function createBudgetActionCards(input: {
  fixedCostRatio: number;
  subscriptionRatio: number;
  committedCostRatio: number;
  disposableIncome: number;
  recommendedSubscriptionBudgetMin: number;
  recommendedSubscriptionBudgetMax: number;
  fixedCostStatus: BudgetHealthStatus;
  subscriptionStatus: BudgetHealthStatus;
  reviewCandidateCount: number;
}): BudgetActionCard[] {
  const fixedCostCard: BudgetActionCard =
    input.fixedCostStatus === 'warning'
      ? {
          id: 'fixed_costs',
          title: 'Lower fixed-cost pressure',
          summary: 'Fixed costs are above 50% of take-home pay.',
          reason: `Fixed costs now use ${formatMoneyRatio(input.fixedCostRatio)} of monthly salary.`,
          nextStep: 'Review rent, insurance, transport, phone, and other recurring obligations first.',
          priority: 'high',
        }
      : input.fixedCostStatus === 'caution'
        ? {
            id: 'fixed_costs',
            title: 'Keep new fixed costs conservative',
            summary: 'Fixed costs are starting to weigh on your monthly plan.',
            reason: `Fixed costs now use ${formatMoneyRatio(input.fixedCostRatio)} of monthly salary.`,
            nextStep: 'Avoid adding another fixed payment until the next payday cycle is stable.',
            priority: 'medium',
          }
        : {
            id: 'fixed_costs',
            title: 'Fixed costs look stable',
            summary: 'Fixed costs are in a healthy range for a first-pass monthly plan.',
            reason: `Fixed costs now use ${formatMoneyRatio(input.fixedCostRatio)} of monthly salary.`,
            nextStep: 'Keep this baseline steady before increasing subscriptions.',
            priority: 'low',
          };

  const subscriptionCard: BudgetActionCard =
    input.subscriptionStatus === 'warning'
      ? {
          id: 'subscriptions',
          title: 'Review subscriptions this week',
          summary: 'Subscriptions are above 5% of take-home pay.',
          reason: `KRW subscriptions now use ${formatMoneyRatio(input.subscriptionRatio)} of monthly salary.`,
          nextStep:
            input.reviewCandidateCount > 0
              ? 'Start with the review candidates below.'
              : 'Check low-usage, duplicate, or trial services before the next billing date.',
          priority: 'high',
        }
      : input.subscriptionStatus === 'caution'
        ? {
            id: 'subscriptions',
            title: 'Hold subscription spending steady',
            summary: 'Subscriptions are near the upper end of the healthy range.',
            reason: `KRW subscriptions now use ${formatMoneyRatio(input.subscriptionRatio)} of monthly salary.`,
            nextStep: 'Add a new service only if an existing one is removed or downgraded.',
            priority: 'medium',
          }
        : {
            id: 'subscriptions',
            title: 'Subscription budget has room',
            summary: 'Current KRW subscription spending is within a healthy salary ratio.',
            reason: `KRW subscriptions now use ${formatMoneyRatio(input.subscriptionRatio)} of monthly salary.`,
            nextStep: `Keep the monthly subscription range near ${formatMoneyAmount(
              input.recommendedSubscriptionBudgetMin
            )} - ${formatMoneyAmount(input.recommendedSubscriptionBudgetMax)}.`,
            priority: 'low',
          };

  const cashFlowPriority = getCashFlowPriority(input.committedCostRatio, input.disposableIncome);
  const cashFlowCard: BudgetActionCard =
    cashFlowPriority === 'high'
      ? {
          id: 'cash_flow',
          title: 'Protect this month\'s cash flow',
          summary: 'Committed costs leave very little flexible room.',
          reason: `Committed costs use ${formatMoneyRatio(input.committedCostRatio)} of monthly salary.`,
          nextStep: 'Pause non-essential renewals until fixed costs and subscriptions are reviewed.',
          priority: 'high',
        }
      : cashFlowPriority === 'medium'
        ? {
            id: 'cash_flow',
            title: 'Build a small monthly buffer',
            summary: 'Committed costs are manageable but leave a narrow margin.',
            reason: `Estimated disposable income is ${formatMoneyAmount(input.disposableIncome)}.`,
            nextStep: 'Set aside a small buffer before adding new recurring services.',
            priority: 'medium',
          }
        : {
            id: 'cash_flow',
            title: 'Cash flow looks flexible',
            summary: 'Committed costs leave room for living costs and savings.',
            reason: `Estimated disposable income is ${formatMoneyAmount(input.disposableIncome)}.`,
            nextStep: 'Keep savings automatic and review subscriptions before each payday.',
            priority: 'low',
          };

  return [fixedCostCard, subscriptionCard, cashFlowCard].sort((left, right) => {
    const priorityRank: Record<BudgetGuidancePriority, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    return priorityRank[right.priority] - priorityRank[left.priority];
  });
}

export function getSubscriptionBudgetSnapshot(
  subscriptions: Subscription[]
): SubscriptionBudgetSnapshot {
  return subscriptions.reduce<SubscriptionBudgetSnapshot>(
    (summary, subscription) => {
      if (!subscription.isActive) {
        return summary;
      }

      if (subscription.currency !== 'KRW') {
        return {
          ...summary,
          foreignCurrencySubscriptionCount: summary.foreignCurrencySubscriptionCount + 1,
        };
      }

      return {
        ...summary,
        monthlySubscriptionTotal:
          summary.monthlySubscriptionTotal +
          getMonthlyNormalizedAmount(subscription.amount, subscription.billingCycle),
      };
    },
    {
      monthlySubscriptionTotal: 0,
      foreignCurrencySubscriptionCount: 0,
    }
  );
}

export function createBudgetReport(
  profile: UserFinancialProfile,
  subscriptions: Subscription[],
  options: BudgetReportOptions = {}
): BudgetReport {
  const snapshot = getSubscriptionBudgetSnapshot(subscriptions);
  const fixedCostRatio = calculateRatio(profile.monthlyFixedCosts, profile.monthlyNetSalary);
  const subscriptionRatio = calculateRatio(
    snapshot.monthlySubscriptionTotal,
    profile.monthlyNetSalary
  );
  const recommendedSavingsTarget = clampCurrency(profile.monthlyNetSalary * 0.2);
  const recommendedSubscriptionBudgetMin = clampCurrency(profile.monthlyNetSalary * 0.05);
  const recommendedSubscriptionBudgetMax = clampCurrency(profile.monthlyNetSalary * 0.1);
  const monthlyCommittedCosts = clampCurrency(
    profile.monthlyFixedCosts + snapshot.monthlySubscriptionTotal
  );
  const disposableIncome = clampCurrency(profile.monthlyNetSalary - monthlyCommittedCosts);
  const committedCostRatio = calculateRatio(monthlyCommittedCosts, profile.monthlyNetSalary);
  const recommendedLivingBudget = clampCurrency(
    profile.monthlyNetSalary -
      profile.monthlyFixedCosts -
      recommendedSavingsTarget -
      recommendedSubscriptionBudgetMax
  );
  const fixedCostStatus = getFixedCostStatus(fixedCostRatio);
  const subscriptionStatus = getSubscriptionStatus(subscriptionRatio);
  const subscriptionReviewCandidates = createSubscriptionReviewCandidates(subscriptions, options);
  const actionCards = createBudgetActionCards({
    fixedCostRatio,
    subscriptionRatio,
    committedCostRatio,
    disposableIncome,
    recommendedSubscriptionBudgetMin,
    recommendedSubscriptionBudgetMax,
    fixedCostStatus,
    subscriptionStatus,
    reviewCandidateCount: subscriptionReviewCandidates.length,
  });
  const guidance = actionCards.map((card) => `${card.summary} ${card.nextStep}`);

  if (snapshot.foreignCurrencySubscriptionCount > 0) {
    guidance.push(
      `${snapshot.foreignCurrencySubscriptionCount} foreign-currency subscription(s) are excluded from this KRW report until FX estimates are connected.`
    );
  }

  return {
    monthlyNetSalary: profile.monthlyNetSalary,
    monthlyFixedCosts: profile.monthlyFixedCosts,
    monthlySubscriptionTotal: clampCurrency(snapshot.monthlySubscriptionTotal),
    monthlyCommittedCosts,
    disposableIncome,
    committedCostRatio,
    recommendedSavingsTarget,
    recommendedLivingBudget,
    recommendedSubscriptionBudgetMin,
    recommendedSubscriptionBudgetMax,
    fixedCostRatio,
    subscriptionRatio,
    fixedCostStatus,
    subscriptionStatus,
    foreignCurrencySubscriptionCount: snapshot.foreignCurrencySubscriptionCount,
    actionCards,
    subscriptionReviewCandidates,
    guidance,
  };
}

export function formatMoneyAmount(amount: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMoneyRatio(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

export function formatHealthStatus(status: BudgetHealthStatus) {
  if (status === 'healthy') {
    return 'Healthy';
  }

  if (status === 'caution') {
    return 'Caution';
  }

  return 'Warning';
}
