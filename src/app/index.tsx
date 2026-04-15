import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { plans } from '@/mocks/plans';

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const featuredPlan = plans[1];

  return (
    <ThemedView style={styles.page}>
      <ScrollView
        contentInset={{
          top: safeAreaInsets.top,
          left: safeAreaInsets.left,
          right: safeAreaInsets.right,
          bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        }}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.heroSection}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Expo + React Native starter
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              Subscription Mobile
            </ThemedText>
            <ThemedText style={styles.lead}>
              A clean starting point for a customer-facing subscription app with room to grow into
              billing, account, and retention workflows.
            </ThemedText>
          </View>

          <SectionCard
            eyebrow="Ready now"
            title="Project scaffold"
            description="Expo Router, TypeScript strict mode, linting, and a simple two-tab shell are already in place.">
            <View style={styles.bulletList}>
              <ThemedText>- Home tab for product and setup overview</ThemedText>
              <ThemedText>- Plans tab backed by local mock data</ThemedText>
              <ThemedText>- Shared UI card component for fast screen building</ThemedText>
            </View>
          </SectionCard>

          <SectionCard
            eyebrow="Suggested next work"
            title="Build the customer journey"
            description="The next screens to add are sign-in, checkout, subscription detail, and billing history.">
            <Link href="/plans" asChild>
              <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <ThemedText style={styles.primaryButtonText}>Open plans</ThemedText>
              </Pressable>
            </Link>
          </SectionCard>

          <SectionCard
            eyebrow="Featured plan"
            title={`${featuredPlan.name} ${featuredPlan.priceLabel}/${featuredPlan.billingCycle}`}
            description={featuredPlan.description}>
            <ThemedText type="small" themeColor="textSecondary">
              {featuredPlan.seatLabel}
            </ThemedText>
          </SectionCard>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 16,
  },
  heroSection: {
    gap: 12,
    paddingVertical: 8,
  },
  title: {
    maxWidth: 520,
  },
  lead: {
    maxWidth: 560,
  },
  bulletList: {
    gap: 8,
  },
  primaryButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#1f6feb',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.85,
  },
});
