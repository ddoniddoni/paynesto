import { Redirect, type Href } from 'expo-router';

import { CenteredState } from '@/components/shared/centered-state';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';

export default function IndexRoute() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return (
      <CenteredState
        eyebrow="Launch"
        title="Paynesto를 준비하고 있어요"
        description="로그인 상태를 확인한 뒤 적절한 화면으로 바로 보내드릴게요."
        isLoading
      />
    );
  }

  if (status === 'authenticated' || status === 'preview') {
    return <Redirect href={'/(app)' as Href} />;
  }

  return <Redirect href={'/sign-in' as Href} />;
}
