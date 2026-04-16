import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { signOut } from '@/features/auth/services/auth-service';
import { useSubscriptionsQuery } from '@/features/subscriptions/hooks/use-subscriptions';
import {
  getNextUpcomingSubscription,
  getTrialEndingCount,
} from '@/features/subscriptions/utils/subscription-utils';
import { formatAppDate } from '@/lib/date';

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthSession();
  const subscriptionsQuery = useSubscriptionsQuery();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const subscriptions = subscriptionsQuery.data?.data ?? [];
  const nextBilling = getNextUpcomingSubscription(subscriptions);
  const sourceLabel =
    subscriptionsQuery.data?.source === 'preview'
      ? 'Preview mode'
      : subscriptionsQuery.data?.source === 'supabase'
        ? 'Supabase sync'
        : 'Loading';

  async function handleSignOut() {
    setSignOutError(null);
    setIsSigningOut(true);

    const result = await signOut();

    if (!result.ok) {
      setSignOutError(result.errorMessage);
    }

    setIsSigningOut(false);
  }

  if (subscriptionsQuery.isPending) {
    return (
      <CenteredState
        eyebrow="Home"
        title="홈 요약을 준비하고 있어요"
        description="구독 수와 다음 결제 정보를 정리한 뒤 대시보드를 보여드릴게요."
        isLoading
      />
    );
  }

  if (subscriptionsQuery.isError) {
    return (
      <CenteredState
        eyebrow="Home"
        title="홈 요약을 불러오지 못했어요"
        description={
          subscriptionsQuery.error instanceof Error
            ? subscriptionsQuery.error.message
            : '잠시 후 다시 시도해 주세요.'
        }
        actionLabel="다시 시도"
        onAction={() => void subscriptionsQuery.refetch()}
      />
    );
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
            <ThemedText type="bodySm" themeColor="textSecondary">
              현재 데이터 소스: {sourceLabel}
            </ThemedText>
            <View style={styles.heroActions}>
              <Button onPress={() => router.push('/subscriptions' as Href)}>Open subscriptions</Button>
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
            title={`${subscriptions.filter((subscription) => subscription.isActive).length}개의 활성 구독`}
            description="Step 4부터는 홈에서도 실제 구독 데이터를 요약해서 보여주기 시작합니다.">
            <View style={styles.bulletList}>
              <ThemedText>- 다음 결제 예정: {nextBilling ? `${nextBilling.serviceName} · ${formatAppDate(nextBilling.nextBillingDate)}` : '예정 없음'}</ThemedText>
              <ThemedText>- 무료체험 관리: {getTrialEndingCount(subscriptions)}개</ThemedText>
              <ThemedText>- USD 구독 수: {subscriptions.filter((subscription) => subscription.currency === 'USD').length}개</ThemedText>
            </View>
          </SectionCard>

          <SectionCard
            eyebrow="Suggested next work"
            title="Subscription CRUD is live"
            tone="accent"
            description="목록, 상세, 추가, 수정, 삭제 흐름을 Subscriptions 탭에서 이어서 확인할 수 있습니다.">
            <Button variant="secondary" onPress={() => router.push('/subscriptions' as Href)}>
              Review subscriptions
            </Button>
          </SectionCard>

          <SectionCard
            eyebrow="Next billing"
            title={nextBilling ? nextBilling.serviceName : '등록된 결제 예정 없음'}
            description={
              nextBilling
                ? `${formatAppDate(nextBilling.nextBillingDate)} 결제 예정 · ${nextBilling.currency} ${nextBilling.amount}`
                : '첫 구독을 추가하면 홈에서 다음 결제일을 요약해 보여줄게요.'
            }>
            <ThemedText type="bodySm" themeColor="textSecondary">
              {subscriptionsQuery.data?.source === 'preview'
                ? '현재는 preview 데이터로 흐름을 확인 중입니다.'
                : '현재는 Supabase 데이터로 흐름을 확인 중입니다.'}
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
