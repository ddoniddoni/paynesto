/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17211D',
    textSecondary: '#52615A',
    textMuted: '#718078',
    background: '#F6F8F3',
    backgroundElement: '#E9EFE7',
    backgroundSelected: '#D7E9E2',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceAccent: '#E4F4EE',
    border: '#D8E0D8',
    borderStrong: '#8DA49A',
    primary: '#0A6B5D',
    primaryForeground: '#FFFFFF',
    success: '#2F8F61',
    danger: '#B42318',
    inputBackground: '#FFFFFF',
    inputBorder: '#C8D4CE',
    inputBorderFocused: '#0A6B5D',
    inputPlaceholder: '#7A8982',
  },
  dark: {
    text: '#F3F7F3',
    textSecondary: '#C2D0C9',
    textMuted: '#8FA09A',
    background: '#111615',
    backgroundElement: '#202A27',
    backgroundSelected: '#254B43',
    surface: '#18201E',
    surfaceElevated: '#1E2825',
    surfaceAccent: '#183C35',
    border: '#34413D',
    borderStrong: '#6B837A',
    primary: '#7FDCC5',
    primaryForeground: '#071311',
    success: '#8DD7A9',
    danger: '#FFB4A8',
    inputBackground: '#151D1A',
    inputBorder: '#40504B',
    inputBorderFocused: '#7FDCC5',
    inputPlaceholder: '#92A39D',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography = {
  display: {
    fontFamily: Fonts.sans,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  headingLg: {
    fontFamily: Fonts.sans,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  headingMd: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  bodySm: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: (Platform.select({ android: '700' }) ?? '500') as '500' | '700',
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 6,
  md: 8,
  lg: 8,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
