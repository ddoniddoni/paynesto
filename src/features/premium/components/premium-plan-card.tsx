import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import type { PremiumPlan } from '@/types/domain';

type PremiumPlanCardProps = {
  plan: PremiumPlan;
  disabled?: boolean;
  loading?: boolean;
  onSelect: () => void;
};

export function PremiumPlanCard({
  plan,
  disabled = false,
  loading = false,
  onSelect,
}: PremiumPlanCardProps) {
  return (
    <Card tone={plan.badge ? 'accent' : 'default'}>
      <View style={styles.copyBlock}>
        {plan.badge ? (
          <ThemedText type="eyebrow" themeColor="textSecondary">
            {plan.badge}
          </ThemedText>
        ) : null}
        <ThemedText type="heading">{plan.name}</ThemedText>
        <ThemedText>{plan.priceLabel}</ThemedText>
        <ThemedText themeColor="textSecondary">{plan.description}</ThemedText>
      </View>

      <View style={styles.featureList}>
        {plan.features.map((feature) => (
          <ThemedText key={feature}>- {feature}</ThemedText>
        ))}
      </View>

      <Button
        disabled={disabled || plan.availability !== 'available'}
        loading={loading}
        onPress={onSelect}>
        {plan.availability === 'available' ? 'Choose plan' : 'Coming soon'}
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  copyBlock: {
    gap: Spacing.one,
  },
  featureList: {
    gap: Spacing.one,
  },
});
