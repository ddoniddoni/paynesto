import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CenteredStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  isLoading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export function CenteredState({
  eyebrow,
  title,
  description,
  isLoading = false,
  actionLabel,
  onAction,
}: CenteredStateProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.page}>
      <View style={styles.container}>
        <ThemedView type="surfaceElevated" style={styles.card}>
          {eyebrow ? (
            <ThemedText type="eyebrow" themeColor="textSecondary">
              {eyebrow}
            </ThemedText>
          ) : null}
          <View style={styles.copyBlock}>
            <ThemedText type="heading">{title}</ThemedText>
            <ThemedText themeColor="textSecondary">{description}</ThemedText>
          </View>
          {isLoading ? <ActivityIndicator color={theme.primary} size="small" /> : null}
          {actionLabel && onAction ? <Button onPress={onAction}>{actionLabel}</Button> : null}
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  card: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  copyBlock: {
    gap: Spacing.one,
  },
});
