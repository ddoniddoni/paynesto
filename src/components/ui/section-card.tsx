import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

type SectionCardProps = ViewProps & {
  eyebrow?: string;
  title: string;
  description: string;
  tone?: 'default' | 'accent';
};

export function SectionCard({
  eyebrow,
  title,
  description,
  tone = 'default',
  style,
  children,
  ...rest
}: SectionCardProps) {
  return (
    <Card tone={tone} style={style} {...rest}>
      {eyebrow ? (
        <ThemedText type="eyebrow" themeColor="textSecondary">
          {eyebrow}
        </ThemedText>
      ) : null}
      <View style={styles.copyBlock}>
        <ThemedText type="heading">{title}</ThemedText>
        <ThemedText themeColor="textSecondary">{description}</ThemedText>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  copyBlock: {
    gap: Spacing.one,
  },
});
