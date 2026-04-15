import { StyleSheet, type ViewProps } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = ViewProps & {
  tone?: 'default' | 'accent';
};

export function Card({ tone = 'default', style, children, ...rest }: CardProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type={tone === 'accent' ? 'surfaceAccent' : 'surface'}
      style={[
        styles.card,
        {
          borderColor: tone === 'accent' ? theme.borderStrong : theme.border,
          shadowColor: theme.text,
        },
        style,
      ]}
      {...rest}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: Spacing.two,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
});
