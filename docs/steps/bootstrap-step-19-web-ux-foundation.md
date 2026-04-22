# Bootstrap Step 19: Web UX Foundation

## Step Info

- Step number: `19`
- Branch: `step/19-web-ux-foundation`
- Recommended commit scope: `style(ui)`

## Step Goal

Improve the browser-tested first impression by refreshing shared visual tokens,
polishing auth UI, and fixing the Expo Router provider warning.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-19-web-ux-foundation.md`
- [x] Create `docs/steps/bootstrap-step-19-web-ux-foundation.md`
- [x] Start from the latest local `develop`

### 2. Structure

- [x] Move providers out of Expo Router route scanning
- [x] Update root layout imports

### 3. Visual Foundation

- [x] Refresh theme colors and typography
- [x] Reduce card radius and soften shadows
- [x] Improve button hierarchy
- [x] Improve text input affordance
- [x] Improve centered loading/error states

### 4. Auth UX

- [x] Replace unreadable auth copy
- [x] Improve login/signup hierarchy
- [x] Keep preview mode prominent but clearly secondary

### 5. Validation

- [x] Add app shell with hamburger drawer and bottom app navigation
- [x] Remove web-like authenticated top pill menu
- [x] Adjust app screen top insets for the new app bar
- [x] Capture browser screenshots
- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/constants/theme.ts`
- `src/components/ui/*`
- `src/components/shared/*`
- `src/features/auth/**/*`
- `src/app/_layout.tsx`
- provider files outside `src/app`

## Non-Goals

- full feature-screen redesign
- dependency upgrades
- native device screenshots
- database or repository changes
