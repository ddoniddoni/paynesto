# Step 12 Exec Plan: Notification Scheduling Foundation

## Goal

`step/12-notification-scheduling-foundation` turns notification settings from
simple toggles into a real scheduling foundation that can explain which reminder
events Paynesto would schedule next.

After this step:

- the app can derive billing reminder candidates from active subscriptions
- the app can derive trial-ending reminder candidates
- USD FX alert candidates respect premium access
- the notification settings screen shows a preview of upcoming scheduled items
- notification scheduling logic is covered by dedicated tests

## Current State

The app already has:

- persisted notification settings
- subscription data with billing and trial dates
- premium access logic for FX alerts
- a notification settings screen with on/off preferences

What is missing:

- a unified notification schedule model
- logic for converting settings + subscriptions into reminder candidates
- a preview surface that proves the toggles have real downstream behavior
- tests for the required notification scheduling logic

## Assumptions

- This step focuses on schedule calculation and preview, not native push
  delivery.
- Reminder timing can use the current single `reminderLeadDays` setting for
  both billing and trial reminders in MVP.
- FX volatility alerts should only surface when:
  - the user has premium access
  - FX alerts are enabled
  - at least one active USD subscription exists
- Expired or inactive subscriptions should not generate reminders.

## Scope

### In Scope

- step planning docs for Step 12
- notification schedule domain types
- schedule preview utility/service layer
- notification settings screen preview section
- tests for notification schedule logic

### Out of Scope

- Expo push permissions
- local device notification APIs
- background jobs or server schedulers
- monthly summary or low-usage reminder campaigns

## Implementation Steps

### 1. Add notification schedule domain models

- Define reminder kinds and preview item shape.
- Keep the model aligned with billing, trial, and FX alert use cases.

### 2. Build schedule preview logic

- Generate reminder candidates from active subscriptions and settings.
- Exclude inactive or already-passed items.
- Respect premium gating for FX volatility alerts.
- Sort schedule items by nearest upcoming trigger time.

### 3. Surface the preview in UI

- Add preview loading, empty, and success states to the notification screen.
- Explain why FX alerts are absent when premium is off.

### 4. Verify

- Add tests for billing, trial, and premium FX scheduling behavior.
- Run lint, typecheck, and test.

## Risks

### Reminder logic may feel arbitrary

If dates are not clearly derived from subscription data, users may not trust the
feature.

Mitigation:

- keep the first schedule model simple and date-driven
- show the linked subscription name and trigger date in preview

### Too much promise without delivery

Users may think push notifications are already wired end-to-end.

Mitigation:

- frame this step as schedule preview foundation
- keep wording away from claiming background delivery is active

### FX alerts can confuse free users

Premium gating may seem inconsistent if the setting exists but no preview
appears.

Mitigation:

- explain the premium requirement in both settings copy and preview state

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- notification settings show billing reminder preview items
- trial subscriptions surface trial reminder candidates
- free users do not get FX alert candidates
- premium users with USD subscriptions do get FX alert candidates
