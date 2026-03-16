-- =============================================
-- Golf Trip Bookmaker - Seed Data
-- =============================================

-- Teams
insert into public.teams (id, name, avg_handicap) values
  ('a1000000-0000-0000-0000-000000000001', 'Group 1', 14.0),
  ('a1000000-0000-0000-0000-000000000002', 'Group 2', 15.0),
  ('a1000000-0000-0000-0000-000000000003', 'Group 3', 14.5);

-- Players
insert into public.players (id, name, handicap, team_id) values
  ('b1000000-0000-0000-0000-000000000001', 'Watto', 15, 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'Brad', 15, 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000003', 'Bails', 14, 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000004', 'Hugo', 12, 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000005', 'Finn', 15, 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000006', 'Ando', 15, 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000007', 'Jackson', 12, 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000008', 'McNaughton', 18, 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000009', 'Daniel', 20, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000010', 'Jacob', 10, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000011', 'Lewis', 6, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000012', 'Parker', 22, 'a1000000-0000-0000-0000-000000000003');

-- Markets
-- Outright Winner
insert into public.markets (id, title, slug, category, market_type, status, is_featured) values
  ('c1000000-0000-0000-0000-000000000001', 'Trip Champion', 'trip-champion', 'outrights', 'winner', 'open', true);

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('c1000000-0000-0000-0000-000000000001', 'Watto', 10.00, 1),
  ('c1000000-0000-0000-0000-000000000001', 'Brad', 10.00, 2),
  ('c1000000-0000-0000-0000-000000000001', 'Bails', 9.00, 3),
  ('c1000000-0000-0000-0000-000000000001', 'Hugo', 8.00, 4),
  ('c1000000-0000-0000-0000-000000000001', 'Finn', 10.00, 5),
  ('c1000000-0000-0000-0000-000000000001', 'Ando', 10.00, 6),
  ('c1000000-0000-0000-0000-000000000001', 'Jackson', 8.00, 7),
  ('c1000000-0000-0000-0000-000000000001', 'McNaughton', 12.00, 8),
  ('c1000000-0000-0000-0000-000000000001', 'Daniel', 12.00, 9),
  ('c1000000-0000-0000-0000-000000000001', 'Jacob', 5.00, 10),
  ('c1000000-0000-0000-0000-000000000001', 'Lewis', 4.00, 11),
  ('c1000000-0000-0000-0000-000000000001', 'Parker', 15.00, 12);

-- Team Champion
insert into public.markets (id, title, slug, category, market_type, status, is_featured) values
  ('c1000000-0000-0000-0000-000000000002', 'Winning Team', 'winning-team', 'outrights', 'winner', 'open', true);

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('c1000000-0000-0000-0000-000000000002', 'Group 1', 3.50, 1),
  ('c1000000-0000-0000-0000-000000000002', 'Group 2', 3.25, 2),
  ('c1000000-0000-0000-0000-000000000002', 'Group 3', 2.25, 3);

-- Friday Stableford Winner
insert into public.markets (id, title, slug, category, market_type, status, round_label, is_featured) values
  ('c1000000-0000-0000-0000-000000000003', 'Friday Stableford Winner', 'friday-stableford-winner', 'stableford', 'winner', 'open', 'Friday', true);

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('c1000000-0000-0000-0000-000000000003', 'Watto', 12.00, 1),
  ('c1000000-0000-0000-0000-000000000003', 'Brad', 12.00, 2),
  ('c1000000-0000-0000-0000-000000000003', 'Bails', 10.00, 3),
  ('c1000000-0000-0000-0000-000000000003', 'Hugo', 8.00, 4),
  ('c1000000-0000-0000-0000-000000000003', 'Finn', 12.00, 5),
  ('c1000000-0000-0000-0000-000000000003', 'Ando', 12.00, 6),
  ('c1000000-0000-0000-0000-000000000003', 'Jackson', 8.00, 7),
  ('c1000000-0000-0000-0000-000000000003', 'McNaughton', 15.00, 8),
  ('c1000000-0000-0000-0000-000000000003', 'Daniel', 15.00, 9),
  ('c1000000-0000-0000-0000-000000000003', 'Jacob', 5.50, 10),
  ('c1000000-0000-0000-0000-000000000003', 'Lewis', 4.50, 11),
  ('c1000000-0000-0000-0000-000000000003', 'Parker', 18.00, 12);

-- Friday Top 3 Finish
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('c1000000-0000-0000-0000-000000000004', 'Friday Top 3 Finish', 'friday-top-3', 'stableford', 'top_n', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('c1000000-0000-0000-0000-000000000004', 'Jacob', 2.00, 1),
  ('c1000000-0000-0000-0000-000000000004', 'Lewis', 1.80, 2),
  ('c1000000-0000-0000-0000-000000000004', 'Hugo', 2.50, 3),
  ('c1000000-0000-0000-0000-000000000004', 'Jackson', 2.50, 4),
  ('c1000000-0000-0000-0000-000000000004', 'Bails', 3.00, 5),
  ('c1000000-0000-0000-0000-000000000004', 'Watto', 4.00, 6),
  ('c1000000-0000-0000-0000-000000000004', 'Brad', 4.00, 7),
  ('c1000000-0000-0000-0000-000000000004', 'Finn', 4.00, 8),
  ('c1000000-0000-0000-0000-000000000004', 'Ando', 4.00, 9),
  ('c1000000-0000-0000-0000-000000000004', 'McNaughton', 5.00, 10),
  ('c1000000-0000-0000-0000-000000000004', 'Daniel', 5.00, 11),
  ('c1000000-0000-0000-0000-000000000004', 'Parker', 6.00, 12);

-- Highest Stableford Score Over/Under
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('c1000000-0000-0000-0000-000000000005', 'Highest Friday Stableford Score', 'highest-friday-score', 'score_totals', 'over_under', 36.5, 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('c1000000-0000-0000-0000-000000000005', 'Over 36.5', 1.90, 1),
  ('c1000000-0000-0000-0000-000000000005', 'Under 36.5', 1.90, 2);


-- Sunday Match Play - will there be a whitewash
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('c1000000-0000-0000-0000-000000000008', 'Will Any Team Win All 4 Sunday Matches?', 'sunday-whitewash', 'match_play', 'yes_no', 'open', 'Sunday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('c1000000-0000-0000-0000-000000000008', 'Yes', 6.00, 1),
  ('c1000000-0000-0000-0000-000000000008', 'No', 1.10, 2);

-- Trip Special - wooden spoon
insert into public.markets (id, title, slug, category, market_type, status, is_featured) values
  ('c1000000-0000-0000-0000-000000000009', 'Wooden Spoon (Last Place Overall)', 'wooden-spoon', 'outrights', 'winner', 'open', false);

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('c1000000-0000-0000-0000-000000000009', 'Parker', 3.00, 1),
  ('c1000000-0000-0000-0000-000000000009', 'Daniel', 4.00, 2),
  ('c1000000-0000-0000-0000-000000000009', 'McNaughton', 5.00, 3),
  ('c1000000-0000-0000-0000-000000000009', 'Watto', 8.00, 4),
  ('c1000000-0000-0000-0000-000000000009', 'Brad', 8.00, 5),
  ('c1000000-0000-0000-0000-000000000009', 'Any Other', 3.50, 6);


-- Initial leaderboard data (zeroed out)
insert into public.leaderboard_individual (player_id, player_name, team_name, handicap, total_points, position, source)
select id, name, (select t.name from public.teams t where t.id = p.team_id), handicap, 0, 0, 'manual'
from public.players p;

insert into public.leaderboard_team (team_id, team_name, total_points, position, source)
select id, name, 0, 0, 'manual'
from public.teams;

-- Admin settings
insert into public.admin_settings (key, value) values
  ('google_sheet_individual_url', ''),
  ('google_sheet_team_url', ''),
  ('auto_sync_enabled', 'false'),
  ('auto_sync_interval_minutes', '5'),
  ('leaderboard_source', 'manual'),
  ('trip_status', 'Markets Open - Betting Live');

-- Sample bets for demo
insert into public.bets (bettor_name, market_id, selection_id, stake, odds_taken, potential_payout, status) values
  ('Macca', 'c1000000-0000-0000-0000-000000000001',
    (select id from public.market_selections where market_id = 'c1000000-0000-0000-0000-000000000001' and name = 'Lewis'),
    20.00, 4.00, 80.00, 'pending'),
  ('Davo', 'c1000000-0000-0000-0000-000000000001',
    (select id from public.market_selections where market_id = 'c1000000-0000-0000-0000-000000000001' and name = 'Jacob'),
    15.00, 5.00, 75.00, 'pending'),
  ('Richo', 'c1000000-0000-0000-0000-000000000002',
    (select id from public.market_selections where market_id = 'c1000000-0000-0000-0000-000000000002' and name = 'Group 3'),
    25.00, 2.25, 56.25, 'pending'),
  ('Simmo', 'c1000000-0000-0000-0000-000000000003',
    (select id from public.market_selections where market_id = 'c1000000-0000-0000-0000-000000000003' and name = 'Hugo'),
    10.00, 8.00, 80.00, 'pending'),
  ('Tommo', 'c1000000-0000-0000-0000-000000000009',
    (select id from public.market_selections where market_id = 'c1000000-0000-0000-0000-000000000009' and name = 'Parker'),
    5.00, 3.00, 15.00, 'pending');
