alter table public.macro_indicators
drop constraint if exists macro_indicators_auto_score_check;

alter table public.macro_indicators
drop constraint if exists macro_indicators_override_score_check;

alter table public.macro_indicators
add constraint macro_indicators_auto_score_check
check (auto_score between -2 and 2);

alter table public.macro_indicators
add constraint macro_indicators_override_score_check
check (override_score between -2 and 2);
