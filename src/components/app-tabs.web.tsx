import { type Href } from 'expo-router';
import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';

import { AppChrome } from './app-chrome';
import { ThemedText } from './themed-text';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  return (
    <Tabs>
      <AppChrome
        bottomNavigation={
          <TabList asChild>
            <CustomTabList>
              <TabTrigger name="home" href="/" asChild>
                <TabButton>Home</TabButton>
              </TabTrigger>
              <TabTrigger name="subscriptions" href={'/subscriptions' as Href} asChild>
                <TabButton>Subscriptions</TabButton>
              </TabTrigger>
              <TabTrigger name="money-plan" href={'/money-plan' as Href} asChild>
                <TabButton>Money Plan</TabButton>
              </TabTrigger>
              <TabTrigger name="my-page" href={'/my-page' as Href} asChild>
                <TabButton>My Page</TabButton>
              </TabTrigger>
            </CustomTabList>
          </TabList>
        }>
        <TabSlot style={{ height: '100%' }} />
      </AppChrome>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const theme = useTheme();

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.tabButton,
        {
          backgroundColor: isFocused ? theme.surfaceAccent : 'transparent',
          borderColor: isFocused ? theme.borderStrong : 'transparent',
        },
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.tabIndicator,
          { backgroundColor: isFocused ? theme.primary : theme.textMuted },
        ]}
      />
      <ThemedText
        numberOfLines={1}
        type="smallBold"
        themeColor={isFocused ? 'text' : 'textSecondary'}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButton: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.one,
  },
  tabIndicator: {
    width: 18,
    height: 3,
    borderRadius: Radius.pill,
  },
});
