import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { plans } from '@/mocks/plans';
import { useTheme } from '@/hooks/use-theme';

export default function PlansScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={{
        top: safeAreaInsets.top,
        left: safeAreaInsets.left,
        right: safeAreaInsets.right,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
      }}
      contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Plans</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            Local mock plans you can extend into checkout, upgrade, and renewal flows.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          {plans.map((plan) => (
            <SectionCard
              key={plan.id}
              eyebrow={plan.availability === 'available' ? 'Available' : 'Coming soon'}
              title={`${plan.name} ${plan.priceLabel}/${plan.billingCycle}`}
              description={plan.description}>
              <View style={styles.planMeta}>
                <ThemedText type="small" themeColor="textSecondary">
                  {plan.seatLabel}
                </ThemedText>
                <View style={styles.featureList}>
                  {plan.features.map((feature) => (
                    <ThemedText key={feature} type="small">
                      - {feature}
                    </ThemedText>
                  ))}
                </View>
              </View>
            </SectionCard>
          ))}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  container: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: MaxContentWidth,
  },
  titleContainer: {
    gap: Spacing.two,
    paddingBottom: 24,
  },
  centerText: {
    maxWidth: 520,
  },
  sectionsWrapper: {
    gap: 16,
  },
  planMeta: {
    gap: 10,
  },
  featureList: {
    gap: 6,
  },
});
