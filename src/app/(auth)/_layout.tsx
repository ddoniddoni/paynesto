import { Redirect, Stack, type Href } from 'expo-router';

import { CenteredState } from '@/components/shared/centered-state';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';

export default function AuthLayout() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return (
      <CenteredState
        eyebrow="Auth"
        title="로그인 상태를 준비하고 있어요"
        description="기존 세션을 확인한 뒤 인증 화면으로 이어갈게요."
        isLoading
      />
    );
  }

  if (status === 'authenticated') {
    return <Redirect href={'/(app)' as Href} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
