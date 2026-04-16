create extension if not exists pgcrypto;

create table if not exists public.exchange_rate_snapshots (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null check (char_length(base_currency) = 3 and base_currency = upper(base_currency)),
  quote_currency text not null check (char_length(quote_currency) = 3 and quote_currency = upper(quote_currency)),
  rate double precision not null check (rate > 0),
  previous_rate double precision null check (previous_rate > 0),
  fetched_at timestamptz not null,
  expires_at timestamptz null,
  source_label text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (base_currency, quote_currency)
);

alter table public.exchange_rate_snapshots enable row level security;

drop policy if exists "exchange_rate_snapshots_select_authenticated" on public.exchange_rate_snapshots;

create policy "exchange_rate_snapshots_select_authenticated"
on public.exchange_rate_snapshots
for select
to authenticated
using (true);
