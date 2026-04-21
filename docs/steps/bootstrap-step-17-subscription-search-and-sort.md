# Bootstrap Step 17: Subscription Search and Sort

## Step Info

- Step number: `17`
- Branch: `step/17-subscription-search-and-sort`
- Recommended commit scope: `feat(subscriptions)`

## Step Goal

Add local search and sort controls to the Subscriptions screen so users can find
and review recurring payments faster.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-17-subscription-search-and-sort.md`
- [x] Create `docs/steps/bootstrap-step-17-subscription-search-and-sort.md`
- [x] Start from the latest local `develop`

### 2. Search and Sort Domain

- [x] Add search and sort value types
- [x] Add pure helpers for query matching and sorted results
- [x] Add tests for search and sort behavior
- [x] Keep filters, search, and sort combined in one helper

### 3. Subscriptions UI

- [x] Add search input
- [x] Add sort controls
- [x] Align summaries and FX estimates with visible results
- [x] Update reset and empty state behavior

### 4. Validation

- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/features/subscriptions/**/*`
- `tests/subscriptions/*`

## Non-Goals

- persisted preferences
- server-side search
- fuzzy matching
- bulk actions
