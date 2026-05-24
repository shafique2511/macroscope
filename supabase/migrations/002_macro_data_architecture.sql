create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create table if not exists public.macro_sync_runs (
  id uuid primary key,
  status text not null check (status in ('running', 'completed', 'failed')),
  source text not null,
  started_by uuid references auth.users(id) on delete set null,
  records_synced integer not null default 0,
  draft_snapshot_id uuid,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.macro_indicator_observations (
  id bigserial primary key,
  sync_run_id uuid not null references public.macro_sync_runs(id) on delete cascade,
  source text not null,
  external_id text not null,
  label text not null,
  macro_group text not null check (
    macro_group in ('growth', 'inflation', 'policy', 'credit', 'risk_appetite')
  ),
  observation_date date not null,
  raw_value numeric not null,
  normalized_value numeric not null,
  unit text not null,
  score integer not null check (score between 0 and 100),
  direction text not null check (direction in ('supportive', 'restrictive', 'neutral')),
  created_at timestamptz not null default now(),
  unique (source, external_id, observation_date)
);

create table if not exists public.cycle_snapshots (
  id uuid primary key default gen_random_uuid(),
  sync_run_id uuid references public.macro_sync_runs(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  cycle_phase text not null,
  market_regime text not null,
  confidence_score integer not null check (confidence_score between 0 and 100),
  expectation text not null,
  risk_watch text not null,
  group_scores jsonb not null default '[]'::jsonb,
  indicator_scores jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.macro_sync_runs
  add constraint macro_sync_runs_draft_snapshot_id_fkey
  foreign key (draft_snapshot_id)
  references public.cycle_snapshots(id)
  on delete set null;

create index if not exists macro_sync_runs_status_started_at_idx
on public.macro_sync_runs (status, started_at desc);

create index if not exists macro_indicator_observations_lookup_idx
on public.macro_indicator_observations (macro_group, observation_date desc);

create index if not exists cycle_snapshots_status_created_at_idx
on public.cycle_snapshots (status, created_at desc);

alter table public.macro_sync_runs enable row level security;
alter table public.macro_indicator_observations enable row level security;
alter table public.cycle_snapshots enable row level security;

drop policy if exists "Admins can read sync runs" on public.macro_sync_runs;
drop policy if exists "Admins can read indicator observations" on public.macro_indicator_observations;
drop policy if exists "Admins can read all cycle snapshots" on public.cycle_snapshots;
drop policy if exists "Members can read published cycle snapshots" on public.cycle_snapshots;

create policy "Admins can read sync runs"
on public.macro_sync_runs
for select
to authenticated
using (public.is_admin());

create policy "Admins can read indicator observations"
on public.macro_indicator_observations
for select
to authenticated
using (public.is_admin());

create policy "Admins can read all cycle snapshots"
on public.cycle_snapshots
for select
to authenticated
using (public.is_admin());

create policy "Members can read published cycle snapshots"
on public.cycle_snapshots
for select
to authenticated
using (status = 'published');
