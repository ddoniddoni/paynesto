# Step 11 Exec Plan: Supabase Core Schema

## Goal

`step/11-supabase-core-schema` adds the missing Supabase tables that the app
already expects for core recurring-cost features.

After this step:

- `subscriptions` exists for subscription CRUD
- `user_financial_profiles` exists for Money Plan persistence
- `notification_settings` exists for My Page reminder preferences
- `premium_transactions` exists for preview-to-real premium state storage
- the database shape matches current repository code and reduces schema-cache
  failures during signed-in app use

## Current State

The app already has:

- Supabase client integration and authenticated feature routes
- repositories for subscriptions, Money Plan, settings, premium, and FX
- one migration for `exchange_rate_snapshots`

What is missing:

- the core application tables for the existing repositories
- indexes and uniqueness constraints for one-profile / one-settings-per-user
- basic row-level security rules for user-owned data
- a shared `updated_at` trigger path for these tables

## Assumptions

- `auth.users.id` is the source of truth for `user_id`.
- Each user should have:
  - many `subscriptions`
  - one `user_financial_profile`
  - one `notification_settings` row
  - many `premium_transactions`
- The current repository column names should remain unchanged so the app code
  does not need a mapping refactor in this step.
- Premium purchase state stays simple for now and can evolve later.

## Scope

### In Scope

- step planning docs for Step 11
- Supabase migration(s) for core app tables
- indexes, constraints, and RLS policies
- `updated_at` trigger function reuse for new tables
- README setup notes for applying the new schema

### Out of Scope

- backfilling demo rows
- Supabase storage buckets
- native push infrastructure
- in-app purchase provider webhooks

## Implementation Steps

### 1. Map current repository needs

- Confirm the exact table and column names used by current repositories.
- Keep SQL aligned with existing TypeScript mapping functions.

### 2. Add core schema migration

- Create a new migration for:
  - `subscriptions`
  - `user_financial_profiles`
  - `notification_settings`
  - `premium_transactions`
- Add foreign keys, defaults, checks, and unique constraints where needed.
- Add indexes for common user-scoped reads.

### 3. Secure the tables

- Enable RLS on user-owned tables.
- Add authenticated user policies scoped to `auth.uid() = user_id`.

### 4. Verify

- Run lint, typecheck, and test.
- Update README setup guidance to mention the new migration requirement.

## Risks

### Schema drift with repository code

If SQL column names differ from repository mappings, runtime failures continue.

Mitigation:

- use repository code as the contract
- avoid renaming application columns in this step

### Overcomplicating premium schema too early

Premium billing may change later.

Mitigation:

- keep `premium_transactions` minimal and app-driven
- avoid webhook-specific columns until billing integration exists

### Missing RLS policies

Tables may work locally but be insecure in production.

Mitigation:

- enable RLS from the first migration
- add explicit select/insert/update/delete ownership policies

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

Manual checks:

- signed-in user can create and read a subscription row
- Money Plan upsert writes to `user_financial_profiles`
- notification settings upsert writes one row per user
- premium plan activation inserts a `premium_transactions` row
