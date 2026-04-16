import type {
  BudgetHealthStatus,
  BudgetReport,
  Subscription,
  UserFinancialProfile,
} from '@/types/domain';
import { getMonthlyNormalizedAmount } from '@/features/subscriptions/utils/subscription-utils';

type SubscriptionBudgetSnapshot = {
  monthlySubscriptionTotal: number;
  foreignCurrencySubscriptionCount: number;
};

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
  subscriptions: Subscription[]
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
  const recommendedLivingBudget = clampCurrency(
    profile.monthlyNetSalary -
      profile.monthlyFixedCosts -
      recommendedSavingsTarget -
      recommendedSubscriptionBudgetMax
  );
  const fixedCostStatus = getFixedCostStatus(fixedCostRatio);
  const subscriptionStatus = getSubscriptionStatus(subscriptionRatio);
  const guidance: string[] = [];

  if (fixedCostStatus === 'warning') {
    guidance.push('Fixed costs are above 50% of your salary, so trimming recurring obligations should come first.');
  } else if (fixedCostStatus === 'caution') {
    guidance.push('Fixed costs are starting to weigh on your monthly plan. Keep new commitments conservative.');
  } else {
    guidance.push('Fixed costs are in a healthy range for a first-pass monthly plan.');
  }

  if (subscriptionStatus === 'warning') {
    guidance.push('Subscriptions are above 5% of your salary. Review low-usage or duplicate services this month.');
  } else if (subscriptionStatus === 'caution') {
    guidance.push('Subscriptions are near the upper end of the healthy range. New sign-ups should be limited.');
  } else {
    guidance.push('Current KRW subscription spending is within a healthy salary ratio.');
  }

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
    recommendedSavingsTarget,
    recommendedLivingBudget,
    recommendedSubscriptionBudgetMin,
    recommendedSubscriptionBudgetMax,
    fixedCostRatio,
    subscriptionRatio,
    fixedCostStatus,
    subscriptionStatus,
    foreignCurrencySubscriptionCount: snapshot.foreignCurrencySubscriptionCount,
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
