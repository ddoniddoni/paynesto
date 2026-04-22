import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import {
  formatEstimatedKrw,
  formatExchangeRate,
} from '@/features/exchange-rate/utils/exchange-rate-utils';
import {
  formatMonthlyEquivalent,
  formatSubscriptionAmount,
  getDaysUntilDate,
  getMonthlyNormalizedAmount,
  getSubscriptionStatus,
} from '@/features/subscriptions/utils/subscription-utils';
import { formatAppDate } from '@/lib/date';
import type { Subscription, SubscriptionFxEstimate } from '@/types/domain';

import { SubscriptionStatusBadge } from './subscription-status-badge';

type SubscriptionListItemProps = {
  subscription: Subscription;
  fxEstimate?: SubscriptionFxEstimate;
  onPress: () => void;
};

export function SubscriptionListItem({
  subscription,
  fxEstimate,
  onPress,
}: SubscriptionListItemProps) {
  const monthlyEquivalent = getMonthlyNormalizedAmount(
    subscription.amount,
    subscription.billingCycle
  );
  const daysUntilBilling = getDaysUntilDate(subscription.nextBillingDate);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Card>
        <View style={styles.headerRow}>
          <View style={styles.copyBlock}>
            <ThemedText type="heading">{subscription.serviceName}</ThemedText>
            <ThemedText type="bodySm" themeColor="textSecondary">
              {subscription.category} / {subscription.paymentMethodType}
            </ThemedText>
          </View>
          <SubscriptionStatusBadge status={getSubscriptionStatus(subscription)} />
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Billing amount
            </ThemedText>
            <ThemedText>{formatSubscriptionAmount(subscription.amount, subscription.currency)}</ThemedText>
          </View>
          <View style={styles.metric}>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Monthly equivalent
            </ThemedText>
            <ThemedText>
              {formatMonthlyEquivalent(monthlyEquivalent, subscription.currency)}
            </ThemedText>
          </View>
        </View>

        {fxEstimate ? (
          <View style={styles.fxBox}>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Current KRW estimate
            </ThemedText>
            <ThemedText>{formatEstimatedKrw(fxEstimate.estimatedKrwAmount)}</ThemedText>
            <ThemedText type="bodySm" themeColor="textSecondary">
              {formatExchangeRate(fxEstimate.exchangeRate)}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <ThemedText type="bodySm" themeColor="textSecondary">
            Next billing {formatAppDate(subscription.nextBillingDate)} / D
            {daysUntilBilling >= 0 ? `-${daysUntilBilling}` : `+${Math.abs(daysUntilBilling)}`}
          </ThemedText>
          {subscription.currency === 'USD' ? (
            <ThemedText type="bodySm" themeColor="textSecondary">
              USD
            </ThemedText>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  copyBlock: {
    flex: 1,
    gap: Spacing.one,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metric: {
    minWidth: 140,
    gap: Spacing.one,
  },
  fxBox: {
    gap: Spacing.one,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.92,
    borderRadius: Radius.lg,
  },
});
