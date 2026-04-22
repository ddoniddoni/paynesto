import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import type { HomeDashboardAction } from '@/features/home/utils/home-dashboard-utils';

type HomeActionCardProps = ViewProps & {
  action: HomeDashboardAction;
};

export function HomeActionCard({ action, style, ...rest }: HomeActionCardProps) {
  const router = useRouter();

  return (
    <Card tone={action.tone} style={[styles.card, style]} {...rest}>
      <View style={styles.copyBlock}>
        <ThemedText type="eyebrow" themeColor="textSecondary">
          {action.eyebrow}
        </ThemedText>
        <ThemedText type="heading">{action.title}</ThemedText>
        <ThemedText numberOfLines={2} themeColor="textSecondary">
          {action.description}
        </ThemedText>
      </View>
      <Button
        size="sm"
        variant={action.tone === 'accent' ? 'primary' : 'secondary'}
        onPress={() => router.push(action.href as Href)}
        style={styles.actionButton}>
        {action.ctaLabel}
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 152,
    justifyContent: 'space-between',
  },
  copyBlock: {
    gap: Spacing.two,
  },
  actionButton: {
    alignSelf: 'flex-end',
  },
});
