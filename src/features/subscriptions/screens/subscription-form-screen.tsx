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
      'Subscription saved',
      result.source === 'preview'
        ? 'The subscription was added to preview data.'
        : 'The subscription was saved.'
    );
    router.replace(`/subscriptions/${result.data.id}` as Href);
  }

  async function handleUpdate(input: SubscriptionWriteInput) {
    if (props.mode !== 'edit') {
      return;
    }

    const result = await editMutation.mutateAsync(input);
    Alert.alert(
      'Subscription updated',
      result.source === 'preview'
        ? 'The preview subscription was updated.'
        : 'The subscription was updated.'
    );
    router.replace(`/subscriptions/${result.data.id}` as Href);
  }

  if (props.mode === 'edit' && detailQuery.isPending) {
    return (
      <CenteredState
        eyebrow="Edit subscription"
        title="Loading subscription"
        description="We are loading the saved values before opening the edit form."
        isLoading
      />
    );
  }

  if (props.mode === 'edit' && detailQuery.isError) {
    return (
      <CenteredState
        eyebrow="Edit subscription"
        title="Could not load this subscription"
        description={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : 'Please try again in a moment.'
        }
        actionLabel="Back to list"
        onAction={() => router.replace('/subscriptions' as Href)}
      />
    );
  }

  if (props.mode === 'edit' && !detailQuery.data?.data) {
    return (
      <CenteredState
        eyebrow="Edit subscription"
        title="Subscription not found"
        description="It may have been deleted or you may not have access to it."
        actionLabel="Back to list"
        onAction={() => router.replace('/subscriptions' as Href)}
      />
    );
  }

  return (
    <SubscriptionForm
      mode={props.mode}
      initialValues={props.mode === 'edit' ? detailQuery.data?.data ?? undefined : undefined}
      submitLabel={props.mode === 'create' ? 'Save subscription' : 'Save changes'}
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
            ? 'You are editing preview data.'
            : 'You are editing Supabase data.'
          : null
      }
      onSubmit={props.mode === 'create' ? handleCreate : handleUpdate}
    />
  );
}
