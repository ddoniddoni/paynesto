/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#454040',
    textSecondary: '#605B51',
    textMuted: '#605B51B8',
    background: '#E6F08214',
    backgroundElement: '#D8D36524',
    backgroundSelected: '#D8D36566',
    surface: '#E6F0821C',
    surfaceElevated: '#E6F08230',
    surfaceAccent: '#D8D36570',
    border: '#605B5136',
    borderStrong: '#454040',
    primary: '#454040',
    primaryForeground: '#E6F082',
    success: '#D8D365',
    danger: '#454040',
    inputBackground: '#E6F08220',
    inputBorder: '#605B514D',
    inputBorderFocused: '#454040',
    inputPlaceholder: '#605B51AA',
  },
  dark: {
    text: '#E6F082',
    textSecondary: '#D8D365',
    textMuted: '#D8D365B8',
    background: '#454040',
    backgroundElement: '#605B51',
    backgroundSelected: '#D8D36533',
    surface: '#605B51CC',
    surfaceElevated: '#605B51',
    surfaceAccent: '#D8D3652E',
    border: '#D8D36540',
    borderStrong: '#E6F082',
    primary: '#E6F082',
    primaryForeground: '#454040',
    success: '#D8D365',
    danger: '#E6F082',
    inputBackground: '#605B51',
    inputBorder: '#D8D36555',
    inputBorderFocused: '#E6F082',
    inputPlaceholder: '#D8D365A0',
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
