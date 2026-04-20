# Bootstrap Step 14: Onboarding Foundation

## Step Info

- Step number: `14`
- Branch: `step/14-onboarding-foundation`
- Recommended commit scope: `feat(onboarding)`

## Step Goal

Add a first-run onboarding flow that connects new users to Paynesto's existing
subscription, Money Plan, and notification setup path without blocking app
access.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-14-onboarding-foundation.md`
- [x] Create `docs/steps/bootstrap-step-14-onboarding-foundation.md`
- [x] Start from the latest local `develop`

### 2. Onboarding Foundation

- [x] Add onboarding domain types and route-decision helpers
- [x] Add preview and Supabase repository support
- [x] Add Supabase migration for onboarding status
- [x] Add onboarding route and app guard
- [x] Add onboarding screen with setup actions and completion feedback
- [x] Add tests for onboarding behavior

### 3. Validation

- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/app/**/*`
- `src/features/onboarding/**/*`
- `src/types/domain.ts`
- `supabase/migrations/*`
- `tests/onboarding/*`

## Non-Goals

- mandatory questionnaire
- bank/card integration
- push permission prompt during onboarding
- analytics instrumentation
