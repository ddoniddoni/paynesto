# Bootstrap Step 05: Google Auth

## Step Info

- Step number: `05`
- Branch: `step/05-google-auth`
- Recommended commit scope: `feat(auth)`

## Step Goal

Add Google sign-in to the existing Paynesto auth flow while keeping the current
email/password path working.

## Checklist

### 1. Planning

- [x] Create `docs/execplans/step-05-google-auth.md`
- [x] Create `docs/steps/bootstrap-step-05-google-auth.md`
- [x] Confirm Step 04 is merged into `develop` before starting this step

### 2. Auth service

- [x] Add Google OAuth service entry point
- [x] Add redirect URI helper
- [x] Add callback URL session exchange helper

### 3. Routing and callback

- [x] Add auth callback route
- [x] Preserve existing auth guards and session restoration
- [x] Keep loading and error handling visible during callback completion

### 4. UI

- [x] Add Google sign-in entry on auth screen
- [x] Keep email/password auth available
- [x] Show helpful error copy for misconfiguration or failed OAuth

### 5. Validation

- [x] Add or update auth tests
- [x] Update docs where current auth behavior changed
- [x] Run `npm.cmd run lint`
- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test`

## Expected File Areas

- `docs/execplans/*`
- `docs/steps/*`
- `src/app/*`
- `src/features/auth/**/*`
- `src/services/supabase/*`
- `tests/auth/*`
- `README.md`

## Non-Goals

- Apple login
- password reset
- magic links
- post-login profile setup
- social account linking
