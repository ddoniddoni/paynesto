import { StyleSheet, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

type HomeMetricCardProps = ViewProps & {
  eyebrow: string;
  value: string;
  description: string;
  tone?: 'default' | 'accent';
};

export function HomeMetricCard({
  eyebrow,
  value,
  description,
  tone = 'default',
  style,
  ...rest
}: HomeMetricCardProps) {
  return (
    <Card tone={tone} style={[styles.card, style]} {...rest}>
      <ThemedText type="eyebrow" themeColor="textSecondary">
        {eyebrow}
      </ThemedText>
      <ThemedText type="subtitle">{value}</ThemedText>
      <ThemedText themeColor="textSecondary">{description}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 164,
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
