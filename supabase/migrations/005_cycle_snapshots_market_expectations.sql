alter table public.cycle_snapshots
add column if not exists market_expectations jsonb not null default '[]'::jsonb;
