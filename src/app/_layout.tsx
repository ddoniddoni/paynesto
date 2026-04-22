import React from 'react';
import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppProviders } from '@/providers/app-providers';

export default function RootLayout() {
  return (
    <AppProviders>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
