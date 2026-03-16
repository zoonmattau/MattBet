-- =============================================
-- Golf Trip Bookmaker - Database Schema
-- =============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- =============================================
-- TEAMS
-- =============================================
create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  avg_handicap numeric(4,1),
  created_at timestamptz default now()
);

-- =============================================
-- PLAYERS
-- =============================================
create table public.players (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  handicap integer not null default 0,
  team_id uuid references public.teams(id) on delete set null,
  created_at timestamptz default now()
);

-- =============================================
-- MARKETS
-- =============================================
create table public.markets (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  category text not null default 'outrights',
  market_type text not null default 'winner',
  line_value numeric(6,1),
  status text not null default 'open' check (status in ('open', 'suspended', 'settled', 'void')),
  round_label text,
  is_featured boolean default false,
  settlement_type text default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- MARKET SELECTIONS
-- =============================================
create table public.market_selections (
  id uuid primary key default uuid_generate_v4(),
  market_id uuid not null references public.markets(id) on delete cascade,
  name text not null,
  odds_decimal numeric(8,2) not null default 2.00,
  sort_order integer default 0,
  is_winner boolean,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- BETS
-- =============================================
create table public.bets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  bettor_name text not null,
  market_id uuid not null references public.markets(id) on delete cascade,
  selection_id uuid not null references public.market_selections(id) on delete cascade,
  stake numeric(10,2) not null check (stake > 0),
  odds_taken numeric(8,2) not null,
  potential_payout numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'won', 'lost', 'void')),
  placed_at timestamptz default now(),
  settled_at timestamptz
);

-- =============================================
-- LEADERBOARD - INDIVIDUAL
-- =============================================
create table public.leaderboard_individual (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references public.players(id) on delete cascade,
  player_name text not null,
  team_name text,
  handicap integer,
  round_1_score integer,
  round_1_points numeric(4,1),
  round_2_score integer,
  round_2_points numeric(4,1),
  round_3_score integer,
  round_3_points numeric(4,1),
  round_4_score integer,
  round_4_points numeric(4,1),
  total_points numeric(6,1) default 0,
  position integer,
  source text default 'manual' check (source in ('manual', 'sheet')),
  updated_at timestamptz default now()
);

-- =============================================
-- LEADERBOARD - TEAM
-- =============================================
create table public.leaderboard_team (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade,
  team_name text not null,
  round_1_points numeric(6,1),
  round_2_points numeric(6,1),
  round_3_points numeric(6,1),
  round_4_points numeric(6,1),
  total_points numeric(8,1) default 0,
  position integer,
  source text default 'manual' check (source in ('manual', 'sheet')),
  updated_at timestamptz default now()
);

-- =============================================
-- LEADERBOARD SYNC LOGS
-- =============================================
create table public.leaderboard_sync_logs (
  id uuid primary key default uuid_generate_v4(),
  source_type text not null default 'google_sheets',
  source_reference text,
  status text not null default 'pending' check (status in ('pending', 'success', 'error')),
  rows_processed integer default 0,
  message text,
  synced_at timestamptz default now()
);

-- =============================================
-- ADMIN SETTINGS
-- =============================================
create table public.admin_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value text,
  updated_at timestamptz default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index idx_market_selections_market on public.market_selections(market_id);
create index idx_bets_market on public.bets(market_id);
create index idx_bets_selection on public.bets(selection_id);
create index idx_bets_status on public.bets(status);
create index idx_markets_status on public.markets(status);
create index idx_markets_slug on public.markets(slug);
create index idx_players_team on public.players(team_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.markets enable row level security;
alter table public.market_selections enable row level security;
alter table public.bets enable row level security;
alter table public.leaderboard_individual enable row level security;
alter table public.leaderboard_team enable row level security;
alter table public.leaderboard_sync_logs enable row level security;
alter table public.admin_settings enable row level security;

-- Public read policies
create policy "Public read teams" on public.teams for select using (true);
create policy "Public read players" on public.players for select using (true);
create policy "Public read markets" on public.markets for select using (true);
create policy "Public read selections" on public.market_selections for select using (true);
create policy "Public read leaderboard individual" on public.leaderboard_individual for select using (true);
create policy "Public read leaderboard team" on public.leaderboard_team for select using (true);

-- Public insert for bets (anyone can place a bet)
create policy "Public insert bets" on public.bets for insert with check (true);
create policy "Public read bets" on public.bets for select using (true);

-- Admin full access (service role bypasses RLS, but for authenticated admins):
create policy "Admin full access teams" on public.teams for all using (auth.jwt() ->> 'email' = 'matthew.parker@live.com.au');
create policy "Admin full access players" on public.players for all using (auth.jwt() ->> 'email' = 'matthew.parker@live.com.au');
create policy "Admin full access markets" on public.markets for all using (auth.jwt() ->> 'email' = 'matthew.parker@live.com.au');
create policy "Admin full access selections" on public.market_selections for all using (auth.jwt() ->> 'email' = 'matthew.parker@live.com.au');
create policy "Admin full access bets" on public.bets for all using (auth.jwt() ->> 'email' = 'matthew.parker@live.com.au');
create policy "Admin full access leaderboard_individual" on public.leaderboard_individual for all using (auth.jwt() ->> 'email' = 'matthew.parker@live.com.au');
create policy "Admin full access leaderboard_team" on public.leaderboard_team for all using (auth.jwt() ->> 'email' = 'matthew.parker@live.com.au');
create policy "Admin full access sync_logs" on public.leaderboard_sync_logs for all using (auth.jwt() ->> 'email' = 'matthew.parker@live.com.au');
create policy "Admin full access settings" on public.admin_settings for all using (auth.jwt() ->> 'email' = 'matthew.parker@live.com.au');
create policy "Public read sync_logs" on public.leaderboard_sync_logs for select using (true);
create policy "Public read settings" on public.admin_settings for select using (true);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger markets_updated_at before update on public.markets
  for each row execute function public.update_updated_at();

create trigger market_selections_updated_at before update on public.market_selections
  for each row execute function public.update_updated_at();

create trigger leaderboard_individual_updated_at before update on public.leaderboard_individual
  for each row execute function public.update_updated_at();

create trigger leaderboard_team_updated_at before update on public.leaderboard_team
  for each row execute function public.update_updated_at();

create trigger admin_settings_updated_at before update on public.admin_settings
  for each row execute function public.update_updated_at();
