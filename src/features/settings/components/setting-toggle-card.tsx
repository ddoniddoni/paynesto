import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

type SettingToggleCardProps = {
  title: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  helperText?: string;
  actionLabel?: string;
  onAction?: () => void;
  onChange: (nextValue: boolean) => void;
};

export function SettingToggleCard({
  title,
  description,
  value,
  disabled = false,
  helperText,
  actionLabel,
  onAction,
  onChange,
}: SettingToggleCardProps) {
  return (
    <Card tone={disabled ? 'accent' : 'default'}>
      <View style={styles.copyBlock}>
        <ThemedText type="heading">{title}</ThemedText>
        <ThemedText themeColor="textSecondary">{description}</ThemedText>
        {helperText ? (
          <ThemedText type="bodySm" themeColor={disabled ? 'danger' : 'textSecondary'}>
            {helperText}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <Button
          variant={value ? 'primary' : 'secondary'}
          disabled={disabled}
          onPress={() => onChange(true)}>
          On
        </Button>
        <Button
          variant={!value ? 'primary' : 'secondary'}
          disabled={disabled}
          onPress={() => onChange(false)}>
          Off
        </Button>
        {actionLabel && onAction ? (
          <Button variant="ghost" onPress={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  copyBlock: {
    gap: Spacing.one,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
