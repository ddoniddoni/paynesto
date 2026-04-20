# Bootstrap Step 15: Subscription Filtering

## Step Info

- Step number: `15`
- Branch: `step/15-subscription-filtering`
- Recommended commit scope: `feat(subscriptions)`

## Step Goal

Add local category, currency, and billing-cycle filters to the Subscriptions
screen so users can inspect recurring costs by practical dimensions.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-15-subscription-filtering.md`
- [x] Create `docs/steps/bootstrap-step-15-subscription-filtering.md`
- [x] Start from the latest local `develop`

### 2. Subscription Filtering

- [x] Add filter value types and subscription filter helpers
- [x] Add tests for filter behavior
- [x] Add filter controls to the Subscriptions screen
- [x] Align summary cards and FX estimates with filtered results
- [x] Add filtered empty state and reset action

### 3. Validation

- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/features/subscriptions/**/*`
- `tests/subscriptions/*`

## Non-Goals

- service-name search
- persisted filter settings
- server-side query filtering
- list sorting controls
