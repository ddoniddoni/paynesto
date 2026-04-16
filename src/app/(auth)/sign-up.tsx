import { useRouter, type Href } from 'expo-router';

import { EmailAuthScreen } from '@/features/auth/screens/email-auth-screen';
import { signUpWithEmailPassword } from '@/features/auth/services/auth-service';

export default function SignUpRoute() {
  const router = useRouter();

  return (
    <EmailAuthScreen
      mode="sign-up"
      onSubmit={signUpWithEmailPassword}
      onAlternateAction={() => router.push('/sign-in' as Href)}
    />
  );
}
