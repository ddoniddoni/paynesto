# Step 15 Exec Plan: Subscription Filtering

## Goal

`step/15-subscription-filtering` makes the Subscriptions screen more useful for
real account management by adding category, currency, and billing-cycle filters.

After this step:

- users can filter subscriptions by category
- users can filter KRW vs USD subscriptions
- users can filter monthly vs yearly billing
- filtered results keep summary metrics and FX estimates aligned
- empty filtered results explain how to reset or change filters

## Current State

The app already has:

- subscription CRUD
- subscription list, detail, create, and edit routes
- monthly normalization utilities
- USD to KRW estimates in list rows
- loading, error, and full empty states

What is missing:

- category filter
- currency filter
- billing-cycle filter
- filtered empty state
- tests for filter behavior

## Assumptions

- Filters are local screen state for now.
- Server-side filtering can come later if accounts become large.
- The first version should keep all filters optional and easy to reset.
- Search text and sorting are useful but out of scope for this step.

## Scope

### In Scope

- step planning docs for Step 15
- filter domain utility and option labels
- unit tests for filter matching and summary counts
- Subscriptions screen filter controls
- filtered empty state with reset action
- summary cards based on filtered subscriptions

### Out of Scope

- search by service name
- saved filter preferences
- server-side query filters
- custom sorting controls
- bulk edit/delete

## Implementation Steps

### 1. Add filter utility

- Define filter value types for all/categories, all/currencies, and
  all/billing cycles.
- Add a pure `filterSubscriptions` helper.
- Add a small `hasActiveSubscriptionFilters` helper for reset UI.

### 2. Add tests

- Cover category, currency, billing cycle, combined filters, and reset detection.
- Keep tests near existing subscription utility tests.

### 3. Update Subscriptions screen

- Add local state for filter values.
- Render segmented pill controls using the existing subscription option group.
- Compute filtered subscriptions and FX estimates from filtered data.
- Keep FlatList rendering stable and avoid expensive inline work inside row
  render.

### 4. Add filtered empty state

- If the account has subscriptions but none match the current filters, show a
  helpful state inside the list with reset and add actions.
- Preserve the full account empty state when there are no subscriptions at all.

### 5. Verify

- Run lint, typecheck, and test.

## Risks

### Filter UI could crowd the mobile screen

Three filter groups can become too dense.

Mitigation:

- use compact pill controls
- keep the controls below the summary hero and above the list
- show result count copy so the user understands the effect

### Summary metrics can become inconsistent

If cards use all subscriptions while rows use filtered subscriptions, the screen
will feel misleading.

Mitigation:

- derive summary cards from the filtered list
- keep source/total copy visible

### Filtering can duplicate domain logic in the screen

Screen-level ad hoc filters would be harder to test.

Mitigation:

- put filter matching in subscription utilities
- add focused unit tests

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- no subscriptions still shows the full empty state
- category filter narrows visible rows
- USD filter narrows rows and FX summary
- yearly filter narrows rows
- reset returns to all subscriptions
