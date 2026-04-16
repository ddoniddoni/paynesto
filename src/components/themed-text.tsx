import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'body'
    | 'bodySm'
    | 'label'
    | 'heading'
    | 'title'
    | 'subtitle'
    | 'small'
    | 'smallBold'
    | 'eyebrow'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        variantStyles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const variantStyles = StyleSheet.create<Record<NonNullable<ThemedTextProps['type']>, TextStyle>>({
  default: Typography.body,
  body: Typography.body,
  bodySm: Typography.bodySm,
  label: Typography.label,
  heading: Typography.headingMd,
  title: Typography.display,
  subtitle: Typography.headingLg,
  small: Typography.bodySm,
  smallBold: {
    ...Typography.bodySm,
    fontWeight: '700',
  },
  eyebrow: Typography.label,
  link: {
    ...Typography.bodySm,
    textDecorationLine: 'underline',
  },
  linkPrimary: {
    ...Typography.bodySm,
    color: '#0f766e',
    fontWeight: '700',
  },
  code: Typography.code,
});
