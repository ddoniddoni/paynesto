import type {
  ExchangeRateSnapshot,
  FxVolatilityDirection,
  Subscription,
  SubscriptionFxEstimate,
} from '@/types/domain';
import { getMonthlyNormalizedAmount } from '@/features/subscriptions/utils/subscription-utils';

function roundCurrency(value: number) {
  return Math.round(value);
}

function getVolatilityDirection(delta: number): FxVolatilityDirection {
  if (Math.abs(delta) < 1) {
    return 'stable';
  }

  return delta > 0 ? 'up' : 'down';
}

export function createSubscriptionFxEstimate(
  subscription: Subscription,
  snapshot: ExchangeRateSnapshot,
  bufferPercent = 0.02
): SubscriptionFxEstimate | null {
  if (subscription.currency !== 'USD' || !subscription.isActive) {
    return null;
  }

  const estimatedKrwAmount = roundCurrency(subscription.amount * snapshot.rate);
  const previousRate = snapshot.previousRate ?? snapshot.rate;
  const previousEstimatedAmount = subscription.amount * previousRate;
  const volatilityDelta = estimatedKrwAmount - previousEstimatedAmount;

  return {
    subscriptionId: subscription.id,
    currency: 'USD',
    originalAmount: subscription.amount,
    exchangeRate: snapshot.rate,
    estimatedKrwAmount,
    estimateLowKrwAmount: roundCurrency(estimatedKrwAmount),
    estimateHighKrwAmount: roundCurrency(estimatedKrwAmount * (1 + bufferPercent)),
    normalizedMonthlyKrwAmount: roundCurrency(
      getMonthlyNormalizedAmount(estimatedKrwAmount, subscription.billingCycle)
    ),
    volatilityDirection: getVolatilityDirection(volatilityDelta),
    volatilityDelta: roundCurrency(volatilityDelta),
    fetchedAt: snapshot.fetchedAt,
    sourceLabel: snapshot.sourceLabel,
  };
}

export function getUsdSubscriptionEstimates(
  subscriptions: Subscription[],
  snapshot: ExchangeRateSnapshot | null
) {
  if (!snapshot) {
    return [];
  }

  return subscriptions
    .map((subscription) => createSubscriptionFxEstimate(subscription, snapshot))
    .filter((estimate): estimate is SubscriptionFxEstimate => Boolean(estimate));
}

export function formatEstimatedKrw(amount: number) {
  return `약 ${new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function formatExchangeRate(rate: number) {
  return `1 USD = ${new Intl.NumberFormat('ko-KR', {
    style: 'decimal',
    maximumFractionDigits: 2,
  }).format(rate)} KRW`;
}

export function formatVolatilityDirection(direction: FxVolatilityDirection, delta: number) {
  const amount = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(Math.abs(delta));

  if (direction === 'up') {
    return `${amount} higher than the previous estimate`;
  }

  if (direction === 'down') {
    return `${amount} lower than the previous estimate`;
  }

  return 'No meaningful change from the previous estimate';
}
