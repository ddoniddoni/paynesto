# Bootstrap Step 11: Supabase Core Schema

## Step Info

- Step number: `11`
- Branch: `step/11-supabase-core-schema`
- Recommended commit scope: `feat(supabase)`

## Step Goal

Create the missing Supabase core tables that the current app already expects
for subscriptions, Money Plan, settings, and premium state.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-11-supabase-core-schema.md`
- [x] Create `docs/steps/bootstrap-step-11-supabase-core-schema.md`
- [x] Start from the latest local `develop`

### 2. Domain/Backend

- [x] Add migration for `subscriptions`
- [x] Add migration for `user_financial_profiles`
- [x] Add migration for `notification_settings`
- [x] Add migration for `premium_transactions`
- [x] Add indexes, constraints, and RLS policies

### 3. Validation

- [x] Update docs where needed
- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `supabase/migrations/*`
- `README.md`

## Non-Goals

- seed data insertion
- webhook or billing-provider integration
- native notification delivery
