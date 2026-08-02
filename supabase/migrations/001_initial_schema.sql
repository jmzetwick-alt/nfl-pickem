-- NFL Pick'em schema with Row Level Security

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seasons
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  year integer not null unique,
  name text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Weeks
create table public.weeks (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  week_number integer not null,
  label text not null,
  created_at timestamptz not null default now(),
  unique (season_id, week_number)
);

-- Games (spread is from home team perspective: -3.5 = home favored by 3.5)
create table public.games (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks (id) on delete cascade,
  away_team text not null,
  home_team text not null,
  spread numeric(4, 1) not null default 0,
  kickoff timestamptz not null,
  lock_time timestamptz not null,
  away_score integer,
  home_score integer,
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Picks (one per user per game)
create table public.picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  picked_side text not null check (picked_side in ('home', 'away')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, game_id)
);

-- Indexes
create index games_week_id_idx on public.games (week_id);
create index games_kickoff_idx on public.games (kickoff);
create index picks_user_id_idx on public.picks (user_id);
create index picks_game_id_idx on public.picks (game_id);
create index weeks_season_id_idx on public weeks (season_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger for games and picks
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

create trigger picks_updated_at
  before update on public.picks
  for each row execute function public.set_updated_at();

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.weeks enable row level security;
alter table public.games enable row level security;
alter table public.picks enable row level security;

-- Profiles: read all (for standings), update own
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seasons & weeks: read all authenticated, admin write
create policy "Seasons viewable by authenticated"
  on public.seasons for select to authenticated using (true);

create policy "Admins manage seasons"
  on public.seasons for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Weeks viewable by authenticated"
  on public.weeks for select to authenticated using (true);

create policy "Admins manage weeks"
  on public.weeks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Games: read all, admin write
create policy "Games viewable by authenticated"
  on public.games for select to authenticated using (true);

create policy "Admins manage games"
  on public.games for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Picks: read all (for transparency), insert/update own before lock
create policy "Picks viewable by authenticated"
  on public.picks for select to authenticated using (true);

create policy "Users insert own picks before lock"
  on public.picks for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.games g
      where g.id = game_id and g.lock_time > now()
    )
  );

create policy "Users update own picks before lock"
  on public.picks for update to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.games g
      where g.id = game_id and g.lock_time > now()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.games g
      where g.id = game_id and g.lock_time > now()
    )
  );

-- Seed a default season (optional — run after first admin is set)
-- insert into public.seasons (year, name, is_active) values (2025, '2025 NFL Season', true);
