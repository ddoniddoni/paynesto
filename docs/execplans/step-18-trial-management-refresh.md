# Step 18 Exec Plan: Trial Management Refresh

## Goal

`step/18-trial-management-refresh` makes free-trial tracking easier to trust from
the subscription create/edit and detail flows.

After this step:

- trial subscriptions show a clear status, timing, and next action
- expired or missing trial dates are explained instead of hidden
- subscription forms use readable product copy for trial fields
- trial guidance is generated from reusable utilities

## Current State

The app already has:

- `isTrial` and `trialEndDate` fields
- form validation requiring a trial end date when `isTrial` is true
- trial-ending reminder candidates in notification utilities
- list and detail status badges
- basic detail copy showing the trial end date

What is missing:

- reusable trial status logic
- actionable trial guidance on the detail screen
- better form copy around trial setup
- tests for upcoming, urgent, expired, and missing trial states

## Assumptions

- This step is about manual tracking, not app-store cancellation integration.
- A trial ending within three days should be treated as urgent.
- A trial without a valid end date should be marked as needing setup.
- Date calculations should accept an injectable reference date for tests.

## Scope

### In Scope

- Step 18 planning docs
- trial status utility and formatter helpers
- focused tests for trial status states
- Subscription detail trial guidance card
- readable subscription form and form-screen copy

### Out of Scope

- native calendar integration
- automatic cancellation
- server-side trial reminder changes
- changing database schema
- push notification scheduling changes

## Implementation Steps

### 1. Add trial status utilities

- Add a pure helper that evaluates trial state from subscription data.
- Support non-trial, missing date, active, ending soon, ended, and inactive
  states.
- Add formatter helpers for status labels and detail copy.

### 2. Add tests

- Cover non-trial subscriptions.
- Cover missing trial end date.
- Cover active trial with future end date.
- Cover trial ending soon.
- Cover ended and inactive trial states.

### 3. Refresh detail screen

- Add a dedicated trial management card.
- Show status, timing, and next action.
- Keep billing, FX, usage review, delete confirmation, loading, error, and empty
  states intact.

### 4. Clean form copy

- Replace unreadable create/edit and form labels with readable product copy.
- Keep form fields and schema behavior unchanged except for clearer messages.

### 5. Verify

- Run lint, typecheck, and tests.

## Risks

### Trial status can conflict with billing status

Mitigation:

- keep the existing subscription status badge
- present trial guidance as an advisory detail card

### Expired trials may still be active subscriptions

Mitigation:

- describe expired trials as requiring confirmation, not automatic cancellation

### Date handling can become flaky in tests

Mitigation:

- accept a reference date in utility helpers
- test with fixed dates

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- non-trial detail shows no trial card
- active trial detail shows trial end timing
- trial ending soon shows urgent review copy
- expired trial asks the user to confirm whether it converted
- create/edit form copy is readable
