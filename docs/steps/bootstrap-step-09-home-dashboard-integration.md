# Bootstrap Step 09: Home Dashboard Integration

## Step Info

- Step number: `09`
- Branch: `step/09-home-dashboard-integration`
- Recommended commit scope: `feat(home)`

## Step Goal

Turn Home into a product-shaped dashboard that combines subscriptions, budget
guidance, and FX summaries with strong next actions.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-09-home-dashboard-integration.md`
- [x] Create `docs/steps/bootstrap-step-09-home-dashboard-integration.md`
- [x] Start from the latest `develop`

### 2. Domain/UI

- [x] Add Home dashboard summary utilities
- [x] Add recommendation logic
- [x] Redesign Home layout and states

### 3. Validation

- [x] Add or update tests
- [x] Update docs where needed
- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/app/(app)/index.tsx`
- `src/features/home/**/*`
- `tests/home/*`
- `README.md`

## Non-Goals

- analytics instrumentation
- notification inbox UI
- premium paywall work
