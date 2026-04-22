import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { usePathname, useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type MenuItem = {
  label: string;
  description: string;
  href: Href;
  iconName: SymbolViewProps['name'];
  isActive: (pathname: string) => boolean;
};

const primaryMenuItems: MenuItem[] = [
  {
    label: 'Home',
    description: 'Dashboard, next payments, and monthly status',
    href: '/' as Href,
    iconName: { ios: 'house.fill', android: 'home', web: 'home' },
    isActive: (pathname) => pathname === '/',
  },
  {
    label: 'Subscriptions',
    description: 'List, filters, trials, and billing details',
    href: '/subscriptions' as Href,
    iconName: { ios: 'rectangle.stack.fill', android: 'subscriptions', web: 'subscriptions' },
    isActive: (pathname) => pathname.startsWith('/subscriptions'),
  },
  {
    label: 'Money Plan',
    description: 'Salary, fixed costs, and budget guidance',
    href: '/money-plan' as Href,
    iconName: { ios: 'chart.pie.fill', android: 'pie_chart', web: 'pie_chart' },
    isActive: (pathname) => pathname.startsWith('/money-plan'),
  },
  {
    label: 'My Page',
    description: 'Profile, account actions, and support',
    href: '/my-page' as Href,
    iconName: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' },
    isActive: (pathname) => pathname === '/my-page',
  },
];

const secondaryMenuItems: MenuItem[] = [
  {
    label: 'Notifications',
    description: 'Billing, trial, and FX alert preferences',
    href: '/my-page/notifications' as Href,
    iconName: { ios: 'bell.badge.fill', android: 'notifications', web: 'notifications' },
    isActive: (pathname) => pathname.startsWith('/my-page/notifications'),
  },
  {
    label: 'Premium',
    description: 'Premium plans and gated app features',
    href: '/my-page/premium' as Href,
    iconName: { ios: 'sparkles', android: 'workspace_premium', web: 'workspace_premium' },
    isActive: (pathname) => pathname.startsWith('/my-page/premium'),
  },
];

type AppChromeProps = {
  children: React.ReactNode;
  bottomNavigation?: React.ReactNode;
};

export function AppChrome({ children, bottomNavigation }: AppChromeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentItem = useMemo(
    () =>
      [...primaryMenuItems, ...secondaryMenuItems].find((item) => item.isActive(pathname)) ??
      primaryMenuItems[0],
    [pathname]
  );
  const drawerWidth = Math.min(360, Math.max(292, width - 48));

  function navigateTo(href: Href) {
    setIsMenuOpen(false);
    router.push(href);
  }

  return (
    <ThemedView style={styles.shell}>
      <ThemedView
        type="surfaceElevated"
        style={[
          styles.appBar,
          {
            borderBottomColor: theme.border,
            paddingTop: insets.top + Spacing.two,
          },
        ]}>
        <View style={styles.appBarInner}>
          <Pressable
            accessibilityLabel="Open navigation menu"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setIsMenuOpen(true)}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <SymbolView
              name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }}
              size={22}
              tintColor={theme.text}
              weight="bold"
            />
          </Pressable>

          <View style={styles.titleBlock}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Paynesto
            </ThemedText>
            <ThemedText numberOfLines={1} type="heading">
              {currentItem.label}
            </ThemedText>
          </View>

          <Pressable
            accessibilityLabel="Open premium"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => navigateTo('/my-page/premium' as Href)}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: theme.surfaceAccent },
              pressed && styles.pressed,
            ]}>
            <SymbolView
              name={{ ios: 'sparkles', android: 'workspace_premium', web: 'workspace_premium' }}
              size={20}
              tintColor={theme.primary}
              weight="bold"
            />
          </Pressable>
        </View>
      </ThemedView>

      <View style={styles.content}>{children}</View>

      {bottomNavigation ? (
        <ThemedView
          type="surfaceElevated"
          style={[
            styles.bottomNavigation,
            {
              borderTopColor: theme.border,
              paddingBottom: Math.max(insets.bottom, Spacing.two),
            },
          ]}>
          {bottomNavigation}
        </ThemedView>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
        statusBarTranslucent
        transparent
        visible={isMenuOpen}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close navigation menu"
            accessibilityRole="button"
            onPress={() => setIsMenuOpen(false)}
            style={styles.backdrop}
          />
          <ThemedView
            accessibilityViewIsModal
            type="surfaceElevated"
            style={[
              styles.drawer,
              {
                borderRightColor: theme.border,
                paddingTop: insets.top + Spacing.four,
                width: drawerWidth,
              },
            ]}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerTitleBlock}>
                <ThemedText type="eyebrow" themeColor="textSecondary">
                  Menu
                </ThemedText>
                <ThemedText type="title">Paynesto</ThemedText>
              </View>
              <Pressable
                accessibilityLabel="Close navigation menu"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setIsMenuOpen(false)}
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  size={18}
                  tintColor={theme.text}
                  weight="bold"
                />
              </Pressable>
            </View>

            <View style={styles.drawerSection}>
              {primaryMenuItems.map((item) => (
                <DrawerItem
                  isActive={item.isActive(pathname)}
                  item={item}
                  key={item.label}
                  onPress={() => navigateTo(item.href)}
                />
              ))}
            </View>

            <View style={[styles.drawerSection, styles.secondarySection]}>
              {secondaryMenuItems.map((item) => (
                <DrawerItem
                  isActive={item.isActive(pathname)}
                  item={item}
                  key={item.label}
                  onPress={() => navigateTo(item.href)}
                />
              ))}
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

type DrawerItemProps = {
  item: MenuItem;
  isActive: boolean;
  onPress: () => void;
};

function DrawerItem({ item, isActive, onPress }: DrawerItemProps) {
  const theme = useTheme();
  const activeStyle: ViewStyle = {
    backgroundColor: theme.surfaceAccent,
    borderColor: theme.borderStrong,
  };

  return (
    <Pressable
      accessibilityLabel={`Open ${item.label}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.drawerItem,
        { borderColor: theme.border },
        isActive && activeStyle,
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.drawerItemIcon,
          { backgroundColor: isActive ? theme.primary : theme.backgroundElement },
        ]}>
        <SymbolView
          name={item.iconName}
          size={18}
          tintColor={isActive ? theme.primaryForeground : theme.textSecondary}
          weight="bold"
        />
      </View>
      <View style={styles.drawerItemCopy}>
        <ThemedText type="smallBold">{item.label}</ThemedText>
        <ThemedText numberOfLines={2} type="bodySm" themeColor="textSecondary">
          {item.description}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  appBar: {
    borderBottomWidth: 1,
    zIndex: 2,
  },
  appBarInner: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    flex: 1,
  },
  bottomNavigation: {
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  drawer: {
    flex: 1,
    borderRightWidth: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  drawerTitleBlock: {
    flex: 1,
    gap: Spacing.one,
  },
  drawerSection: {
    gap: Spacing.two,
  },
  secondarySection: {
    marginTop: 'auto',
  },
  drawerItem: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  drawerItemIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.76,
  },
});
