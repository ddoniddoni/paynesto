import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SubscriptionStatus } from '@/types/domain';

const badgeCopy: Record<SubscriptionStatus, string> = {
  trial: '무료체험',
  active: '활성',
  past_due: '결제이슈',
  canceled: '해지',
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const theme = useTheme();
  const colors =
    status === 'trial'
      ? { backgroundColor: theme.surfaceAccent, textColor: theme.primary }
      : status === 'canceled'
        ? { backgroundColor: theme.surface, textColor: theme.textMuted }
        : status === 'past_due'
          ? { backgroundColor: theme.danger, textColor: theme.primaryForeground }
          : { backgroundColor: theme.backgroundSelected, textColor: theme.text };

  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }]}>
      <ThemedText type="bodySm" style={{ color: colors.textColor }}>
        {badgeCopy[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
