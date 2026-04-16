import { useLocalSearchParams } from 'expo-router';

import { SubscriptionFormScreen } from '@/features/subscriptions/screens/subscription-form-screen';

export default function SubscriptionEditRoute() {
  const params = useLocalSearchParams<{ subscriptionId?: string }>();

  return <SubscriptionFormScreen mode="edit" subscriptionId={params.subscriptionId ?? ''} />;
}
