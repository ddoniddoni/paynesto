import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AuthSessionProvider } from '@/features/auth/providers/auth-session-provider';
import { configureNotificationRuntime } from '@/features/notifications/services/notification-device-service';
import { createAppQueryClient } from '@/lib/query-client';

export function AppProviders({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(createAppQueryClient);

  useEffect(() => {
    void configureNotificationRuntime().catch((error) => {
      console.warn('Could not initialize notifications runtime.', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {children}
        </ThemeProvider>
      </AuthSessionProvider>
    </QueryClientProvider>
  );
}
