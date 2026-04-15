import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'style'> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.small : styles.medium,
        variant === 'primary' && {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
        },
        variant === 'secondary' && {
          backgroundColor: theme.surface,
          borderColor: theme.borderStrong,
        },
        variant === 'ghost' && {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.primaryForeground : theme.primary}
          size="small"
        />
      ) : (
        <ThemedText
          type="smallBold"
          style={{
            color:
              variant === 'primary'
                ? theme.primaryForeground
                : variant === 'ghost'
                  ? theme.primary
                  : theme.text,
          }}>
          {children}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    minWidth: 120,
  },
  medium: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  small: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.52,
  },
});
