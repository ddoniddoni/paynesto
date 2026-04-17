# Step 09 Exec Plan: Home Dashboard Integration

## Goal

`step/09-home-dashboard-integration` turns the Home tab into a real product
dashboard that combines subscriptions, Money Plan, and FX insights in one
place.

After this step:

- Home shows monthly subscription cost, next billing, salary ratio, and USD FX
  estimate summaries together
- the dashboard can explain whether spending is healthy, cautionary, or heavy
- the user sees action-oriented recommendation cards instead of placeholder copy
- empty and partial-data states still guide the user toward the next setup step

## Current State

The app already has:

- subscription CRUD and summary helpers
- a Money Plan profile and budget report flow
- USD to KRW estimate support backed by cached or live FX snapshots
- a simple Home screen with a few disconnected summary cards

What is missing:

- a unified Home summary model
- stronger action cards and setup nudges
- a layout that feels like one connected dashboard
- tests for the Home recommendation logic

## Assumptions

- Home should prioritize clarity and next actions over dense financial detail.
- The dashboard should work even when Money Plan is not configured yet.
- USD estimates stay informational and can be combined with KRW subscription
  totals at a high level.
- Home can reuse existing domain utilities instead of duplicating calculations.

## Scope

### In Scope

- step planning docs for Step 09
- Home dashboard summary/recommendation utility layer
- Home screen redesign using current theme/system components
- partial-data, empty, and success states for Home
- tests for dashboard summary behavior

### Out of Scope

- charts or historical trend graphs
- push notification surfacing on Home
- new backend APIs
- My Page or premium purchase work

## Implementation Steps

### 1. Build a Home summary utility

- Combine subscriptions, Money Plan report, and FX estimates into one view
  model.
- Calculate metrics for:
  - monthly subscription total
  - upcoming billing item
  - salary ratio
  - USD estimate total
  - trial-ending count
- Generate a small set of action cards based on financial and usage signals.

### 2. Redesign the Home screen

- Replace placeholder hero copy with a stronger monthly overview.
- Group key metrics into compact cards that scan well on mobile.
- Add CTA paths to Subscriptions and Money Plan.
- Keep loading, error, empty, and partial-data states explicit.

### 3. Verify

- Add tests for Home summary and recommendation helpers.
- Run lint, typecheck, and test.

## Risks

### Too much information on the first screen

If Home tries to show every metric, the UI will feel dense and hard to scan.

Mitigation:

- keep only the most decision-relevant metrics on the first fold
- move detail into concise action cards and CTAs

### Partial data can make the dashboard feel broken

Users may have subscriptions but no Money Plan, or vice versa.

Mitigation:

- design dedicated partial-data messaging
- treat setup nudges as a first-class dashboard state

### Recommendation logic may feel arbitrary

If action cards do not clearly connect to user data, trust drops.

Mitigation:

- tie recommendations to existing budget and subscription signals
- keep explanations short and concrete

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- Home loads with subscription-only data
- Home loads with Money Plan plus FX data
- Home empty state nudges to add subscriptions or set up Money Plan
