create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_name text not null check (char_length(trim(service_name)) > 0),
  category text not null check (category in ('OTT', 'Music', 'Shopping', 'Productivity', 'Cloud', 'Education', 'AI', 'Gaming', 'Others')),
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly')),
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null check (currency in ('KRW', 'USD')),
  payment_method_type text not null check (payment_method_type in ('app_store', 'play_store', 'card', 'paypal', 'other')),
  next_billing_date date not null,
  is_trial boolean not null default false,
  trial_end_date date null,
  usage_frequency text not null check (usage_frequency in ('high', 'medium', 'low')),
  note text null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (is_trial = false or trial_end_date is not null)
);

create table if not exists public.user_financial_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  monthly_net_salary numeric(12, 2) not null check (monthly_net_salary > 0),
  monthly_fixed_costs numeric(12, 2) not null check (monthly_fixed_costs >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  billing_reminders_enabled boolean not null default true,
  trial_ending_reminders_enabled boolean not null default true,
  fx_volatility_alerts_enabled boolean not null default false,
  marketing_updates_enabled boolean not null default false,
  reminder_lead_days integer not null default 3 check (reminder_lead_days in (1, 3, 7)),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.premium_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null check (char_length(trim(plan_id)) > 0),
  status text not null check (status in ('active', 'expired', 'canceled')),
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly')),
  price_usd numeric(10, 2) not null check (price_usd >= 0),
  purchased_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

create index if not exists subscriptions_user_id_next_billing_date_idx
  on public.subscriptions (user_id, next_billing_date);

create index if not exists subscriptions_user_id_is_active_idx
  on public.subscriptions (user_id, is_active);

create index if not exists premium_transactions_user_id_created_at_idx
  on public.premium_transactions (user_id, created_at desc);

create index if not exists premium_transactions_user_id_status_idx
  on public.premium_transactions (user_id, status);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

drop trigger if exists user_financial_profiles_set_updated_at on public.user_financial_profiles;
create trigger user_financial_profiles_set_updated_at
before update on public.user_financial_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists notification_settings_set_updated_at on public.notification_settings;
create trigger notification_settings_set_updated_at
before update on public.notification_settings
for each row
execute function public.set_updated_at();

drop trigger if exists premium_transactions_set_updated_at on public.premium_transactions;
create trigger premium_transactions_set_updated_at
before update on public.premium_transactions
for each row
execute function public.set_updated_at();

alter table public.subscriptions enable row level security;
alter table public.user_financial_profiles enable row level security;
alter table public.notification_settings enable row level security;
alter table public.premium_transactions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own"
on public.subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own"
on public.subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "subscriptions_delete_own" on public.subscriptions;
create policy "subscriptions_delete_own"
on public.subscriptions
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_financial_profiles_select_own" on public.user_financial_profiles;
create policy "user_financial_profiles_select_own"
on public.user_financial_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_financial_profiles_insert_own" on public.user_financial_profiles;
create policy "user_financial_profiles_insert_own"
on public.user_financial_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_financial_profiles_update_own" on public.user_financial_profiles;
create policy "user_financial_profiles_update_own"
on public.user_financial_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_financial_profiles_delete_own" on public.user_financial_profiles;
create policy "user_financial_profiles_delete_own"
on public.user_financial_profiles
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "notification_settings_select_own" on public.notification_settings;
create policy "notification_settings_select_own"
on public.notification_settings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "notification_settings_insert_own" on public.notification_settings;
create policy "notification_settings_insert_own"
on public.notification_settings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "notification_settings_update_own" on public.notification_settings;
create policy "notification_settings_update_own"
on public.notification_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notification_settings_delete_own" on public.notification_settings;
create policy "notification_settings_delete_own"
on public.notification_settings
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "premium_transactions_select_own" on public.premium_transactions;
create policy "premium_transactions_select_own"
on public.premium_transactions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "premium_transactions_insert_own" on public.premium_transactions;
create policy "premium_transactions_insert_own"
on public.premium_transactions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "premium_transactions_update_own" on public.premium_transactions;
create policy "premium_transactions_update_own"
on public.premium_transactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "premium_transactions_delete_own" on public.premium_transactions;
create policy "premium_transactions_delete_own"
on public.premium_transactions
for delete
to authenticated
using (auth.uid() = user_id);
