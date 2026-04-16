import { useRouter, type Href } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredState } from '@/components/shared/centered-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  useDeleteSubscriptionMutation,
  useSubscriptionQuery,
  useSubscriptionsQuery,
} from '@/features/subscriptions/hooks/use-subscriptions';
import {
  formatMonthlyEquivalent,
  formatSubscriptionAmount,
  getCancellationScore,
  getDaysUntilDate,
  getDuplicateCategoryCount,
  getMonthlyNormalizedAmount,
  getSubscriptionStatus,
} from '@/features/subscriptions/utils/subscription-utils';
import { formatAppDate } from '@/lib/date';

import { SubscriptionStatusBadge } from '../components/subscription-status-badge';

export function SubscriptionDetailScreen({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const detailQuery = useSubscriptionQuery(subscriptionId);
  const listQuery = useSubscriptionsQuery();
  const deleteMutation = useDeleteSubscriptionMutation(subscriptionId);
  const subscription = detailQuery.data?.data;
  const monthlyEquivalent = subscription
    ? getMonthlyNormalizedAmount(subscription.amount, subscription.billingCycle)
    : 0;
  const cancellationScore =
    subscription && listQuery.data
      ? getCancellationScore({
          usageFrequency: subscription.usageFrequency,
          isTrial: subscription.isTrial,
          daysUntilBilling: getDaysUntilDate(subscription.nextBillingDate),
          duplicateCategoryCount: getDuplicateCategoryCount(
            listQuery.data.data,
            subscription.category
          ),
        })
      : 0;

  function handleDelete() {
    Alert.alert(
      '구독 삭제',
      '이 구독을 목록에서 삭제할까요? 다음 결제 추적과 체험 종료 관리에서도 함께 사라집니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteMutation.mutateAsync();
            Alert.alert(
              '삭제 완료',
              result.source === 'preview'
                ? 'Preview 목록에서 구독을 삭제했어요.'
                : '구독을 삭제했어요.'
            );
            router.replace('/subscriptions' as Href);
          },
        },
      ]
    );
  }

  if (detailQuery.isPending) {
    return (
      <CenteredState
        eyebrow="Subscription detail"
        title="구독 정보를 불러오고 있어요"
        description="상세 정보와 해지 판단 힌트를 준비하고 있습니다."
        isLoading
      />
    );
  }

  if (detailQuery.isError) {
    return (
      <CenteredState
        eyebrow="Subscription detail"
        title="구독 상세를 불러오지 못했어요"
        description={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : '잠시 후 다시 시도해 주세요.'
        }
        actionLabel="목록으로"
        onAction={() => router.replace('/subscriptions' as Href)}
      />
    );
  }

  if (!subscription) {
    return (
      <CenteredState
        eyebrow="Subscription detail"
        title="구독을 찾을 수 없어요"
        description="이미 삭제되었거나 접근할 수 없는 항목일 수 있습니다."
        actionLabel="목록으로"
        onAction={() => router.replace('/subscriptions' as Href)}
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
          <ThemedView type="surfaceElevated" style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <ThemedText type="eyebrow" themeColor="textSecondary">
                  Subscription detail
                </ThemedText>
                <ThemedText type="title" style={styles.title}>
                  {subscription.serviceName}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {subscription.category} · {subscription.paymentMethodType}
                </ThemedText>
              </View>
              <SubscriptionStatusBadge status={getSubscriptionStatus(subscription)} />
            </View>

            <View style={styles.heroActions}>
              <Button
                variant="secondary"
                onPress={() => router.push(`/subscriptions/${subscriptionId}/edit` as Href)}>
                수정
              </Button>
              <Button
                variant="ghost"
                loading={deleteMutation.isPending}
                onPress={handleDelete}
                style={styles.deleteButton}>
                삭제
              </Button>
            </View>
            {deleteMutation.isError ? (
              <ThemedText type="bodySm" themeColor="danger">
                {deleteMutation.error instanceof Error
                  ? deleteMutation.error.message
                  : '삭제 중 오류가 발생했어요.'}
              </ThemedText>
            ) : null}
          </ThemedView>

          <SectionCard
            eyebrow="금액 정보"
            title={formatSubscriptionAmount(subscription.amount, subscription.currency)}
            description={`${formatMonthlyEquivalent(monthlyEquivalent, subscription.currency)} 기준으로 비교할 수 있어요.`}
          />

          <SectionCard
            eyebrow="결제 일정"
            title={formatAppDate(subscription.nextBillingDate)}
            description={`다음 결제까지 D-${Math.max(getDaysUntilDate(subscription.nextBillingDate), 0)} 입니다.`}>
            {subscription.isTrial && subscription.trialEndDate ? (
              <ThemedText type="bodySm" themeColor="textSecondary">
                무료체험 종료일: {formatAppDate(subscription.trialEndDate)}
              </ThemedText>
            ) : null}
          </SectionCard>

          <SectionCard
            eyebrow="사용 패턴"
            title={`사용 빈도 ${subscription.usageFrequency}`}
            description={`해지 후보 점수 ${cancellationScore}점으로 계산됩니다.`}>
            <ThemedText type="bodySm" themeColor="textSecondary">
              메모: {subscription.note ?? '메모 없음'}
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
    gap: Spacing.three,
  },
  heroCard: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  heroCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    maxWidth: 520,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  deleteButton: {
    minWidth: 0,
  },
});
