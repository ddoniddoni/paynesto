import { describe, expect, it } from 'vitest';

import {
  createOnboardingSetupSteps,
  getOnboardingEntryTarget,
  isOnboardingFinished,
} from '@/features/onboarding/utils/onboarding-utils';
import type { OnboardingStatus } from '@/types/domain';

const completedStatus: OnboardingStatus = {
  id: 'onboarding-1',
  userId: 'user-1',
  completedAt: '2026-04-20T00:00:00.000Z',
  createdAt: '2026-04-20T00:00:00.000Z',
  updatedAt: '2026-04-20T00:00:00.000Z',
};

const skippedStatus: OnboardingStatus = {
  id: 'onboarding-2',
  userId: 'user-1',
  skippedAt: '2026-04-20T00:00:00.000Z',
  createdAt: '2026-04-20T00:00:00.000Z',
  updatedAt: '2026-04-20T00:00:00.000Z',
};

describe('onboarding-utils', () => {
  it('treats completed and skipped onboarding as finished', () => {
    expect(isOnboardingFinished(null)).toBe(false);
    expect(isOnboardingFinished(completedStatus)).toBe(true);
    expect(isOnboardingFinished(skippedStatus)).toBe(true);
  });

  it('routes authenticated users through onboarding until it is finished', () => {
    expect(getOnboardingEntryTarget('loading', null)).toBeNull();
    expect(getOnboardingEntryTarget('anonymous', null)).toBe('/sign-in');
    expect(getOnboardingEntryTarget('authenticated', null)).toBe('/onboarding');
    expect(getOnboardingEntryTarget('preview', null)).toBe('/onboarding');
    expect(getOnboardingEntryTarget('authenticated', completedStatus)).toBe('/(app)');
    expect(getOnboardingEntryTarget('preview', skippedStatus)).toBe('/(app)');
  });

  it('creates setup steps from the current account state', () => {
    const steps = createOnboardingSetupSteps({
      subscriptionCount: 2,
      hasFinancialProfile: false,
      hasNotificationSettings: true,
    });

    expect(steps).toHaveLength(3);
    expect(steps[0]).toMatchObject({
      id: 'subscriptions',
      status: 'complete',
      actionLabel: 'Review subscriptions',
    });
    expect(steps[1]).toMatchObject({
      id: 'money-plan',
      status: 'ready',
      actionLabel: 'Open Money Plan',
    });
    expect(steps[2]).toMatchObject({
      id: 'notifications',
      status: 'complete',
      actionLabel: 'Review reminders',
    });
  });
});
