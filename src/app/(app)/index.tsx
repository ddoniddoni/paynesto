import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { signOut } from '@/features/auth/services/auth-service';
import { plans } from '@/mocks/plans';

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const featuredPlan = plans[1];
  const { user } = useAuthSession();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setSignOutError(null);
    setIsSigningOut(true);

    const result = await signOut();

    if (!result.ok) {
      setSignOutError(result.errorMessage);
    }

    setIsSigningOut(false);
  }

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
              Signed in
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              Paynesto
            </ThemedText>
            <ThemedText style={styles.lead} themeColor="textSecondary">
              {user?.email
                ? `${user.email} 계정으로 로그인되어 있어요. 이제 구독, 머니 플랜, 환율 기능을 실제 사용자 흐름으로 이어갈 수 있습니다.`
                : '로그인된 사용자 세션이 준비되었습니다.'}
            </ThemedText>
            <View style={styles.heroActions}>
              <Button onPress={() => router.push('/plans')}>Open plans</Button>
              <Button
                variant="secondary"
                loading={isSigningOut}
                onPress={handleSignOut}
                style={styles.secondaryButton}>
                Sign out
              </Button>
            </View>
            {signOutError ? (
              <ThemedText type="bodySm" themeColor="danger">
                {signOutError}
              </ThemedText>
            ) : null}
          </ThemedView>

          <SectionCard
            eyebrow="Auth foundation"
            title="Session and routing are wired"
            description="App entry now separates authenticated routes from auth routes, and Supabase session restoration runs before the main shell opens.">
            <View style={styles.bulletList}>
              <ThemedText>- Email sign-in and sign-up screens use shared form validation</ThemedText>
              <ThemedText>- Protected routes redirect back to sign-in when the session ends</ThemedText>
              <ThemedText>- React Native session persistence is configured for Supabase Auth</ThemedText>
            </View>
          </SectionCard>

          <SectionCard
            eyebrow="Suggested next work"
            title="Move into subscription CRUD"
            tone="accent"
            description="The next natural step is replacing mock plan samples with subscription list, create, edit, and detail flows.">
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
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  secondaryButton: {
    minWidth: 120,
  },
  bulletList: {
    gap: 8,
  },
});
