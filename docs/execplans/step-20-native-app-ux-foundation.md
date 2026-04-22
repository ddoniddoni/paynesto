# Step 20 Exec Plan: Native App UX Foundation

## Goal

`step/20-native-app-ux-foundation` turns the authenticated Paynesto experience
from a web-like narrow layout into a more convincing mobile app flow.

After this step:

- Home uses a compact dashboard layout instead of a landing-page-style hero
- Subscriptions has mobile-first actions for add, search, filters, and sort
- primary navigation feels owned by the app shell, not repeated inside screens
- dense explanatory copy is reduced where the UI itself can carry the flow
- the browser preview remains usable while staying closer to native app patterns

## Assumptions

- React Native + Expo is still the target app stack.
- Web preview is useful for fast QA, but native app ergonomics should drive the
  screen structure.
- The current app shell from step 19 can remain as the shared navigation frame.
- This step should not rebuild every screen from scratch; it should focus on the
  highest-impact app surfaces.
- Native device screenshots can follow later if local Android/iOS runners are
  not available.

## Scope

### In Scope

- step 20 planning docs
- compact mobile dashboard treatment for Home
- app-style subscription list header and persistent add action
- mobile-oriented filter/search/sort presentation
- reduced in-page navigation links and web-like explanatory blocks
- style refinements needed to support the above
- lint, typecheck, and test validation

### Out of Scope

- new backend behavior
- native build signing or store packaging
- full visual redesign of auth/onboarding
- charting library adoption
- subscription CRUD domain logic changes unless required by UI behavior

## Implementation Steps

### 1. Review Current App Surfaces

- Inspect Home, Subscriptions, Money Plan, My Page, and shared UI primitives.
- Identify repeated web patterns: large hero cards, explanatory copy, wide grids,
  and in-page navigation CTAs.

### 2. Make Home Feel Like An App Dashboard

- Replace the large hero-card feel with a compact balance/status header.
- Keep the most important monthly subscription total visible immediately.
- Present next billing, salary ratio, and USD estimate as concise app metrics.
- Keep action cards, but make them read as task rows or compact recommendation
  modules instead of web cards.

### 3. Refresh Subscription List Interaction

- Move Add Subscription toward an app-native action pattern.
- Reduce the large "hub" card feeling.
- Make search, sort, and filters quicker to scan on a phone.
- Preserve loading, error, empty, and filtered-empty states.

### 4. Tighten Supporting Screens

- Reduce top safe-area and duplicate app-shell spacing where needed.
- Remove navigation copy that belongs in the app shell.
- Keep Money Plan and My Page readable while avoiding a web landing-section
  rhythm.

### 5. Verify

- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `npm.cmd run test`.
- Start Expo web if visual verification is useful.

## Risks

### UI changes may reduce context too much

Mitigation:

- keep essential labels and status messages
- preserve error, loading, and empty-state explanations

### Web preview may not exactly match native

Mitigation:

- use React Native primitives and shared tokens
- avoid web-only layout hacks unless isolated to `.web.tsx`

### List changes can hurt performance

Mitigation:

- keep FlatList for subscription list
- avoid expensive inline calculations inside render items

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- optional browser preview at the end of the step
