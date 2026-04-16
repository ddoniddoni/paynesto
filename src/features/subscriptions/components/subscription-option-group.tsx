import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SubscriptionOptionGroupProps<TOption extends string> = {
  label: string;
  helperText?: string;
  value: TOption;
  options: readonly TOption[];
  labels?: Partial<Record<TOption, string>>;
  onChange: (value: TOption) => void;
};

export function SubscriptionOptionGroup<TOption extends string>({
  label,
  helperText,
  value,
  options,
  labels,
  onChange,
}: SubscriptionOptionGroupProps<TOption>) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.copyBlock}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {helperText ? (
          <ThemedText type="bodySm" themeColor="textSecondary">
            {helperText}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.optionWrap}>
        {options.map((option) => {
          const isSelected = option === value;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => onChange(option)}
              style={({ pressed }) => [
                styles.option,
                {
                  borderColor: isSelected ? theme.primary : theme.border,
                  backgroundColor: isSelected ? theme.surfaceAccent : theme.surface,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText
                type="bodySm"
                style={{ color: isSelected ? theme.primary : theme.textSecondary }}>
                {labels?.[option] ?? option}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  copyBlock: {
    gap: Spacing.one,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  option: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.82,
  },
});
