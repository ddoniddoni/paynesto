# Step 06 Exec Plan: Money Plan Foundation

## Goal

`step/06-money-plan-foundation` adds the first real Money Plan flow to
Paynesto.

After this step:

- users can enter and update a monthly financial profile
- the app can calculate a rules-based budget report from salary, fixed costs,
  and current subscription totals
- a dedicated Money Plan screen exists in the app navigation
- the screen supports loading, empty, error, and success states
- the feature works with Supabase when configured and falls back to preview
  mode when the backend table is not ready

## Current State

The app already has:

- auth and session restoration
- subscription CRUD and summary calculations
- a tab-based `(app)` route group

The Money Plan tab, domain types, data storage, and report UI do not exist yet.

## Assumptions

- Step 06 focuses on a minimal financial profile with the core MVP inputs:
  monthly net salary and monthly fixed costs.
- The budget report is computed client-side from profile inputs and subscription
  totals for this step.
- Supabase table name is assumed to be `user_financial_profiles`.
- If the table or env is unavailable, the feature should still be demoable via
  a preview repository.
- The recommendation engine remains simple and rules-based, not AI-driven.

## Scope

### In Scope

- step planning docs for Step 06
- domain types for financial profile and budget report
- profile schema and form handling
- budget calculation utilities
- money plan repository contract
- Supabase repository for the profile table
- preview fallback repository
- query and mutation hooks
- Money Plan screen and route
- tab integration
- unit tests for budget calculations and form schema

### Out of Scope

- debt tracking
- savings account syncing
- charts and advanced analytics
- premium gating
- server-generated budget report endpoint integration
- notifications tied to budget thresholds

## Implementation Steps

### 1. Define the domain

- Add types for the user financial profile and derived budget report.
- Keep the first profile model small and aligned with MVP inputs.

### 2. Build the calculation layer

- Convert subscriptions into monthly normalized cost totals.
- Compute salary ratios, fixed-cost burden, recommended budgets, and guidance.
- Keep calculations pure and easy to test.

### 3. Add data access

- Create a Money Plan repository interface.
- Use Supabase when configured and preview fallback otherwise.
- Support fetching and upserting a single financial profile per user.

### 4. Build the Money Plan screen

- Add a dedicated tab and route.
- Show loading, empty, error, and success states.
- Allow users to save salary/fixed-cost inputs and immediately review their
  budget guidance.

### 5. Verify

- Add tests for schema and calculation rules.
- Run lint, typecheck, and test.

## Risks

### Backend table not ready

The Supabase profile table may not exist yet.

Mitigation:

- keep a preview fallback repository
- surface whether the screen is running in preview or Supabase mode

### Overly complex v1 model

Trying to model every financial nuance now would slow delivery.

Mitigation:

- keep Step 06 focused on salary and fixed costs
- leave debt, savings goals, and richer reports for later steps

### Inconsistent totals between screens

If subscription totals are recalculated differently across features, guidance
can become confusing.

Mitigation:

- reuse subscription normalization helpers
- centralize report calculations in one utility module

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- Money Plan tab opens correctly
- first visit without data shows an empty/setup-oriented state
- saving a profile updates the report immediately
- preview mode remains usable when Supabase table setup is missing
