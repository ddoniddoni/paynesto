/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#112033',
    textSecondary: '#425466',
    textMuted: '#66768a',
    background: '#f4efe6',
    backgroundElement: '#fbf7f0',
    backgroundSelected: '#dff3eb',
    surface: '#fbf7f0',
    surfaceElevated: '#ffffff',
    surfaceAccent: '#dff3eb',
    border: '#d8cebe',
    borderStrong: '#b4a796',
    primary: '#0f766e',
    primaryForeground: '#f4fffd',
    success: '#1f7a4f',
    danger: '#b42318',
    inputBackground: '#fffdf9',
    inputBorder: '#cdbfae',
    inputBorderFocused: '#0f766e',
    inputPlaceholder: '#7c8a98',
  },
  dark: {
    text: '#f4f6f8',
    textSecondary: '#c5ced8',
    textMuted: '#99a8b7',
    background: '#14202b',
    backgroundElement: '#1a2a38',
    backgroundSelected: '#17373d',
    surface: '#1a2a38',
    surfaceElevated: '#233646',
    surfaceAccent: '#17373d',
    border: '#2e4456',
    borderStrong: '#46617a',
    primary: '#44b7a5',
    primaryForeground: '#08211e',
    success: '#58c98f',
    danger: '#ff8a80',
    inputBackground: '#182634',
    inputBorder: '#365066',
    inputBorderFocused: '#44b7a5',
    inputPlaceholder: '#8ea0b1',
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
    fontSize: 46,
    lineHeight: 52,
    fontWeight: '700',
  },
  headingLg: {
    fontFamily: Fonts.sans,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  headingMd: {
    fontFamily: Fonts.sans,
    fontSize: 24,
    lineHeight: 30,
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
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  sm: 12,
  md: 18,
  lg: 26,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
