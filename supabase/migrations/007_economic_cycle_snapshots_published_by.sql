alter table public.economic_cycle_snapshots
add column if not exists published_by uuid references public.profiles(id) on delete set null;
