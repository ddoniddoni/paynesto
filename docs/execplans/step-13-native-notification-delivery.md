# Step 13 Exec Plan: Native Notification Delivery

## Goal

`step/13-native-notification-delivery` connects the existing notification
scheduling foundation to real device-level local notifications.

After this step:

- Paynesto can request and explain local notification permission status
- notification settings can trigger device scheduling sync
- billing, trial, and premium FX watch reminders can be scheduled on-device
- the app can inspect and resync scheduled reminder requests
- unsupported environments degrade gracefully without breaking the settings flow

## Current State

The app already has:

- notification settings persisted in preview or Supabase storage
- schedule preview logic derived from settings, subscriptions, and premium state
- a notification settings screen that explains reminder candidates

What is missing:

- Expo local notification integration
- runtime permission flow
- notification channel/handler setup for native delivery
- a device scheduling service boundary that turns preview items into real
  scheduled requests

## Assumptions

- This step targets local device notifications only.
- Remote push delivery, background jobs, and server-triggered notification
  orchestration stay out of scope.
- Expo Go, web, and simulators may not provide full delivery behavior, so the
  app must show informative fallback copy instead of failing.
- The existing schedule preview model is the source of truth for what should be
  scheduled.

## Scope

### In Scope

- step planning docs for Step 13
- `expo-notifications` dependency and app config wiring
- notification permission and availability service layer
- notification schedule sync service for local reminders
- notification settings screen updates for permission, sync, loading, empty, and
  error states
- tests for scheduling sync and notification capability rules

### Out of Scope

- Expo push tokens
- Supabase/device token persistence
- background task execution
- interactive notification actions
- deep linking from notification taps

## Implementation Steps

### 1. Add native notification foundation

- Install `expo-notifications`.
- Configure app plugin and permission copy in `app.json`.
- Register a foreground notification handler and Android default channel.

### 2. Create notification device services

- Add a native service boundary that can:
  - inspect notification support and permission status
  - request permission
  - schedule reminder candidates
  - list scheduled requests
  - cancel obsolete scheduled requests
- Keep unsupported platforms safe by returning capability metadata instead of
  throwing.

### 3. Connect scheduling sync to app state

- Build a hook that combines notification settings, subscriptions, premium
  status, and schedule preview into a sync action.
- Limit scheduled items to a small near-term set so the first version stays
  predictable and reviewable.

### 4. Update settings UX

- Show permission status, unsupported-state copy, sync result feedback, and
  scheduled item summary.
- Make save flow and sync flow explicit so users understand when reminders were
  applied to the device.

### 5. Verify

- Add tests for permission-capability helpers and schedule sync mapping.
- Run lint, typecheck, and test.

## Risks

### Native behavior differs by platform

Android, iOS, web, Expo Go, and simulators do not behave the same for local
notifications.

Mitigation:

- centralize environment checks in one service
- surface clear unsupported-state copy in UI
- avoid claiming full delivery where the runtime cannot provide it

### Scheduled reminders can drift from current settings

If the user changes settings or subscriptions, stale scheduled notifications may
remain on device.

Mitigation:

- use deterministic identifiers
- resync by canceling prior Paynesto-managed requests before scheduling fresh
  ones

### Permission prompts can feel abrupt

Jumping straight to the OS dialog can reduce trust.

Mitigation:

- explain why notifications matter in product language first
- show current permission state and only prompt on explicit user action

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- preview mode no longer breaks dashboard or settings navigation
- notification settings can request permission without crashing
- sync action schedules upcoming reminder requests when permissions are granted
- unsupported environments show safe fallback copy
