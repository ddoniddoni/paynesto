# Step 05 Exec Plan: Google Auth

## Goal

`step/05-google-auth` adds Google sign-in to Paynesto without breaking the
existing email/password auth flow.

After this step:

- users can start Google sign-in from the auth screen
- Supabase OAuth can create or restore a session
- native and web redirect handling follow a shared auth contract
- the app keeps existing auth guards and session restoration behavior
- the auth experience still explains loading, error, and unconfigured states

## Current State

The repository already has:

- Supabase client initialization for React Native
- email/password sign-in and sign-up
- auth session restoration and route guards
- Expo Router based auth and app route groups

The missing pieces are Google OAuth initiation, redirect/callback handling, and
UI entry points for the new provider.

## Assumptions

- Step 05 focuses on Google login only, not Apple login or full social auth
  abstraction.
- Supabase Auth remains the single source of truth for sessions.
- We will prefer Supabase OAuth with Expo redirect handling instead of a
  provider-specific native Google SDK.
- Email/password auth remains available for MVP stability.
- Google provider setup inside Supabase and Google Cloud Console is handled by
  project configuration outside this repo, but the required app-side behavior
  will be documented in code and copy.

## Scope

### In Scope

- step planning docs for Step 05
- Google auth service helpers
- shared OAuth redirect URI helper
- native OAuth browser flow
- web callback route flow
- Google sign-in action in auth UI
- callback session exchange
- lightweight tests for auth OAuth helpers
- README and PRD updates if needed for current auth direction

### Out of Scope

- Apple login
- password reset
- magic link login
- account linking across providers
- profile onboarding after first Google sign-in
- production credential setup inside Supabase dashboard

## Implementation Steps

### 1. Lock the redirect contract

- Define a single redirect URI helper for Google OAuth.
- Keep the app scheme aligned with Expo config.
- Support a callback path that works with Expo Router on web and with custom
  scheme redirects on native.

### 2. Extend auth services

- Add a Google sign-in function that uses Supabase OAuth.
- Use `skipBrowserRedirect` plus `openAuthSessionAsync` on native.
- On success, exchange tokens from the callback URL into a Supabase session.
- Return a consistent action result shape for UI feedback.

### 3. Handle callback and restoration

- Add an auth callback route for web redirect completion.
- Keep existing auth session restoration behavior intact.
- Ensure the callback route can show loading, success handoff, and error state.

### 4. Update auth UI

- Add a clear Google sign-in button to the sign-in screen.
- Keep email/password entry available.
- Explain configuration issues in plain language when auth is unavailable.

### 5. Verify

- Add tests for redirect parsing and callback session extraction logic.
- Run lint, typecheck, and test.

## Risks

### OAuth redirect mismatch

If Supabase, Expo config, and Google Console redirect values do not match,
Google sign-in will fail before the app receives a callback.

Mitigation:

- centralize redirect URI generation in one helper
- document the expected redirect format in code and docs

### Expo environment differences

Expo Go, development builds, and web can behave differently for auth sessions.

Mitigation:

- follow the Expo and Supabase documented browser flow
- keep native and web flows separated behind one service interface

### Callback parsing errors

OAuth tokens may arrive in query params or URL fragments depending on platform
and provider behavior.

Mitigation:

- add a parser that can read both query and hash params
- cover parsing with tests

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- sign-in screen shows Google action alongside email auth
- Google sign-in starts the OAuth flow without crashing
- callback route/session exchange leads to authenticated app entry
- auth screen still works when Supabase env is missing or provider setup is
  incomplete
