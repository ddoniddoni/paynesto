import { useRouter, type Href } from 'expo-router';

import { EmailAuthScreen } from '@/features/auth/screens/email-auth-screen';
import { signInWithEmailPassword, signInWithGoogle } from '@/features/auth/services/auth-service';

export default function SignInRoute() {
  const router = useRouter();

  return (
    <EmailAuthScreen
      mode="sign-in"
      onSubmit={signInWithEmailPassword}
      onGoogleSignIn={signInWithGoogle}
      onAlternateAction={() => router.push('/sign-up' as Href)}
    />
  );
}
