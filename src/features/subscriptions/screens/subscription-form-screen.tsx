import { useRouter, type Href } from 'expo-router';
import { Alert } from 'react-native';

import { CenteredState } from '@/components/shared/centered-state';
import { SubscriptionForm } from '@/features/subscriptions/components/subscription-form';
import {
  useCreateSubscriptionMutation,
  useSubscriptionQuery,
  useUpdateSubscriptionMutation,
} from '@/features/subscriptions/hooks/use-subscriptions';
import type { SubscriptionWriteInput } from '@/types/domain';

type SubscriptionFormScreenProps =
  | {
      mode: 'create';
    }
  | {
      mode: 'edit';
      subscriptionId: string;
    };

export function SubscriptionFormScreen(props: SubscriptionFormScreenProps) {
  const router = useRouter();
  const editableSubscriptionId = props.mode === 'edit' ? props.subscriptionId : '';
  const createMutation = useCreateSubscriptionMutation();
  const editMutation = useUpdateSubscriptionMutation(editableSubscriptionId);
  const detailQuery = useSubscriptionQuery(editableSubscriptionId);

  async function handleCreate(input: SubscriptionWriteInput) {
    const result = await createMutation.mutateAsync(input);
    Alert.alert(
      '구독 저장 완료',
      result.source === 'preview'
        ? 'Preview 목록에 새 구독을 추가했어요.'
        : '새 구독을 저장했어요.'
    );
    router.replace(`/subscriptions/${result.data.id}` as Href);
  }

  async function handleUpdate(input: SubscriptionWriteInput) {
    if (props.mode !== 'edit') {
      return;
    }

    const result = await editMutation.mutateAsync(input);
    Alert.alert(
      '구독 수정 완료',
      result.source === 'preview'
        ? 'Preview 목록의 구독을 수정했어요.'
        : '구독 정보를 업데이트했어요.'
    );
    router.replace(`/subscriptions/${result.data.id}` as Href);
  }

  if (props.mode === 'edit' && detailQuery.isPending) {
    return (
      <CenteredState
        eyebrow="Edit subscription"
        title="기존 구독 정보를 불러오고 있어요"
        description="현재 저장된 값을 먼저 가져온 뒤 수정 화면을 열게요."
        isLoading
      />
    );
  }

  if (props.mode === 'edit' && detailQuery.isError) {
    return (
      <CenteredState
        eyebrow="Edit subscription"
        title="수정할 구독을 불러오지 못했어요"
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

  if (props.mode === 'edit' && !detailQuery.data?.data) {
    return (
      <CenteredState
        eyebrow="Edit subscription"
        title="수정할 구독이 없어요"
        description="이미 삭제되었거나 접근할 수 없는 항목일 수 있습니다."
        actionLabel="목록으로"
        onAction={() => router.replace('/subscriptions' as Href)}
      />
    );
  }

  return (
    <SubscriptionForm
      mode={props.mode}
      initialValues={props.mode === 'edit' ? detailQuery.data?.data ?? undefined : undefined}
      submitLabel={props.mode === 'create' ? '구독 저장' : '변경 저장'}
      isSubmitting={props.mode === 'create' ? createMutation.isPending : editMutation.isPending}
      submitError={
        props.mode === 'create'
          ? createMutation.error instanceof Error
            ? createMutation.error.message
            : null
          : editMutation.error instanceof Error
            ? editMutation.error.message
            : null
      }
      sourceHint={
        props.mode === 'edit'
          ? detailQuery.data?.source === 'preview'
            ? '현재 preview mode로 수정 중입니다.'
            : '현재 Supabase 데이터와 연결되어 있습니다.'
          : null
      }
      onSubmit={props.mode === 'create' ? handleCreate : handleUpdate}
    />
  );
}
