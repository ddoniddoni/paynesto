import React from 'react';
import { Stack } from 'expo-router';

import { AppProviders } from '@/app/providers/app-providers';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

export default function RootLayout() {
  return (
    <AppProviders>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
