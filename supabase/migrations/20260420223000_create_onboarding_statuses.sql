create extension if not exists pgcrypto;

create table if not exists public.onboarding_statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  completed_at timestamptz null,
  skipped_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (completed_at is not null or skipped_at is not null)
);

create index if not exists onboarding_statuses_user_id_idx
  on public.onboarding_statuses (user_id);

drop trigger if exists onboarding_statuses_set_updated_at on public.onboarding_statuses;
create trigger onboarding_statuses_set_updated_at
before update on public.onboarding_statuses
for each row
execute function public.set_updated_at();

alter table public.onboarding_statuses enable row level security;

drop policy if exists "onboarding_statuses_select_own" on public.onboarding_statuses;
create policy "onboarding_statuses_select_own"
on public.onboarding_statuses
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "onboarding_statuses_insert_own" on public.onboarding_statuses;
create policy "onboarding_statuses_insert_own"
on public.onboarding_statuses
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "onboarding_statuses_update_own" on public.onboarding_statuses;
create policy "onboarding_statuses_update_own"
on public.onboarding_statuses
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "onboarding_statuses_delete_own" on public.onboarding_statuses;
create policy "onboarding_statuses_delete_own"
on public.onboarding_statuses
for delete
to authenticated
using (auth.uid() = user_id);
