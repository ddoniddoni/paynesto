# Bootstrap Step 10: My Page Foundation

## Step Info

- Step number: `10`
- Branch: `step/10-my-page-foundation`
- Recommended commit scope: `feat(my-page)`

## Step Goal

Add the missing account area for Paynesto with a My Page tab, notification
settings flow, and premium upgrade foundation.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-10-my-page-foundation.md`
- [x] Create `docs/steps/bootstrap-step-10-my-page-foundation.md`
- [x] Start from the latest local `develop`

### 2. Domain/UI

- [x] Add notification settings and premium domain foundations
- [x] Add `My Page` tab and route structure
- [x] Add notification settings screen
- [x] Add premium screen and entitlement summary
- [x] Add legal/privacy/support cards

### 3. Validation

- [x] Add or update tests
- [x] Update docs where needed
- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/app/(app)/_layout.tsx`
- `src/app/(app)/my-page/**/*`
- `src/features/my-page/**/*`
- `src/features/settings/**/*`
- `src/features/premium/**/*`
- `src/types/domain.ts`
- `tests/**/*`
- `README.md`

## Non-Goals

- live payment provider integration
- native push delivery setup
- full profile editing
