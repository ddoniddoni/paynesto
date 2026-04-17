# Bootstrap Step 12: Notification Scheduling Foundation

## Step Info

- Step number: `12`
- Branch: `step/12-notification-scheduling-foundation`
- Recommended commit scope: `feat(notifications)`

## Step Goal

Add the first real notification scheduling layer so Paynesto can preview what
reminders it would schedule from user settings and subscription data.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-12-notification-scheduling-foundation.md`
- [x] Create `docs/steps/bootstrap-step-12-notification-scheduling-foundation.md`
- [x] Start from the latest local `develop`

### 2. Domain/UI

- [x] Add notification schedule domain models
- [x] Add notification schedule preview logic
- [x] Show schedule preview on the notification settings screen
- [x] Add scheduling tests

### 3. Validation

- [x] Update docs where needed
- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/features/notifications/**/*`
- `src/features/settings/screens/**/*`
- `src/types/domain.ts`
- `tests/notifications/*`
- `README.md`

## Non-Goals

- push provider setup
- background execution
- notification permission prompts
