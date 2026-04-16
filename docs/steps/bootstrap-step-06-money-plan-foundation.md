# Bootstrap Step 06: Money Plan Foundation

## Step Info

- Step number: `06`
- Branch: `step/06-money-plan-foundation`
- Recommended commit scope: `feat(money-plan)`

## Step Goal

Add the first usable Money Plan flow with manual salary and fixed-cost inputs,
plus a rules-based budget report.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-06-money-plan-foundation.md`
- [x] Create `docs/steps/bootstrap-step-06-money-plan-foundation.md`
- [x] Start from the latest `develop`

### 2. Domain

- [x] Add financial profile types
- [x] Add budget report types
- [x] Add Money Plan schema and calculation utilities

### 3. Data layer

- [x] Add Money Plan repository contract
- [x] Add Supabase repository
- [x] Add preview fallback repository
- [x] Add query and mutation hooks

### 4. UI and routing

- [x] Add Money Plan route and screen
- [x] Add Money Plan tab entry
- [x] Show loading, empty, error, and success states
- [x] Support save/update flow with user feedback

### 5. Validation

- [x] Add or update unit tests
- [x] Update docs where needed
- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/app/*`
- `src/features/money-plan/**/*`
- `src/types/domain.ts`
- `tests/money-plan/*`
- `README.md`

## Non-Goals

- debt planning
- premium-gated recommendations
- FX integration inside the Money Plan report
- charts
