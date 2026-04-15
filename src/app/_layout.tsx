import React from 'react';

import { AppProviders } from '@/app/providers/app-providers';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

export default function TabLayout() {
  return (
    <AppProviders>
      <AnimatedSplashOverlay />
      <AppTabs />
    </AppProviders>
  );
}
