-- =============================================
-- More Friday Stableford Markets
-- Run this in Supabase SQL Editor
-- =============================================

-- Average Stableford Score Over/Under
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e2000000-0000-0000-0000-000000000001', 'Average Stableford Score (All Players)', 'friday-avg-score', 'score_totals', 'over_under', 28.5, 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e2000000-0000-0000-0000-000000000001', 'Over 28.5', 1.90, 1),
  ('e2000000-0000-0000-0000-000000000001', 'Under 28.5', 1.90, 2);

-- Total Combined Stableford Points Over/Under
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e2000000-0000-0000-0000-000000000002', 'Total Combined Stableford Points (12 Players)', 'friday-total-points', 'score_totals', 'over_under', 340.5, 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e2000000-0000-0000-0000-000000000002', 'Over 340.5', 1.85, 1),
  ('e2000000-0000-0000-0000-000000000002', 'Under 340.5', 1.95, 2);

-- Lewis vs Jacob: Who Scores Higher?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e2000000-0000-0000-0000-000000000003', 'Lewis vs Jacob: Higher Stableford Score', 'friday-lewis-v-jacob', 'stableford', 'winner', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e2000000-0000-0000-0000-000000000003', 'Lewis', 1.75, 1),
  ('e2000000-0000-0000-0000-000000000003', 'Jacob', 2.05, 2);

-- Best of Each Group: Which Team's Top Scorer Wins?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e2000000-0000-0000-0000-000000000004', 'Highest Individual Scorer by Team', 'friday-best-of-group', 'stableford', 'winner', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e2000000-0000-0000-0000-000000000004', 'Group 3 top scorer', 1.90, 1),
  ('e2000000-0000-0000-0000-000000000004', 'Group 1 top scorer', 3.00, 2),
  ('e2000000-0000-0000-0000-000000000004', 'Group 2 top scorer', 3.25, 3);

-- Highest Scoring Team on Friday (Combined Stableford)
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e2000000-0000-0000-0000-000000000005', 'Highest Scoring Team on Friday', 'friday-best-team', 'stableford', 'winner', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e2000000-0000-0000-0000-000000000005', 'Group 3', 2.10, 1),
  ('e2000000-0000-0000-0000-000000000005', 'Group 1', 3.00, 2),
  ('e2000000-0000-0000-0000-000000000005', 'Group 2', 3.25, 3);

-- Any Player to Score 40+ Stableford Points?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e2000000-0000-0000-0000-000000000006', 'Any Player to Score 40+ Points?', 'friday-40-plus', 'score_totals', 'yes_no', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e2000000-0000-0000-0000-000000000006', 'Yes', 2.50, 1),
  ('e2000000-0000-0000-0000-000000000006', 'No', 1.55, 2);

-- Will Anyone Score a Net Eagle?
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e2000000-0000-0000-0000-000000000007', 'Will Anyone Score a Net Eagle?', 'friday-net-eagle', 'score_totals', 'yes_no', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e2000000-0000-0000-0000-000000000007', 'Yes', 1.40, 1),
  ('e2000000-0000-0000-0000-000000000007', 'No', 2.90, 2);

-- How Many Players Score 30+? Over/Under
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e2000000-0000-0000-0000-000000000008', 'Players to Score 30+ Points', 'friday-30-plus-count', 'score_totals', 'over_under', 6.5, 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e2000000-0000-0000-0000-000000000008', 'Over 6.5 players', 1.90, 1),
  ('e2000000-0000-0000-0000-000000000008', 'Under 6.5 players', 1.90, 2);

-- Margin Between 1st and Last Over/Under
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e2000000-0000-0000-0000-000000000009', '1st to Last Place Margin', 'friday-margin-1st-last', 'score_totals', 'over_under', 15.5, 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e2000000-0000-0000-0000-000000000009', 'Over 15.5 points', 1.85, 1),
  ('e2000000-0000-0000-0000-000000000009', 'Under 15.5 points', 1.95, 2);
