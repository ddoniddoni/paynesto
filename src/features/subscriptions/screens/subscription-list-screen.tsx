import { useRouter, type Href } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useSubscriptionsQuery } from '@/features/subscriptions/hooks/use-subscriptions';
import {
  getNextUpcomingSubscription,
  getTrialEndingCount,
} from '@/features/subscriptions/utils/subscription-utils';
import { formatAppDate } from '@/lib/date';

import { SubscriptionListItem } from '../components/subscription-list-item';

export function SubscriptionListScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { data, isPending, isError, refetch, error } = useSubscriptionsQuery();
  const subscriptions = data?.data ?? [];
  const nextBilling = getNextUpcomingSubscription(subscriptions);
  const trialCount = getTrialEndingCount(subscriptions);
  const sourceLabel =
    data?.source === 'preview'
      ? 'Preview mode로 동작 중입니다. Supabase 환경 변수를 연결하면 실제 테이블 CRUD로 전환됩니다.'
      : 'Supabase와 연결된 구독 목록입니다.';

  if (isPending) {
    return (
      <CenteredState
        eyebrow="Subscriptions"
        title="구독 목록을 불러오고 있어요"
        description="저장된 구독과 다음 결제일을 정리해서 보여드릴게요."
        isLoading
      />
    );
  }

  if (isError) {
    return (
      <CenteredState
        eyebrow="Subscriptions"
        title="구독 목록을 불러오지 못했어요"
        description={error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.'}
        actionLabel="다시 시도"
        onAction={() => void refetch()}
      />
    );
  }

  if (subscriptions.length === 0) {
    return (
      <CenteredState
        eyebrow="Subscriptions"
        title="아직 등록한 구독이 없어요"
        description="첫 구독을 추가하면 다음 결제일과 체험 종료 흐름을 여기서 관리할 수 있어요."
        actionLabel="구독 추가"
        onAction={() => router.push('/subscriptions/create' as Href)}
      />
    );
  }

  return (
    <ThemedView style={styles.page}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        contentInset={{
          top: safeAreaInsets.top,
          left: safeAreaInsets.left,
          right: safeAreaInsets.right,
          bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        }}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <View style={styles.container}>
            <ThemedView type="surfaceElevated" style={styles.heroCard}>
              <ThemedText type="eyebrow" themeColor="textSecondary">
                Subscription hub
              </ThemedText>
              <ThemedText type="title" style={styles.heroTitle}>
                구독 관리
              </ThemedText>
              <ThemedText themeColor="textSecondary">{sourceLabel}</ThemedText>
              <Button onPress={() => router.push('/subscriptions/create' as Href)}>
                구독 추가
              </Button>
            </ThemedView>

            <View style={styles.summaryGrid}>
              <SectionCard
                eyebrow="활성 구독"
                title={`${subscriptions.filter((subscription) => subscription.isActive).length}개`}
                description="현재 관리 중인 활성 구독 수입니다."
              />
              <SectionCard
                eyebrow="다음 결제"
                title={nextBilling ? nextBilling.serviceName : '없음'}
                description={
                  nextBilling
                    ? `${formatAppDate(nextBilling.nextBillingDate)} 결제 예정`
                    : '예정된 결제가 없습니다.'
                }
              />
              <SectionCard
                eyebrow="체험 종료"
                title={`${trialCount}개`}
                description="무료체험 종료 관리가 필요한 구독 수입니다."
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <SubscriptionListItem
              subscription={item}
              onPress={() =>
                router.push(`/subscriptions/${item.id}` as Href)
              }
            />
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  heroCard: {
    gap: Spacing.two,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  heroTitle: {
    maxWidth: 520,
  },
  summaryGrid: {
    gap: Spacing.three,
  },
  listItem: {
    width: '100%',
    maxWidth: MaxContentWidth,
    marginBottom: Spacing.three,
  },
});
