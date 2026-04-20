# Step 14 Exec Plan: Onboarding Foundation

## Goal

`step/14-onboarding-foundation` adds a first-run onboarding flow that helps new
or preview users understand the Paynesto setup path before they land in the
main dashboard.

After this step:

- authenticated and preview users can be routed through onboarding once
- onboarding explains the core setup sequence:
  - add subscriptions
  - save salary and fixed costs
  - review reminders and premium-gated FX alerts
- users can skip or complete onboarding without blocking app access
- onboarding completion is persisted through a repository boundary
- the Home entry can still load quickly after onboarding is complete

## Current State

The app already has:

- auth and preview entry
- Home, Subscriptions, Money Plan, My Page, Premium, and Notification Settings
- preview and Supabase-ready repositories for most user-owned data
- notification delivery and scheduling foundations

What is missing:

- first-run onboarding
- persisted onboarding completion state
- route-level decision between onboarding and the main tab app
- a clear setup checklist that ties the existing screens together

## Assumptions

- Onboarding is helpful guidance, not a hard KYC or financial-advice flow.
- Users can skip onboarding and still use the app.
- Preview mode needs the same onboarding experience so demos feel realistic.
- Supabase schema can store a small onboarding completion flag without adding a
  large profile model.
- This step should not redesign the main tabs.

## Scope

### In Scope

- step planning docs for Step 14
- onboarding domain types and completion utility
- preview and Supabase repository for onboarding status
- route guard from app entry to onboarding when needed
- onboarding screen with loading, error, empty/new, and success states
- navigation actions into Subscriptions, Money Plan, and Notification Settings
- tests for onboarding completion and route-decision logic

### Out of Scope

- multi-page questionnaire
- bank/card connection
- forced financial profile setup
- push notification permission prompt inside onboarding
- real analytics events

## Implementation Steps

### 1. Add onboarding domain and repository

- Define a minimal `OnboardingStatus` model.
- Add helpers for route decisions and setup step summaries.
- Add preview storage for onboarding completion.
- Add Supabase-backed read/write behavior, with a graceful preview fallback if
  the table or config is unavailable.

### 2. Add backend schema support

- Add a migration for a user-owned onboarding status table or compact profile
  table.
- Keep RLS ownership policies explicit.
- Avoid storing sensitive financial values in this onboarding table.

### 3. Add onboarding route and guard

- Add an Expo Router route for onboarding.
- Update root/app routing so authenticated and preview users land on onboarding
  only when the status is incomplete.
- Keep loading and error states explicit.

### 4. Build onboarding UI

- Use existing UI components and theme tokens.
- Present a short setup path with concrete actions:
  - connect subscriptions
  - enter Money Plan numbers
  - configure reminders
- Let users complete or skip onboarding.
- Provide success feedback before navigating to the main app.

### 5. Verify

- Add focused tests for route decisions and completion helpers.
- Run lint, typecheck, and test.

## Risks

### Onboarding can become a second dashboard

If this step tries to summarize every product feature, it will duplicate Home
and My Page.

Mitigation:

- keep onboarding focused on first-use setup
- link to existing screens instead of rebuilding their content

### Route loops can block the app

Persisted onboarding state, preview auth, and route redirects can interact
badly.

Mitigation:

- centralize route-decision logic in a tested utility
- provide skip/complete paths
- keep loading and error states separate from redirect decisions

### Backend migration may drift from manually applied Supabase SQL

Prior steps note that some Supabase SQL was applied manually.

Mitigation:

- keep the migration self-contained
- do not rely on `supabase db push` in this step
- verify app behavior through repository tests and typecheck

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- a preview user without onboarding completion sees onboarding first
- skip or complete moves the user to the main tabs
- a completed user returns directly to the main tabs on next launch
- onboarding action buttons navigate to the right existing screens
