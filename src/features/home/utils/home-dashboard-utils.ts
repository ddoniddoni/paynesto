import { getUsdSubscriptionEstimates } from '@/features/exchange-rate/utils/exchange-rate-utils';
import { createBudgetReport } from '@/features/money-plan/utils/money-plan-utils';
import {
  getCancellationScore,
  getDaysUntilDate,
  getDuplicateCategoryCount,
  getMonthlyNormalizedAmount,
  getNextUpcomingSubscription,
  getTrialEndingCount,
} from '@/features/subscriptions/utils/subscription-utils';
import type {
  BudgetHealthStatus,
  ExchangeRateSnapshot,
  Subscription,
  SubscriptionFxEstimate,
  UserFinancialProfile,
} from '@/types/domain';

export type HomeDashboardActionHref = '/subscriptions' | '/money-plan';

export type HomeDashboardAction = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: HomeDashboardActionHref;
  tone: 'default' | 'accent';
};

export type HomeDashboardSummary = {
  activeSubscriptionCount: number;
  monthlyKrwSubscriptionTotal: number;
  monthlyUsdEstimateTotal: number;
  totalMonthlySubscriptionSpend: number;
  totalMonthlyCommittedCost: number | null;
  disposableIncome: number | null;
  salaryRatio: number | null;
  salaryHealthStatus: BudgetHealthStatus | null;
  trialEndingCount: number;
  usdSubscriptionCount: number;
  nextBilling: Subscription | null;
  daysUntilNextBilling: number | null;
  topCancellationCandidate: Subscription | null;
  usdEstimates: SubscriptionFxEstimate[];
  budgetReport: ReturnType<typeof createBudgetReport> | null;
  actions: HomeDashboardAction[];
};

type CreateHomeDashboardSummaryParams = {
  subscriptions: Subscription[];
  profile: UserFinancialProfile | null;
  snapshot: ExchangeRateSnapshot | null;
};

function roundAmount(value: number) {
  return Math.round(value);
}

function getSalaryHealthStatus(ratio: number): BudgetHealthStatus {
  if (ratio <= 0.03) {
    return 'healthy';
  }

  if (ratio <= 0.05) {
    return 'caution';
  }

  return 'warning';
}

function getMonthlyKrwSubscriptionTotal(subscriptions: Subscription[]) {
  return roundAmount(
    subscriptions.reduce((sum, subscription) => {
      if (!subscription.isActive || subscription.currency !== 'KRW') {
        return sum;
      }

      return sum + getMonthlyNormalizedAmount(subscription.amount, subscription.billingCycle);
    }, 0)
  );
}

function getTopCancellationCandidate(subscriptions: Subscription[]) {
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.isActive);

  return (
    activeSubscriptions
      .map((subscription) => ({
        subscription,
        score: getCancellationScore({
          usageFrequency: subscription.usageFrequency,
          isTrial: subscription.isTrial,
          daysUntilBilling: getDaysUntilDate(subscription.nextBillingDate),
          duplicateCategoryCount: getDuplicateCategoryCount(activeSubscriptions, subscription.category),
        }),
      }))
      .sort((left, right) => right.score - left.score)[0]?.subscription ?? null
  );
}

function createHomeActions(input: {
  activeSubscriptionCount: number;
  profile: UserFinancialProfile | null;
  salaryHealthStatus: BudgetHealthStatus | null;
  trialEndingCount: number;
  topCancellationCandidate: Subscription | null;
  usdSubscriptionCount: number;
  monthlyUsdEstimateTotal: number;
  nextBilling: Subscription | null;
  daysUntilNextBilling: number | null;
}) {
  const actions: HomeDashboardAction[] = [];

  if (input.activeSubscriptionCount === 0) {
    actions.push({
      id: 'add-first-subscription',
      eyebrow: 'Get started',
      title: 'Add your first subscription',
      description: 'Track your next billing date, trial endings, and recurring cost in one place.',
      ctaLabel: 'Add subscriptions',
      href: '/subscriptions',
      tone: 'accent',
    });
  }

  if (!input.profile) {
    actions.push({
      id: 'setup-money-plan',
      eyebrow: 'Money Plan',
      title: 'Connect salary to spending',
      description: 'Add your take-home pay and fixed costs to see whether subscriptions fit your monthly budget.',
      ctaLabel: 'Set up Money Plan',
      href: '/money-plan',
      tone: 'accent',
    });
  }

  if (
    input.salaryHealthStatus === 'warning' &&
    input.topCancellationCandidate &&
    actions.every((action) => action.id !== 'trim-subscription')
  ) {
    actions.push({
      id: 'trim-subscription',
      eyebrow: 'Savings idea',
      title: `Review ${input.topCancellationCandidate.serviceName}`,
      description: 'Your subscription ratio is heavy for this salary profile. Start with a low-usage or soon-billing plan.',
      ctaLabel: 'Review subscriptions',
      href: '/subscriptions',
      tone: 'default',
    });
  }

  if (input.trialEndingCount > 0) {
    actions.push({
      id: 'review-trials',
      eyebrow: 'Trial ending',
      title: `${input.trialEndingCount} trial subscription(s) need attention`,
      description: 'Check free-trial services before they roll into paid billing.',
      ctaLabel: 'Review subscriptions',
      href: '/subscriptions',
      tone: 'default',
    });
  }

  if (input.usdSubscriptionCount > 0) {
    actions.push({
      id: 'watch-fx',
      eyebrow: 'FX watch',
      title: `${input.usdSubscriptionCount} USD subscription(s) are active`,
      description: `Current FX estimates add about ${new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        maximumFractionDigits: 0,
      }).format(input.monthlyUsdEstimateTotal)} per month.`,
      ctaLabel: 'Review subscriptions',
      href: '/subscriptions',
      tone: 'default',
    });
  }

  if (input.nextBilling && input.daysUntilNextBilling !== null && input.daysUntilNextBilling <= 3) {
    actions.push({
      id: 'next-billing-soon',
      eyebrow: 'Coming up',
      title: `${input.nextBilling.serviceName} bills soon`,
      description: 'Your next subscription payment is close. Double-check whether you still want to keep it active.',
      ctaLabel: 'Review subscriptions',
      href: '/subscriptions',
      tone: 'default',
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: 'keep-dashboard-fresh',
      eyebrow: 'On track',
      title: 'Your recurring plan looks stable',
      description: 'Keep billing dates and salary inputs up to date so recommendations stay useful.',
      ctaLabel: input.profile ? 'Review subscriptions' : 'Set up Money Plan',
      href: input.profile ? '/subscriptions' : '/money-plan',
      tone: 'default',
    });
  }

  return actions.slice(0, 3);
}

export function createHomeDashboardSummary({
  subscriptions,
  profile,
  snapshot,
}: CreateHomeDashboardSummaryParams): HomeDashboardSummary {
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.isActive);
  const usdEstimates = getUsdSubscriptionEstimates(subscriptions, snapshot);
  const nextBilling = getNextUpcomingSubscription(subscriptions);
  const trialEndingCount = getTrialEndingCount(subscriptions);
  const monthlyKrwSubscriptionTotal = getMonthlyKrwSubscriptionTotal(subscriptions);
  const monthlyUsdEstimateTotal = roundAmount(
    usdEstimates.reduce((sum, estimate) => sum + estimate.normalizedMonthlyKrwAmount, 0)
  );
  const totalMonthlySubscriptionSpend = monthlyKrwSubscriptionTotal + monthlyUsdEstimateTotal;
  const budgetReport = profile ? createBudgetReport(profile, subscriptions) : null;
  const salaryRatio =
    profile && profile.monthlyNetSalary > 0
      ? totalMonthlySubscriptionSpend / profile.monthlyNetSalary
      : null;
  const salaryHealthStatus = salaryRatio === null ? null : getSalaryHealthStatus(salaryRatio);
  const totalMonthlyCommittedCost =
    profile !== null ? roundAmount(profile.monthlyFixedCosts + totalMonthlySubscriptionSpend) : null;
  const disposableIncome =
    profile !== null ? roundAmount(profile.monthlyNetSalary - (totalMonthlyCommittedCost ?? 0)) : null;
  const topCancellationCandidate = getTopCancellationCandidate(subscriptions);
  const daysUntilNextBilling = nextBilling ? getDaysUntilDate(nextBilling.nextBillingDate) : null;
  const actions = createHomeActions({
    activeSubscriptionCount: activeSubscriptions.length,
    profile,
    salaryHealthStatus,
    trialEndingCount,
    topCancellationCandidate,
    usdSubscriptionCount: usdEstimates.length,
    monthlyUsdEstimateTotal,
    nextBilling,
    daysUntilNextBilling,
  });

  return {
    activeSubscriptionCount: activeSubscriptions.length,
    monthlyKrwSubscriptionTotal,
    monthlyUsdEstimateTotal,
    totalMonthlySubscriptionSpend,
    totalMonthlyCommittedCost,
    disposableIncome,
    salaryRatio,
    salaryHealthStatus,
    trialEndingCount,
    usdSubscriptionCount: usdEstimates.length,
    nextBilling,
    daysUntilNextBilling,
    topCancellationCandidate,
    usdEstimates,
    budgetReport,
    actions,
  };
}
