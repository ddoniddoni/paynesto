# Bootstrap Step 13: Native Notification Delivery

## Step Info

- Step number: `13`
- Branch: `step/13-native-notification-delivery`
- Recommended commit scope: `feat(notifications)`

## Step Goal

Turn the notification schedule preview foundation into real local device
reminders with permission handling and scheduling sync.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-13-native-notification-delivery.md`
- [x] Create `docs/steps/bootstrap-step-13-native-notification-delivery.md`
- [x] Start from the latest local `develop`

### 2. Native Delivery

- [x] Install and configure `expo-notifications`
- [x] Add notification permission and capability service
- [x] Add local schedule sync service
- [x] Update notification settings UI for permission and sync state
- [x] Add tests for scheduling sync behavior

### 3. Validation

- [x] Update docs where needed
- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `app.json`
- `src/app/**/*`
- `src/features/notifications/**/*`
- `src/features/settings/**/*`
- `src/types/domain.ts`
- `tests/notifications/*`

## Non-Goals

- push token registration
- background notification processing
- server-driven campaigns
