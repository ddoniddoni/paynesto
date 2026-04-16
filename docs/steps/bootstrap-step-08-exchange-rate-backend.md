# Bootstrap Step 08: Exchange Rate Backend

## Step Info

- Step number: `08`
- Branch: `step/08-exchange-rate-backend`
- Recommended commit scope: `feat(exchange-rate)`

## Step Goal

Add the first secure FX backend path so the app can request a live USD/KRW
snapshot through Supabase without exposing third-party API access in the
client.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-08-exchange-rate-backend.md`
- [x] Create `docs/steps/bootstrap-step-08-exchange-rate-backend.md`
- [x] Start from the latest `develop`

### 2. Supabase backend

- [x] Add `exchange_rate_snapshots` migration
- [x] Add `fx-usd-krw` Edge Function
- [x] Document deployment/setup expectations

### 3. App data layer

- [x] Invoke the Edge Function for fresh snapshots
- [x] Keep snapshot-table fallback
- [x] Keep preview fallback for missing backend resources

### 4. Validation

- [x] Add or update tests
- [x] Update docs where needed
- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `supabase/functions/**/*`
- `supabase/migrations/*`
- `src/features/exchange-rate/**/*`
- `tests/exchange-rate/*`
- `README.md`

## Non-Goals

- scheduled Edge Function refresh
- historical rate charts
- currencies beyond USD/KRW
