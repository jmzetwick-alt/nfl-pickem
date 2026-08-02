-- Optional seed data (run after creating your admin user and season)

-- Example: create 2025 season with Week 1 and sample games
-- Uncomment and adjust as needed:

/*
insert into public.seasons (year, name, is_active)
values (2025, '2025 NFL Season', true)
on conflict (year) do nothing;

with s as (select id from public.seasons where year = 2025)
insert into public.weeks (season_id, week_number, label)
select s.id, 1, 'Week 1' from s
on conflict (season_id, week_number) do nothing;

with w as (
  select w.id from public.weeks w
  join public.seasons s on s.id = w.season_id
  where s.year = 2025 and w.week_number = 1
)
insert into public.games (week_id, away_team, home_team, spread, kickoff, lock_time)
select w.id, 'Kansas City Chiefs', 'Buffalo Bills', -2.5,
  '2025-09-07 20:20:00+00', '2025-09-07 20:20:00+00'
from w;
*/
