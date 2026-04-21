# Bootstrap Step 18: Trial Management Refresh

## Step Info

- Step number: `18`
- Branch: `step/18-trial-management-refresh`
- Recommended commit scope: `feat(subscriptions)`

## Step Goal

Improve trial tracking by adding reusable trial status logic, detail-screen
guidance, and readable subscription form copy.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-18-trial-management-refresh.md`
- [x] Create `docs/steps/bootstrap-step-18-trial-management-refresh.md`
- [x] Start from the latest local `develop`

### 2. Trial Domain

- [x] Add trial status utility
- [x] Add trial status formatting helpers
- [x] Add tests for trial timing states

### 3. Subscription UI

- [x] Add trial management guidance to the detail screen
- [x] Clean create/edit screen copy
- [x] Clean subscription form labels and helper text

### 4. Validation

- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/features/subscriptions/**/*`
- `tests/subscriptions/*`

## Non-Goals

- database schema changes
- native calendar integration
- automatic cancellation
- notification scheduling changes
