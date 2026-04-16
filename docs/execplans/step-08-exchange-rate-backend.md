# Step 08 Exec Plan: Exchange Rate Backend

## Goal

`step/08-exchange-rate-backend` adds the first secure backend boundary for
Paynesto's USD to KRW exchange-rate flow.

After this step:

- the app can ask a Supabase Edge Function for a fresh USD/KRW snapshot
- the backend can persist the latest snapshot into `exchange_rate_snapshots`
- the app falls back from `function -> snapshot table -> preview` without
  breaking the UX
- the FX backend contract is documented so local and hosted setup are clear

## Current State

The app already has:

- exchange-rate snapshot domain types and estimate utilities
- Home and Subscription screens showing USD estimate UI
- a Supabase repository that reads the latest cached snapshot from
  `exchange_rate_snapshots`
- preview fallback when the FX table is not ready

What is missing:

- a Supabase migration for the FX snapshot table
- a secure server-side fetch path for live USD/KRW data
- client logic that prefers a fresh function result before falling back
- setup docs for deploying the FX backend pieces

## Assumptions

- Step 08 still supports USD to KRW only.
- Frankfurter is acceptable for the first live FX source because it does not
  require shipping secrets to the app.
- Snapshot persistence should happen in the Edge Function so the client stays
  thin.
- If the function fails, the app should keep using the latest cached snapshot.
- If neither function nor table is available, preview mode must still keep the
  app usable.

## Scope

### In Scope

- step planning docs for Step 08
- Supabase SQL migration for `exchange_rate_snapshots`
- Supabase Edge Function for fetching and persisting USD/KRW snapshots
- client repository update to invoke the function first
- tests for new repository fallback helpers
- README updates for FX backend setup

### Out of Scope

- scheduled refresh jobs
- premium FX alert delivery
- multiple foreign currencies
- chart/history UI for FX trends
- direct client-side external FX API access

## Implementation Steps

### 1. Define the backend storage contract

- Add a migration for `exchange_rate_snapshots`.
- Keep metadata needed by the app: base/quote, current rate, previous rate,
  fetched time, expiry, and source label.
- Allow authenticated reads while keeping writes behind the backend path.

### 2. Add the Edge Function

- Fetch the latest USD/KRW rate from Frankfurter.
- Load the previous snapshot to compute `previous_rate`.
- Persist the latest snapshot with a service-role Supabase client.
- Return a normalized JSON payload for the app.

### 3. Update the app data path

- Try `supabase.functions.invoke('fx-usd-krw')` first.
- If the function fails, read the latest cached row from
  `exchange_rate_snapshots`.
- If the table is missing or empty, fall back to preview data.

### 4. Verify and document

- Add tests for repository helper behavior and response mapping.
- Update README with function deploy and redirect-free setup notes.
- Run lint, typecheck, and tests.

## Risks

### Hosted function secrets/setup may be incomplete

The Edge Function needs Supabase defaults and deployment setup that may not yet
exist in the repo.

Mitigation:

- add local `supabase/` structure in this step
- document the required deploy command and table/function relationship

### Fresh fetch could fail more often than cached reads

Network or third-party API issues may make live calls unstable.

Mitigation:

- treat the function as the preferred path, not the only path
- keep the latest snapshot-table fallback before preview mode

### Duplicate snapshots could bloat the table

If the function inserts a new row every call, storage becomes noisy.

Mitigation:

- use one row per currency pair with `upsert`
- update timestamps and `previous_rate` in place

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- app still shows USD estimates when the function is unavailable
- app prefers fresh function data when Supabase is configured
- preview mode remains usable when Supabase FX resources are missing
