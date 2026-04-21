# Step 17 Exec Plan: Subscription Search and Sort

## Goal

`step/17-subscription-search-and-sort` makes the Subscriptions screen faster to
use once a user has more than a handful of recurring payments.

After this step:

- users can search subscriptions by service name and note text
- users can sort by next billing date, monthly cost, or service name
- filters, search, sort, summaries, and FX estimates stay aligned
- empty states explain whether no result came from filters or search

## Current State

The app already has:

- subscription CRUD
- category, currency, and billing-cycle filters
- filtered summary cards
- filtered empty state with reset action
- USD FX estimates on visible rows

What is missing:

- text search
- sort controls
- pure utility coverage for search and sort behavior
- reset behavior that clears both filters and search

## Assumptions

- Search and sort are local screen state for this step.
- Search should match service name first and note text as a helpful secondary
  field.
- Saved preferences and server-side query parameters are out of scope.
- Default sort should preserve the current practical review flow: next billing
  first.

## Scope

### In Scope

- Step 17 planning docs
- subscription search and sort types
- pure search/sort utility helpers
- tests for query matching and sort order
- Subscriptions screen search input and sort controls
- updated visible result copy and empty state

### Out of Scope

- persisted search or sort preferences
- server-side search
- fuzzy matching
- category budget grouping
- bulk actions

## Implementation Steps

### 1. Add search and sort utilities

- Add sort value types and default sort constants.
- Add a search helper that normalizes query text.
- Add a sort helper for next billing, monthly cost, and service name.
- Add a combined view helper so screen code stays thin.

### 2. Add tests

- Cover case-insensitive service-name search.
- Cover note search.
- Cover next billing ascending sort.
- Cover monthly cost descending sort.
- Cover combined filter, search, and sort behavior.

### 3. Update Subscriptions screen

- Add local search query and sort state.
- Render a search input in the filter card.
- Render sort option chips.
- Drive list data, summary cards, and FX estimates from the visible result set.

### 4. Update empty and reset behavior

- Reset should clear filters and search.
- Empty copy should mention search when a query is active.
- Full empty state remains unchanged when the account has no subscriptions.

### 5. Verify

- Run lint, typecheck, and tests.

## Risks

### Search and filters can make the UI feel busy

Mitigation:

- keep search inside the existing filter card
- use short sort labels
- keep reset behavior obvious

### Sort logic can drift from summary logic

Mitigation:

- derive all visible data from one combined helper
- keep tests around the combined helper

### Monthly cost sort can compare KRW and USD

Mitigation:

- sort by native monthly normalized amount for this local list step
- leave FX-normalized global sort out of scope until Money Plan consumes FX

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- searching by service name narrows rows
- searching by note narrows rows
- reset clears filters and search
- next billing sort shows nearest billing first
- monthly cost sort shows highest visible native monthly cost first
