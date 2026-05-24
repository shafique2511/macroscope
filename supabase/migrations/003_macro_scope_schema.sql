create table if not exists public.macro_indicators (
  id uuid primary key default gen_random_uuid(),
  group_key text,
  group_name text,
  indicator_key text unique,
  indicator_name text,
  api_source text,
  api_series_id text,
  latest_value numeric,
  previous_value numeric,
  value_unit text,
  latest_date date,
  previous_date date,
  direction text,
  auto_score int check (auto_score between 0 and 100),
  auto_score_reason text,
  override_score int null check (override_score between 0 and 100),
  override_reason text null,
  final_score int generated always as (coalesce(override_score, auto_score)) stored,
  source_status text default 'api',
  frequency text,
  description text,
  is_active boolean default true,
  updated_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.macro_indicator_history (
  id uuid primary key default gen_random_uuid(),
  indicator_key text,
  value numeric,
  value_date date,
  source text,
  created_at timestamptz default now()
);

create table if not exists public.economic_cycle_snapshots (
  id uuid primary key default gen_random_uuid(),
  current_phase text,
  phase_description text,
  tone text,
  confidence_score numeric,
  detected_rule text,
  what_would_change_regime text,
  factor_breakdown jsonb,
  phase_probabilities jsonb,
  supportive_drivers jsonb,
  contradictory_drivers jsonb,
  neutral_drivers jsonb,
  market_expectations jsonb,
  is_published boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.market_expectations (
  id uuid primary key default gen_random_uuid(),
  phase text,
  asset_key text,
  asset_name text,
  bias text,
  confidence_score numeric,
  main_reason text,
  supports text,
  invalidates text,
  beginner_explanation text,
  pro_explanation text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.data_watch_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  frequency text,
  importance text,
  what_to_watch text,
  market_implication text,
  positive_surprise text,
  negative_surprise text,
  sort_order int,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.weekly_macro_notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  summary text,
  content text,
  phase text,
  tone text,
  is_published boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  source text,
  status text,
  message text,
  synced_count int,
  failed_count int,
  error_details jsonb,
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

create index if not exists macro_indicators_group_key_idx
on public.macro_indicators (group_key);

create index if not exists macro_indicators_active_idx
on public.macro_indicators (is_active)
where is_active = true;

create index if not exists macro_indicator_history_key_date_idx
on public.macro_indicator_history (indicator_key, value_date desc);

create index if not exists economic_cycle_snapshots_published_created_idx
on public.economic_cycle_snapshots (is_published, created_at desc);

create index if not exists market_expectations_phase_active_idx
on public.market_expectations (phase, is_active);

create index if not exists data_watch_items_active_sort_idx
on public.data_watch_items (is_active, sort_order);

create index if not exists weekly_macro_notes_published_created_idx
on public.weekly_macro_notes (is_published, created_at desc);

create index if not exists sync_logs_started_at_idx
on public.sync_logs (started_at desc);

create index if not exists audit_logs_user_created_idx
on public.audit_logs (user_id, created_at desc);

drop trigger if exists set_macro_indicators_updated_at on public.macro_indicators;
create trigger set_macro_indicators_updated_at
before update on public.macro_indicators
for each row
execute function public.set_updated_at();

drop trigger if exists set_economic_cycle_snapshots_updated_at on public.economic_cycle_snapshots;
create trigger set_economic_cycle_snapshots_updated_at
before update on public.economic_cycle_snapshots
for each row
execute function public.set_updated_at();

drop trigger if exists set_market_expectations_updated_at on public.market_expectations;
create trigger set_market_expectations_updated_at
before update on public.market_expectations
for each row
execute function public.set_updated_at();

drop trigger if exists set_data_watch_items_updated_at on public.data_watch_items;
create trigger set_data_watch_items_updated_at
before update on public.data_watch_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_weekly_macro_notes_updated_at on public.weekly_macro_notes;
create trigger set_weekly_macro_notes_updated_at
before update on public.weekly_macro_notes
for each row
execute function public.set_updated_at();

alter table public.macro_indicators enable row level security;
alter table public.macro_indicator_history enable row level security;
alter table public.economic_cycle_snapshots enable row level security;
alter table public.market_expectations enable row level security;
alter table public.data_watch_items enable row level security;
alter table public.weekly_macro_notes enable row level security;
alter table public.sync_logs enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Admins can manage macro indicators" on public.macro_indicators;
drop policy if exists "Members can read active macro indicators" on public.macro_indicators;
drop policy if exists "Admins can manage macro indicator history" on public.macro_indicator_history;
drop policy if exists "Admins can manage economic cycle snapshots" on public.economic_cycle_snapshots;
drop policy if exists "Members can read published economic cycle snapshots" on public.economic_cycle_snapshots;
drop policy if exists "Admins can manage market expectations" on public.market_expectations;
drop policy if exists "Members can read active market expectations" on public.market_expectations;
drop policy if exists "Admins can manage data watch items" on public.data_watch_items;
drop policy if exists "Members can read active data watch items" on public.data_watch_items;
drop policy if exists "Admins can manage weekly macro notes" on public.weekly_macro_notes;
drop policy if exists "Members can read published weekly macro notes" on public.weekly_macro_notes;
drop policy if exists "Admins can read sync logs" on public.sync_logs;
drop policy if exists "Admins can read audit logs" on public.audit_logs;

create policy "Admins can manage macro indicators"
on public.macro_indicators
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Members can read active macro indicators"
on public.macro_indicators
for select
to authenticated
using (is_active = true);

create policy "Admins can manage macro indicator history"
on public.macro_indicator_history
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage economic cycle snapshots"
on public.economic_cycle_snapshots
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Members can read published economic cycle snapshots"
on public.economic_cycle_snapshots
for select
to authenticated
using (is_published = true);

create policy "Admins can manage market expectations"
on public.market_expectations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Members can read active market expectations"
on public.market_expectations
for select
to authenticated
using (is_active = true);

create policy "Admins can manage data watch items"
on public.data_watch_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Members can read active data watch items"
on public.data_watch_items
for select
to authenticated
using (is_active = true);

create policy "Admins can manage weekly macro notes"
on public.weekly_macro_notes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Members can read published weekly macro notes"
on public.weekly_macro_notes
for select
to authenticated
using (is_published = true);

create policy "Admins can read sync logs"
on public.sync_logs
for select
to authenticated
using (public.is_admin());

create policy "Admins can read audit logs"
on public.audit_logs
for select
to authenticated
using (public.is_admin());
