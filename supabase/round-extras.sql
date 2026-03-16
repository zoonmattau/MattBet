-- =============================================
-- Round 2, 3, 4 Extra Markets
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- ROUND 2 EXTRAS (Saturday AM - Lost Farm)
-- =============================================

-- Which team wins the most R2 matches?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e4000000-0000-0000-0000-000000000001', 'R2: Team with Most Match Play Wins', 'r2-most-wins', 'match_play', 'winner', 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e4000000-0000-0000-0000-000000000001', 'Group 3', 2.25, 1),
  ('e4000000-0000-0000-0000-000000000001', 'Group 1', 3.00, 2),
  ('e4000000-0000-0000-0000-000000000001', 'Group 2', 3.25, 3),
  ('e4000000-0000-0000-0000-000000000001', 'All teams win one', 4.00, 4);

-- Will any R2 match be decided on the last hole?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e4000000-0000-0000-0000-000000000002', 'R2: Will Any Match Go to the 18th?', 'r2-go-to-18th', 'match_play', 'yes_no', 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e4000000-0000-0000-0000-000000000002', 'Yes', 1.55, 1),
  ('e4000000-0000-0000-0000-000000000002', 'No', 2.40, 2);

-- Will any R2 match finish before the 15th hole?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e4000000-0000-0000-0000-000000000003', 'R2: Will Any Match Finish Before 15th Hole?', 'r2-finish-early', 'match_play', 'yes_no', 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e4000000-0000-0000-0000-000000000003', 'Yes', 2.20, 1),
  ('e4000000-0000-0000-0000-000000000003', 'No', 1.65, 2);

-- Biggest R2 winning margin O/U
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e4000000-0000-0000-0000-000000000004', 'R2: Biggest Winning Margin', 'r2-biggest-margin', 'match_play', 'over_under', 4.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e4000000-0000-0000-0000-000000000004', 'Over 4.5 holes', 1.85, 1),
  ('e4000000-0000-0000-0000-000000000004', 'Under 4.5 holes', 1.95, 2);

-- Total R2 points scored by Group 1
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e4000000-0000-0000-0000-000000000005', 'R2: Group 1 Points', 'r2-group-1-pts', 'match_play', 'over_under', 5.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e4000000-0000-0000-0000-000000000005', 'Over 5.5', 1.95, 1),
  ('e4000000-0000-0000-0000-000000000005', 'Under 5.5', 1.85, 2);

-- Total R2 points scored by Group 2
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e4000000-0000-0000-0000-000000000006', 'R2: Group 2 Points', 'r2-group-2-pts', 'match_play', 'over_under', 5.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e4000000-0000-0000-0000-000000000006', 'Over 5.5', 2.00, 1),
  ('e4000000-0000-0000-0000-000000000006', 'Under 5.5', 1.80, 2);

-- Total R2 points scored by Group 3
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e4000000-0000-0000-0000-000000000007', 'R2: Group 3 Points', 'r2-group-3-pts', 'match_play', 'over_under', 7.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e4000000-0000-0000-0000-000000000007', 'Over 7.5', 1.90, 1),
  ('e4000000-0000-0000-0000-000000000007', 'Under 7.5', 1.90, 2);


-- =============================================
-- ROUND 3 EXTRAS (Saturday PM - Bougle Run)
-- =============================================

-- Which team wins the most R3 matches?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e5000000-0000-0000-0000-000000000001', 'R3: Team with Most Scramble Wins', 'r3-most-wins', 'match_play', 'winner', 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e5000000-0000-0000-0000-000000000001', 'Group 3', 2.25, 1),
  ('e5000000-0000-0000-0000-000000000001', 'Group 1', 3.00, 2),
  ('e5000000-0000-0000-0000-000000000001', 'Group 2', 3.25, 3),
  ('e5000000-0000-0000-0000-000000000001', 'All teams win one', 4.00, 4);

-- Will any R3 match be a blowout (5+ holes)?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e5000000-0000-0000-0000-000000000002', 'R3: Will Any Match Be Won by 5+ Holes?', 'r3-blowout', 'match_play', 'yes_no', 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e5000000-0000-0000-0000-000000000002', 'Yes', 2.10, 1),
  ('e5000000-0000-0000-0000-000000000002', 'No', 1.75, 2);

-- Biggest R3 winning margin O/U
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e5000000-0000-0000-0000-000000000003', 'R3: Biggest Winning Margin', 'r3-biggest-margin', 'match_play', 'over_under', 3.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e5000000-0000-0000-0000-000000000003', 'Over 3.5 holes', 1.90, 1),
  ('e5000000-0000-0000-0000-000000000003', 'Under 3.5 holes', 1.90, 2);

-- Total R3 points scored by Group 1
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e5000000-0000-0000-0000-000000000004', 'R3: Group 1 Points', 'r3-group-1-pts', 'match_play', 'over_under', 5.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e5000000-0000-0000-0000-000000000004', 'Over 5.5', 1.95, 1),
  ('e5000000-0000-0000-0000-000000000004', 'Under 5.5', 1.85, 2);

-- Total R3 points scored by Group 2
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e5000000-0000-0000-0000-000000000005', 'R3: Group 2 Points', 'r3-group-2-pts', 'match_play', 'over_under', 5.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e5000000-0000-0000-0000-000000000005', 'Over 5.5', 2.00, 1),
  ('e5000000-0000-0000-0000-000000000005', 'Under 5.5', 1.80, 2);

-- Total R3 points scored by Group 3
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e5000000-0000-0000-0000-000000000006', 'R3: Group 3 Points', 'r3-group-3-pts', 'match_play', 'over_under', 7.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e5000000-0000-0000-0000-000000000006', 'Over 7.5', 1.90, 1),
  ('e5000000-0000-0000-0000-000000000006', 'Under 7.5', 1.90, 2);


-- =============================================
-- ROUND 4 EXTRAS (Sunday - Barnbougle Dunes)
-- =============================================

-- Which team wins the most R4 matches?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e6000000-0000-0000-0000-000000000001', 'R4: Team with Most Sunday Wins', 'r4-most-wins', 'match_play', 'winner', 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e6000000-0000-0000-0000-000000000001', 'Group 3', 2.25, 1),
  ('e6000000-0000-0000-0000-000000000001', 'Group 1', 3.00, 2),
  ('e6000000-0000-0000-0000-000000000001', 'Group 2', 3.25, 3);

-- Will any team sweep (win both matches)?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e6000000-0000-0000-0000-000000000002', 'R4: Will Any Team Win Both Their Matches?', 'r4-team-sweep', 'match_play', 'yes_no', 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e6000000-0000-0000-0000-000000000002', 'Yes', 1.45, 1),
  ('e6000000-0000-0000-0000-000000000002', 'No', 2.70, 2);

-- How many of 6 matches will the favourite win?
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e6000000-0000-0000-0000-000000000003', 'R4: Favourites to Win', 'r4-favs-wins', 'match_play', 'over_under', 3.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e6000000-0000-0000-0000-000000000003', 'Over 3.5 favourites win', 1.85, 1),
  ('e6000000-0000-0000-0000-000000000003', 'Under 3.5 favourites win', 1.95, 2);

-- Will any R4 match go to the 18th?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e6000000-0000-0000-0000-000000000004', 'R4: Will Any Match Go to the 18th?', 'r4-go-to-18th', 'match_play', 'yes_no', 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e6000000-0000-0000-0000-000000000004', 'Yes', 1.35, 1),
  ('e6000000-0000-0000-0000-000000000004', 'No', 3.25, 2);

-- Will any R4 match finish before the 14th hole?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e6000000-0000-0000-0000-000000000005', 'R4: Will Any Match End Before 14th Hole?', 'r4-finish-early', 'match_play', 'yes_no', 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e6000000-0000-0000-0000-000000000005', 'Yes', 2.50, 1),
  ('e6000000-0000-0000-0000-000000000005', 'No', 1.55, 2);

-- Biggest R4 winning margin O/U
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e6000000-0000-0000-0000-000000000006', 'R4: Biggest Winning Margin', 'r4-biggest-margin', 'match_play', 'over_under', 5.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e6000000-0000-0000-0000-000000000006', 'Over 5.5 holes', 1.90, 1),
  ('e6000000-0000-0000-0000-000000000006', 'Under 5.5 holes', 1.90, 2);

-- Total R4 points scored by Group 1
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e6000000-0000-0000-0000-000000000007', 'R4: Group 1 Points', 'r4-group-1-pts', 'match_play', 'over_under', 7.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e6000000-0000-0000-0000-000000000007', 'Over 7.5', 1.90, 1),
  ('e6000000-0000-0000-0000-000000000007', 'Under 7.5', 1.90, 2);

-- Total R4 points scored by Group 2
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e6000000-0000-0000-0000-000000000008', 'R4: Group 2 Points', 'r4-group-2-pts', 'match_play', 'over_under', 7.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e6000000-0000-0000-0000-000000000008', 'Over 7.5', 1.95, 1),
  ('e6000000-0000-0000-0000-000000000008', 'Under 7.5', 1.85, 2);

-- Total R4 points scored by Group 3
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e6000000-0000-0000-0000-000000000009', 'R4: Group 3 Points', 'r4-group-3-pts', 'match_play', 'over_under', 9.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e6000000-0000-0000-0000-000000000009', 'Over 9.5', 1.85, 1),
  ('e6000000-0000-0000-0000-000000000009', 'Under 9.5', 1.95, 2);

-- Total halved matches across R4
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e6000000-0000-0000-0000-000000000010', 'R4: Total Halved Matches', 'r4-total-halved', 'match_play', 'over_under', 0.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e6000000-0000-0000-0000-000000000010', 'Over 0.5 (at least 1 halved)', 2.50, 1),
  ('e6000000-0000-0000-0000-000000000010', 'Under 0.5 (no halved matches)', 1.55, 2);
