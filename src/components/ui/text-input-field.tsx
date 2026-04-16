import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextInput as RNTextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextInputFieldProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const TextInputField = forwardRef<RNTextInput, TextInputFieldProps>(function TextInputField(
  { label, helperText, errorMessage, containerStyle, editable = true, style, onFocus, onBlur, ...rest },
  ref
) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const message = errorMessage ?? helperText;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <ThemedText type="smallBold">{label}</ThemedText> : null}
      <TextInput
        ref={ref}
        editable={editable}
        placeholderTextColor={theme.inputPlaceholder}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: editable ? theme.inputBackground : theme.surface,
            borderColor: errorMessage
              ? theme.danger
              : isFocused
                ? theme.inputBorderFocused
                : theme.inputBorder,
          },
          style,
        ]}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />
      {message ? (
        <ThemedText type="bodySm" themeColor={errorMessage ? 'danger' : 'textSecondary'}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 50,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
  },
});
