# Bootstrap Step 20: Native App UX Foundation

## Step Info

- Step number: `20`
- Branch: `step/20-native-app-ux-foundation`
- Recommended commit scope: `style(app)`

## Step Goal

Make the authenticated Paynesto experience feel more like a native mobile app
and less like a responsive web dashboard.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-20-native-app-ux-foundation.md`
- [x] Create `docs/steps/bootstrap-step-20-native-app-ux-foundation.md`
- [x] Start from latest `develop` after merging step 19

### 2. App UX Review

- [x] Review Home and subscription list mobile ergonomics
- [x] Identify web-like hero, grid, and copy patterns to reduce

### 3. Home Dashboard

- [x] Compact top dashboard summary
- [x] Mobile-friendly metric layout
- [x] Task/recommendation modules that feel app-native

### 4. Subscription List

- [x] App-style add action
- [x] Compact search/filter/sort controls
- [x] Preserve loading, error, empty, and filtered-empty states

### 5. Supporting Screens

- [x] Tighten spacing/copy on Money Plan and My Page if needed
- [x] Keep app-shell navigation as the primary navigation owner

### 6. Validation

- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`
- [x] Commit with Conventional Commit message
- [x] Push step branch

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/app/(app)/index.tsx`
- `src/features/subscriptions/**/*`
- `src/features/home/**/*`
- `src/features/money-plan/**/*`
- `src/features/my-page/**/*`
- `src/components/ui/*`

## Non-Goals

- backend schema changes
- dependency upgrades
- full native build pipeline changes
- store-ready release work
