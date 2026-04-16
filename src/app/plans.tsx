import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionCard } from '@/components/ui/section-card';
import { TextInputField } from '@/components/ui/text-input-field';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { plans } from '@/mocks/plans';
import { useTheme } from '@/hooks/use-theme';

export default function PlansScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const [query, setQuery] = React.useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPlans = plans.filter((plan) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      plan.name.toLowerCase().includes(normalizedQuery) ||
      plan.description.toLowerCase().includes(normalizedQuery) ||
      plan.features.some((feature) => feature.toLowerCase().includes(normalizedQuery))
    );
  });

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
        <ThemedView type="surfaceElevated" style={styles.headerCard}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Design-system sample
            </ThemedText>
            <ThemedText type="subtitle">Plans</ThemedText>
            <ThemedText style={styles.centerText} themeColor="textSecondary">
              Local mock plans you can extend into checkout, upgrade, and renewal flows.
            </ThemedText>
          </ThemedView>

          <TextInputField
            label="Search plans"
            placeholder="Starter, Growth, analytics..."
            value={query}
            onChangeText={setQuery}
            helperText="This filter is local-only and helps validate the shared input component."
          />
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          {filteredPlans.length === 0 ? (
            <SectionCard
              eyebrow="No match"
              tone="accent"
              title="No plans matched your search"
              description="Try a plan name, billing term, or feature keyword to see the mock data again."
            />
          ) : null}

          {filteredPlans.map((plan) => (
            <SectionCard
              key={plan.id}
              eyebrow={plan.availability === 'available' ? 'Available' : 'Coming soon'}
              title={`${plan.name} ${plan.priceLabel}/${plan.billingCycle}`}
              description={plan.description}>
              <View style={styles.planMeta}>
                <ThemedText type="bodySm" themeColor="textSecondary">
                  {plan.seatLabel}
                </ThemedText>
                <View style={styles.featureList}>
                  {plan.features.map((feature) => (
                    <ThemedText key={feature} type="bodySm">
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
    gap: Spacing.three,
  },
  headerCard: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  titleContainer: {
    gap: Spacing.two,
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
