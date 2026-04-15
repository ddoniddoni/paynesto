import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { plans } from '@/mocks/plans';

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
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
          <ThemedView type="surfaceElevated" style={styles.heroSection}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Subscription intelligence for Korean users
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              Paynesto
            </ThemedText>
            <ThemedText style={styles.lead} themeColor="textSecondary">
              Keep recurring payments, salary-based spending guidance, and USD billing estimates in
              one calm mobile experience.
            </ThemedText>
            <Button onPress={() => router.push('/plans')}>Open plans</Button>
          </ThemedView>

          <SectionCard
            eyebrow="Ready now"
            title="Project scaffold"
            description="Expo Router, TypeScript strict mode, linting, and the Step 2 design-system baseline are already in place.">
            <View style={styles.bulletList}>
              <ThemedText>- Product-facing theme, spacing, and typography tokens</ThemedText>
              <ThemedText>- Shared card, button, and input building blocks</ThemedText>
              <ThemedText>- Plans tab backed by local mock data for fast iteration</ThemedText>
            </View>
          </SectionCard>

          <SectionCard
            eyebrow="Suggested next work"
            title="Build the customer journey"
            tone="accent"
            description="The next screens to add are sign-in, checkout, subscription detail, and billing history.">
            <Button variant="secondary" onPress={() => router.push('/plans')}>
              Review plans
            </Button>
          </SectionCard>

          <SectionCard
            eyebrow="Featured plan"
            title={`${featuredPlan.name} ${featuredPlan.priceLabel}/${featuredPlan.billingCycle}`}
            description={featuredPlan.description}>
            <ThemedText type="bodySm" themeColor="textSecondary">
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
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
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
});
