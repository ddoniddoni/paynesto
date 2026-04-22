# Step 19 Exec Plan: Web UX Foundation

## Goal

`step/19-web-ux-foundation` responds to browser testing feedback by improving
Paynesto's first impression and shared visual system.

After this step:

- the web login screen feels like a practical finance product instead of a demo
- the app uses calmer, higher-contrast colors
- cards, buttons, and inputs have more mature spacing and radii
- the authenticated app has a native-app-like top bar, hamburger menu, and
  bottom primary navigation
- Expo Router no longer warns about provider files being treated as routes
- browser screenshots are captured after changes

## Current State

Browser testing found:

- the first loading screen spends too much visual space on a small card
- the login screen uses a harsh dark/neon palette
- large rounded cards make the product feel toy-like
- the authenticated app still reads like a narrow web page because the browser
  navigation uses a top pill menu and feature screens rely on in-page "Open"
  navigation buttons
- form actions are visually flat and hard to scan
- Expo Router warns that `src/app/providers/app-providers.tsx` is missing a
  default route export
- Metro crashed during testing when Chrome profile folders were created inside
  the repository, so future browser test profiles must live outside the repo

## Assumptions

- This step should improve the shared foundation without redesigning every
  feature screen from scratch.
- The auth screen is the highest-priority visible surface because it is the
  first browser experience.
- A calmer light-first palette is better for a budgeting app than the current
  dark/neon treatment.
- Web browser screenshots are enough for this UX pass; native device QA can
  follow in a later step.

## Scope

### In Scope

- Step 19 planning docs
- shared theme color, typography, radius, and spacing refinements
- card, button, text input, and centered-state polish
- auth screen copy and layout polish
- provider folder relocation outside Expo Router route scanning
- browser screenshot verification

### Out of Scope

- full redesign of every feature screen
- new charting or visual assets
- native iOS/Android visual QA
- dependency upgrades
- persisted auth/session behavior changes

## Implementation Steps

### 1. Fix router structure warning

- Move app provider code out of `src/app`.
- Update root layout imports.
- Verify the Expo Router warning is gone or reduced.

### 2. Refresh visual tokens

- Replace the harsh neon/dark palette with a calmer finance palette.
- Reduce card radius to product-grade values.
- Make display typography smaller on mobile/web.
- Keep numeric style values in px intent.

### 3. Polish shared components

- Update Card to use mature radius and subtler shadows.
- Update Button for clearer primary/secondary/ghost hierarchy.
- Update TextInputField with better height and focus contrast.
- Update CenteredState so loading/error states feel less awkward on wide screens.

### 4. Polish auth first impression

- Make login/signup copy readable and concise.
- Improve hierarchy between Preview, Google, and email login.
- Keep form labels, errors, and buttons accessible.

### 5. Add app-like authenticated navigation

- Add a reusable app chrome with a safe-area-aware top app bar.
- Add a hamburger drawer for primary and secondary sections.
- Keep primary sections available through bottom navigation.
- Remove redundant Home navigation buttons that make the app feel web-like.
- Adjust app-screen top insets so the new app bar does not create doubled safe
  area spacing.

### 6. Browser verify

- Start Expo web.
- Capture mobile and desktop screenshots.
- Run lint, typecheck, and tests.

## Risks

### Theme changes affect every screen

Mitigation:

- keep token names stable
- avoid changing domain logic
- run typecheck and tests

### Web polish may not perfectly match native

Mitigation:

- use React Native style primitives
- avoid web-only hacks for core layout

### Auth preview click automation can destabilize Metro

Mitigation:

- keep Chrome profiles outside the repository
- clean temporary screenshots after review

## Verification

- browser screenshot: mobile login
- browser screenshot: desktop login
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`
