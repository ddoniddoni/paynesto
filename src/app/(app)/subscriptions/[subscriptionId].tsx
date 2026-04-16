import { useLocalSearchParams } from 'expo-router';

import { SubscriptionDetailScreen } from '@/features/subscriptions/screens/subscription-detail-screen';

export default function SubscriptionDetailRoute() {
  const params = useLocalSearchParams<{ subscriptionId?: string }>();

  return <SubscriptionDetailScreen subscriptionId={params.subscriptionId ?? ''} />;
}
