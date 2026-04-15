import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren, useState } from 'react';
import { useColorScheme } from 'react-native';

import { createAppQueryClient } from '@/lib/query-client';

export function AppProviders({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(createAppQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
