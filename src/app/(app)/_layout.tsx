import { Redirect, type Href } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { CenteredState } from '@/components/shared/centered-state';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';

export default function AppLayout() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return (
      <CenteredState
        eyebrow="Auth"
        title="세션을 확인하고 있어요"
        description="저장된 로그인 상태를 불러온 뒤 앱 화면으로 이어갈게요."
        isLoading
      />
    );
  }

  if (status !== 'authenticated') {
    return <Redirect href={'/sign-in' as Href} />;
  }

  return <AppTabs />;
}
