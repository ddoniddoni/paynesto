# Step 10 Exec Plan: My Page Foundation

## Goal

`step/10-my-page-foundation` adds the missing account area for Paynesto so the
app has a real destination for profile context, notification settings, premium
upgrade entry, and support/legal information.

After this step:

- the bottom tab bar includes a `My Page` entry
- users can open a dedicated profile/account screen
- notification preferences can be viewed and updated
- premium upgrade messaging and a preview purchase flow exist
- premium-only FX alert behavior has a clear gate

## Current State

The app already has:

- authenticated app tabs for Home, Subscriptions, and Money Plan
- subscription, budget, and FX domain foundations
- a Home dashboard that references premium-aware FX ideas but no premium screen
- no persistent account/settings surface in the signed-in app

What is missing:

- a My Page route and screen structure
- notification settings domain types and storage flow
- premium account state and paywall entry
- a reusable premium guard for settings/features

## Assumptions

- My Page should feel practical and product-like, not like a placeholder menu.
- Notification settings can start with a simple repository shape and preview
  fallback until backend tables exist.
- Premium purchase can be represented by a preview entitlement flow in v1,
  while keeping the API boundary ready for future billing integration.
- Terms, privacy, and support can be surfaced as in-app information cards in
  this step instead of external webviews.

## Scope

### In Scope

- step planning docs for Step 10
- `My Page` tab and route structure
- notification settings types, repository, hooks, and screen
- premium status/purchase foundation and screen
- premium gate utility for premium-only notification controls
- tests for premium gate or related account logic
- README updates for the new account area

### Out of Scope

- real in-app purchase SDK integration
- push notification scheduling and native permission prompts
- legal document backend or CMS delivery
- profile editing beyond basic account summary

## Implementation Steps

### 1. Add account domain foundations

- Add shared domain types for notification settings and premium transactions.
- Add preview and Supabase-ready repositories for settings and premium state.
- Add a premium access utility so UI can consistently check free vs premium.

### 2. Build My Page routes and screens

- Add a `My Page` tab to the authenticated app shell.
- Create a My Page overview with:
  - signed-in profile summary
  - subscription / budget snapshot
  - premium status summary
  - entries for notifications, premium, legal, privacy, and support
- Move sign-out into the account area while keeping UX clear.

### 3. Add settings and premium flows

- Build a notification settings screen with loading, success, and error states.
- Gate FX volatility alerts behind premium access with clear explanations.
- Build a premium screen with plan options, entitlement summary, and a preview
  upgrade flow.

### 4. Verify

- Add tests for premium access or account summary logic.
- Run lint, typecheck, and test.

## Risks

### Too much scope in one account step

Combining My Page, notifications, and premium could sprawl.

Mitigation:

- keep profile editing out of scope
- focus on account entry points and one solid premium guard

### Premium UI could feel fake without payments

Users may not trust a premium flow if it looks disconnected from the product.

Mitigation:

- explain that premium status is preview-backed for now
- keep plan benefits tightly tied to existing product capabilities

### Notification settings may imply native delivery is complete

Users could assume reminders are fully operational immediately.

Mitigation:

- label the current step as preference management
- avoid claiming push delivery is active when it is not

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- signed-in users can open `My Page` from the tab bar
- notification settings save and reload in preview mode
- FX volatility alerts show a premium gate for free users
- preview upgrade changes premium status on `My Page`
