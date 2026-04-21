# Step 16 Exec Plan: Money Plan Guidance Refresh

## Goal

`step/16-money-plan-guidance-refresh` makes the Money Plan screen feel more like
a practical budgeting product by turning the current text-only recommendation
list into clearer, action-oriented guidance.

After this step:

- users can see fixed-cost, subscription, and disposable-income pressure as
  separate guidance areas
- the app recommends concrete next actions without presenting regulated
  financial advice
- low-usage, trial, soon-billing, and duplicate-category subscriptions can show
  up as cancellation or review candidates
- the Money Plan screen remains driven by reusable domain utilities instead of
  screen-local business logic

## Current State

The app already has:

- monthly net salary and fixed-cost form
- financial profile persistence through preview and Supabase repositories
- budget report utility with fixed-cost and subscription ratios
- KRW monthly subscription normalization
- basic guidance strings
- loading, error, empty, and success states

What is missing:

- structured recommendation cards
- cancellation candidate output using the existing subscription cancellation
  score
- clearer separation between salary pressure, fixed-cost pressure, and
  subscription pressure
- tests for recommendation priority and candidate selection

## Assumptions

- This is budgeting guidance, not financial advice.
- USD subscriptions remain counted as foreign-currency items in this report
  until the Money Plan feature explicitly consumes FX estimates.
- Cancellation candidates should use active subscriptions only.
- Three top candidates are enough for a focused mobile view.
- Detailed saved goals, category budgets, and server-side recommendation storage
  are out of scope.

## Scope

### In Scope

- Step 16 planning docs
- Budget report types for structured action cards and cancellation candidates
- Pure Money Plan utility updates
- Unit tests for recommendation cards and cancellation candidates
- Money Plan screen UI refresh using existing components

### Out of Scope

- FX-inclusive Money Plan totals
- persisted recommendation dismissals
- category budget editor
- premium-only recommendation rules
- charts or historical trend analysis

## Implementation Steps

### 1. Extend budget report shape

- Add action card and cancellation candidate types.
- Keep the existing `guidance` string array for compatibility.
- Include committed-cost and disposable-income signals that the UI can render
  without recalculating.

### 2. Build recommendation helpers

- Create structured guidance for fixed-cost pressure.
- Create structured guidance for subscription pressure.
- Create structured guidance for disposable income.
- Add cancellation candidate selection using cancellation score, billing date,
  duplicate category count, and usage frequency.

### 3. Add tests

- Verify high-pressure budgets produce urgent action cards.
- Verify low-usage and soon-billing subscriptions rank higher.
- Verify inactive subscriptions are excluded.
- Verify foreign-currency subscriptions remain excluded from KRW totals but are
  explained.

### 4. Refresh Money Plan screen

- Render action cards with priority, reason, and next step.
- Render top subscription review candidates.
- Keep the existing form, loading, error, empty, and success flows.
- Avoid placing business rules directly in the screen component.

### 5. Verify

- Run lint, typecheck, and tests.

## Risks

### Guidance could sound like regulated financial advice

Mitigation:

- use budgeting language
- avoid guarantees or investment/credit guidance
- present recommendations as practical review steps

### Candidate scoring could feel opaque

Mitigation:

- include short reason labels for each candidate
- keep the score internal and show plain next actions

### UI could become too dense

Mitigation:

- cap candidate count
- use compact cards and short descriptions
- retain summary cards for scanability

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- first-time profile setup still shows an empty state
- saved profile shows updated recommendation cards
- high fixed costs produce stronger fixed-cost guidance
- low-usage or trial subscriptions appear as review candidates
- no candidate state appears when there are no active subscriptions to review
