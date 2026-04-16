# Step 07 Exec Plan: Exchange Rate Foundation

## Goal

`step/07-exchange-rate-foundation` adds the first production-shaped foreign
currency estimate flow to Paynesto.

After this step:

- the app can load a cached USD/KRW exchange-rate snapshot
- USD subscriptions can show estimated KRW amounts
- home and subscription screens can explain which rate and timestamp were used
- the feature still works in preview mode when backend tables are not ready
- the FX logic is isolated so a secure server function can replace the snapshot
  source later

## Current State

The app already has:

- subscription CRUD with KRW and USD currency support
- a Money Plan flow that currently excludes foreign-currency subscriptions
- Home and Subscription screens ready for richer summary cards

What is missing:

- exchange-rate domain types
- snapshot storage/retrieval layer
- estimate calculation helpers
- USD estimate UI in list/detail/home views

## Assumptions

- Step 07 focuses on USD to KRW only, matching the current PRD priority.
- The first version uses a cached snapshot source with preview fallback.
- Secure external FX API fetching will be added in a later step behind a server
  boundary.
- FX estimates are informational and may include a small buffer range.
- If Supabase tables are missing, preview mode must keep the app usable.

## Scope

### In Scope

- step planning docs for Step 07
- exchange-rate snapshot domain types
- fx estimate domain utilities
- exchange-rate repository contract
- Supabase snapshot repository with preview fallback
- query hook for the latest USD/KRW snapshot
- UI integration for USD subscriptions in home and detail/list views
- tests for estimate and volatility calculations
- docs updates for current FX scope

### Out of Scope

- live external API fetch in this step
- Edge Functions implementation
- other currencies like JPY or EUR
- premium alert delivery
- background refresh scheduling

## Implementation Steps

### 1. Define FX domain types

- Add exchange-rate snapshot and subscription estimate types.
- Keep timestamp and source metadata available for UI messaging.

### 2. Build calculation helpers

- Estimate KRW amount from USD amount and snapshot rate.
- Provide a buffered range for approximate card/payment variance.
- Compute volatility direction against a previous estimate when available.

### 3. Add data access

- Create an exchange-rate repository interface.
- Use Supabase when configured and preview fallback otherwise.
- Support reading the latest USD/KRW snapshot.

### 4. Integrate UI

- Show USD estimate summary on Home.
- Show estimated KRW, rate, and refresh time on subscription detail.
- Show concise USD estimate info in subscription list items.

### 5. Verify

- Add tests for estimate calculations.
- Run lint, typecheck, and test.

## Risks

### Snapshot source is not yet live

The repository may not have a real backend table or function yet.

Mitigation:

- keep a preview snapshot fallback
- clearly label that the estimate is based on the latest available snapshot

### Misleading estimate precision

Actual card charge amounts may differ from the raw FX conversion.

Mitigation:

- show estimates as approximate values
- include low/high range and refresh time

### Inconsistent FX display across screens

If Home and Subscriptions calculate values differently, user trust drops.

Mitigation:

- centralize estimate logic in one utility module
- reuse the same formatter and calculation path everywhere

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- Home shows a USD estimate summary when USD subscriptions exist
- subscription list shows concise KRW estimate info for USD items
- subscription detail shows applied rate and timestamp
- preview mode remains usable when Supabase FX table is missing
