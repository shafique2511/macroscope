alter table public.economic_cycle_snapshots
add column if not exists published_at timestamptz null;

create index if not exists economic_cycle_snapshots_latest_published_idx
on public.economic_cycle_snapshots (published_at desc)
where is_published = true;
