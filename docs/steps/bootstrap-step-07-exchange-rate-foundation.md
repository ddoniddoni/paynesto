# Bootstrap Step 07: Exchange Rate Foundation

## Step Info

- Step number: `07`
- Branch: `step/07-exchange-rate-foundation`
- Recommended commit scope: `feat(exchange-rate)`

## Step Goal

Add a reusable USD to KRW estimate layer powered by a cached exchange-rate
snapshot and wire it into the core app views.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-07-exchange-rate-foundation.md`
- [x] Create `docs/steps/bootstrap-step-07-exchange-rate-foundation.md`
- [x] Start from the latest `develop`

### 2. Domain

- [x] Add exchange-rate snapshot types
- [x] Add subscription FX estimate utilities

### 3. Data layer

- [x] Add exchange-rate repository contract
- [x] Add Supabase snapshot repository
- [x] Add preview fallback repository
- [x] Add query hook

### 4. UI and routing

- [x] Add Home estimate summary
- [x] Add list/detail USD estimate display
- [x] Show loading/error/fallback-friendly messaging

### 5. Validation

- [x] Add or update tests
- [x] Update docs where needed
- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/features/exchange-rate/**/*`
- `src/features/subscriptions/**/*`
- `src/app/(app)/*`
- `src/types/domain.ts`
- `tests/exchange-rate/*`
- `README.md`

## Non-Goals

- secure backend function implementation
- premium FX alerts
- multiple foreign currencies
