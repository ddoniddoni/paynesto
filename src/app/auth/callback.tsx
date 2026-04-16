import { useRouter, type Href } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

import { CenteredState } from '@/components/shared/centered-state';
import { completeOAuthSessionFromUrl } from '@/features/auth/services/auth-service';

type CallbackStatus = 'loading' | 'error';

export default function AuthCallbackRoute() {
  const router = useRouter();
  const url = Linking.useURL();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function completeSignIn() {
      const currentUrl = url ?? (typeof window !== 'undefined' ? window.location.href : null);

      if (!currentUrl) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Could not find the auth callback URL. Please try again.');
        }

        return;
      }

      const result = await completeOAuthSessionFromUrl(currentUrl);

      if (!isMounted) {
        return;
      }

      if (!result.ok) {
        setStatus('error');
        setErrorMessage(result.errorMessage);
        return;
      }

      router.replace('/(app)' as Href);
    }

    void completeSignIn();

    return () => {
      isMounted = false;
    };
  }, [router, url]);

  if (status === 'error') {
    return (
      <CenteredState
        eyebrow="Auth callback"
        title="Google sign-in could not be completed"
        description={
          errorMessage ??
          'The Google sign-in flow did not finish correctly. Please try again or use email sign-in.'
        }
        actionLabel="Back to sign in"
        onAction={() => router.replace('/sign-in' as Href)}
      />
    );
  }

  return (
    <CenteredState
      eyebrow="Auth callback"
      title="Finishing Google sign-in"
      description="We are connecting your session and taking you back into the app."
      isLoading
    />
  );
}
