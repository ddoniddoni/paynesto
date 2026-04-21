# Bootstrap Step 16: Money Plan Guidance Refresh

## Step Info

- Step number: `16`
- Branch: `step/16-money-plan-guidance-refresh`
- Recommended commit scope: `feat(money-plan)`

## Step Goal

Refresh Money Plan recommendations into structured, action-oriented guidance and
surface subscription review candidates using existing domain scoring logic.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-16-money-plan-guidance-refresh.md`
- [x] Create `docs/steps/bootstrap-step-16-money-plan-guidance-refresh.md`
- [x] Start from the latest local `develop`

### 2. Guidance Domain

- [x] Add structured action card and cancellation candidate output
- [x] Use fixed-cost, subscription, and disposable-income pressure signals
- [x] Rank active subscription review candidates
- [x] Preserve existing report fields for current UI compatibility

### 3. Money Plan UI

- [x] Render structured action cards
- [x] Render subscription review candidates
- [x] Keep form, loading, error, empty, and success states intact

### 4. Validation

- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/types/domain.ts`
- `src/features/money-plan/**/*`
- `tests/money-plan/*`

## Non-Goals

- FX-inclusive Money Plan totals
- persisted recommendation preferences
- charts or history views
- investment, credit, or regulated financial advice
