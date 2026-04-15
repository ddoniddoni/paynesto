import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type SectionCardProps = ViewProps & {
  eyebrow?: string;
  title: string;
  description: string;
};

export function SectionCard({
  eyebrow,
  title,
  description,
  style,
  children,
  ...rest
}: SectionCardProps) {
  return (
    <ThemedView type="backgroundElement" style={[styles.card, style]} {...rest}>
      {eyebrow ? (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {eyebrow}
        </ThemedText>
      ) : null}
      <View style={styles.copyBlock}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText>{description}</ThemedText>
      </View>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: Spacing.two,
  },
  copyBlock: {
    gap: Spacing.one,
  },
});
