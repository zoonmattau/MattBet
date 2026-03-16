-- =============================================
-- Match Markets - Round 2, 3, and 4
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- ROUND 2 - 2v2 MATCH PLAY (Lost Farm, Sat AM)
-- =============================================

-- Match 1: Hugo & Bails vs Jackson & Finn
-- Combined HC 26 vs 27, very even
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d1000000-0000-0000-0000-000000000001', 'R2 Match 1: Hugo/Bails vs Jackson/Finn', 'r2-m1-h2h', 'match_play', 'winner', 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000001', 'Hugo and Bails', 1.85, 1),
  ('d1000000-0000-0000-0000-000000000001', 'Jackson and Finn', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d1000000-0000-0000-0000-000000000002', 'R2 Match 1: Winning Margin', 'r2-m1-margin', 'match_play', 'over_under', 1.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000002', 'Over 1.5 holes', 1.85, 1),
  ('d1000000-0000-0000-0000-000000000002', 'Under 1.5 holes', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d1000000-0000-0000-0000-000000000003', 'R2 Match 1: Hugo/Bails Total Holes Won', 'r2-m1-hb-total', 'match_play', 'over_under', 8.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000003', 'Over 8.5', 1.90, 1),
  ('d1000000-0000-0000-0000-000000000003', 'Under 8.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d1000000-0000-0000-0000-000000000004', 'R2 Match 1: Jackson/Finn Total Holes Won', 'r2-m1-jf-total', 'match_play', 'over_under', 8.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000004', 'Over 8.5', 1.95, 1),
  ('d1000000-0000-0000-0000-000000000004', 'Under 8.5', 1.85, 2);

-- Match 2: Ando & McNaughton vs Lewis & Jacob
-- HC 33 vs 16. Lewis/Jacob class acts, clear favourites even with handicaps
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d1000000-0000-0000-0000-000000000005', 'R2 Match 2: Ando/McNaughton vs Lewis/Jacob', 'r2-m2-h2h', 'match_play', 'winner', 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000005', 'Lewis and Jacob', 1.65, 1),
  ('d1000000-0000-0000-0000-000000000005', 'Ando and McNaughton', 2.25, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d1000000-0000-0000-0000-000000000006', 'R2 Match 2: Winning Margin', 'r2-m2-margin', 'match_play', 'over_under', 2.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000006', 'Over 2.5 holes', 1.85, 1),
  ('d1000000-0000-0000-0000-000000000006', 'Under 2.5 holes', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d1000000-0000-0000-0000-000000000007', 'R2 Match 2: Lewis/Jacob Total Holes Won', 'r2-m2-lj-total', 'match_play', 'over_under', 9.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000007', 'Over 9.5', 1.85, 1),
  ('d1000000-0000-0000-0000-000000000007', 'Under 9.5', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d1000000-0000-0000-0000-000000000008', 'R2 Match 2: Ando/McNaughton Total Holes Won', 'r2-m2-ah-total', 'match_play', 'over_under', 7.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000008', 'Over 7.5', 1.95, 1),
  ('d1000000-0000-0000-0000-000000000008', 'Under 7.5', 1.85, 2);

-- Match 3: Daniel & Parker vs Brad & General
-- HC 42 vs 30. Brad/General more consistent, favoured.
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d1000000-0000-0000-0000-000000000009', 'R2 Match 3: Daniel/Parker vs Brad/General', 'r2-m3-h2h', 'match_play', 'winner', 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000009', 'Brad and General', 1.70, 1),
  ('d1000000-0000-0000-0000-000000000009', 'Daniel and Parker', 2.15, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d1000000-0000-0000-0000-000000000010', 'R2 Match 3: Winning Margin', 'r2-m3-margin', 'match_play', 'over_under', 2.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000010', 'Over 2.5 holes', 1.80, 1),
  ('d1000000-0000-0000-0000-000000000010', 'Under 2.5 holes', 2.00, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d1000000-0000-0000-0000-000000000011', 'R2 Match 3: Brad/General Total Holes Won', 'r2-m3-bg-total', 'match_play', 'over_under', 9.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000011', 'Over 9.5', 1.90, 1),
  ('d1000000-0000-0000-0000-000000000011', 'Under 9.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d1000000-0000-0000-0000-000000000012', 'R2 Match 3: Daniel/Parker Total Holes Won', 'r2-m3-dp-total', 'match_play', 'over_under', 7.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d1000000-0000-0000-0000-000000000012', 'Over 7.5', 2.00, 1),
  ('d1000000-0000-0000-0000-000000000012', 'Under 7.5', 1.80, 2);


-- =============================================
-- ROUND 3 - 2v2 SCRAMBLE (Bougle Run, Sat PM)
-- 14-hole short course. Lower HCs dominate scramble.
-- =============================================

-- Match 1: Hugo & Bails vs Daniel & Parker
-- HC 26 vs 42. Hugo/Bails strong scramble edge.
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d2000000-0000-0000-0000-000000000001', 'R3 Match 1: Hugo/Bails vs Daniel/Parker', 'r3-m1-h2h', 'match_play', 'winner', 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000001', 'Hugo and Bails', 1.55, 1),
  ('d2000000-0000-0000-0000-000000000001', 'Daniel and Parker', 2.45, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d2000000-0000-0000-0000-000000000002', 'R3 Match 1: Winning Margin', 'r3-m1-margin', 'match_play', 'over_under', 3.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000002', 'Over 3.5 holes', 1.90, 1),
  ('d2000000-0000-0000-0000-000000000002', 'Under 3.5 holes', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d2000000-0000-0000-0000-000000000003', 'R3 Match 1: Hugo/Bails Total Holes Won', 'r3-m1-hb-total', 'match_play', 'over_under', 8.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000003', 'Over 8.5', 1.85, 1),
  ('d2000000-0000-0000-0000-000000000003', 'Under 8.5', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d2000000-0000-0000-0000-000000000004', 'R3 Match 1: Daniel/Parker Total Holes Won', 'r3-m1-dp-total', 'match_play', 'over_under', 5.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000004', 'Over 5.5', 1.95, 1),
  ('d2000000-0000-0000-0000-000000000004', 'Under 5.5', 1.85, 2);

-- Match 2: Jackson & Finn vs Brad & General
-- HC 27 vs 30. Close, Jackson gives slight edge.
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d2000000-0000-0000-0000-000000000005', 'R3 Match 2: Jackson/Finn vs Brad/General', 'r3-m2-h2h', 'match_play', 'winner', 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000005', 'Jackson and Finn', 1.80, 1),
  ('d2000000-0000-0000-0000-000000000005', 'Brad and General', 2.00, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d2000000-0000-0000-0000-000000000006', 'R3 Match 2: Winning Margin', 'r3-m2-margin', 'match_play', 'over_under', 1.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000006', 'Over 1.5 holes', 1.85, 1),
  ('d2000000-0000-0000-0000-000000000006', 'Under 1.5 holes', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d2000000-0000-0000-0000-000000000007', 'R3 Match 2: Jackson/Finn Total Holes Won', 'r3-m2-jf-total', 'match_play', 'over_under', 7.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000007', 'Over 7.5', 1.85, 1),
  ('d2000000-0000-0000-0000-000000000007', 'Under 7.5', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d2000000-0000-0000-0000-000000000008', 'R3 Match 2: Brad/General Total Holes Won', 'r3-m2-bg-total', 'match_play', 'over_under', 6.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000008', 'Over 6.5', 1.95, 1),
  ('d2000000-0000-0000-0000-000000000008', 'Under 6.5', 1.85, 2);

-- Match 3: Lewis & Jacob vs Ando & McNaughton
-- HC 16 vs 33. Lewis/Jacob dominant scramble pair.
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d2000000-0000-0000-0000-000000000009', 'R3 Match 3: Lewis/Jacob vs Ando/McNaughton', 'r3-m3-h2h', 'match_play', 'winner', 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000009', 'Lewis and Jacob', 1.45, 1),
  ('d2000000-0000-0000-0000-000000000009', 'Ando and McNaughton', 2.70, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d2000000-0000-0000-0000-000000000010', 'R3 Match 3: Winning Margin', 'r3-m3-margin', 'match_play', 'over_under', 3.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000010', 'Over 3.5 holes', 1.85, 1),
  ('d2000000-0000-0000-0000-000000000010', 'Under 3.5 holes', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d2000000-0000-0000-0000-000000000011', 'R3 Match 3: Lewis/Jacob Total Holes Won', 'r3-m3-lj-total', 'match_play', 'over_under', 9.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000011', 'Over 9.5', 1.80, 1),
  ('d2000000-0000-0000-0000-000000000011', 'Under 9.5', 2.00, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d2000000-0000-0000-0000-000000000012', 'R3 Match 3: Ando/McNaughton Total Holes Won', 'r3-m3-ah-total', 'match_play', 'over_under', 4.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d2000000-0000-0000-0000-000000000012', 'Over 4.5', 1.95, 1),
  ('d2000000-0000-0000-0000-000000000012', 'Under 4.5', 1.85, 2);


-- =============================================
-- ROUND 4 - 1v1 MATCH PLAY (Barnbougle Dunes, Sun)
-- =============================================

-- Hugo (12) vs Jackson (12) - Dead even
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d3000000-0000-0000-0000-000000000001', 'R4: Hugo vs Jackson', 'r4-hugo-jacko-h2h', 'match_play', 'winner', 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000001', 'Hugo', 1.90, 1),
  ('d3000000-0000-0000-0000-000000000001', 'Jackson', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000002', 'R4: Hugo vs Jackson Margin', 'r4-hugo-jacko-margin', 'match_play', 'over_under', 1.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000002', 'Over 1.5 holes', 1.80, 1),
  ('d3000000-0000-0000-0000-000000000002', 'Under 1.5 holes', 2.00, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000003', 'R4: Hugo Total Holes Won', 'r4-hugo-total', 'match_play', 'over_under', 8.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000003', 'Over 8.5', 1.90, 1),
  ('d3000000-0000-0000-0000-000000000003', 'Under 8.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000004', 'R4: Jackson Total Holes Won', 'r4-jacko-total', 'match_play', 'over_under', 8.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000004', 'Over 8.5', 1.90, 1),
  ('d3000000-0000-0000-0000-000000000004', 'Under 8.5', 1.90, 2);

-- Lewis (6) vs Bails (14) - Lewis class, clear favourite
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d3000000-0000-0000-0000-000000000005', 'R4: Lewis vs Bails', 'r4-lewis-bails-h2h', 'match_play', 'winner', 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000005', 'Lewis', 1.65, 1),
  ('d3000000-0000-0000-0000-000000000005', 'Bails', 2.25, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000006', 'R4: Lewis vs Bails Margin', 'r4-lewis-bails-margin', 'match_play', 'over_under', 2.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000006', 'Over 2.5 holes', 1.85, 1),
  ('d3000000-0000-0000-0000-000000000006', 'Under 2.5 holes', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000007', 'R4: Lewis Total Holes Won', 'r4-lewis-total', 'match_play', 'over_under', 10.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000007', 'Over 10.5', 1.95, 1),
  ('d3000000-0000-0000-0000-000000000007', 'Under 10.5', 1.85, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000008', 'R4: Bails Total Holes Won', 'r4-bails-total', 'match_play', 'over_under', 7.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000008', 'Over 7.5', 1.90, 1),
  ('d3000000-0000-0000-0000-000000000008', 'Under 7.5', 1.90, 2);

-- Finn (15) vs Jacob (10) - Jacob gets the edge
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d3000000-0000-0000-0000-000000000009', 'R4: Finn vs Jacob', 'r4-finn-jacob-h2h', 'match_play', 'winner', 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000009', 'Jacob', 1.75, 1),
  ('d3000000-0000-0000-0000-000000000009', 'Finn', 2.10, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000010', 'R4: Finn vs Jacob Margin', 'r4-finn-jacob-margin', 'match_play', 'over_under', 2.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000010', 'Over 2.5 holes', 1.90, 1),
  ('d3000000-0000-0000-0000-000000000010', 'Under 2.5 holes', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000011', 'R4: Jacob Total Holes Won', 'r4-jacob-total', 'match_play', 'over_under', 10.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000011', 'Over 10.5', 1.90, 1),
  ('d3000000-0000-0000-0000-000000000011', 'Under 10.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000012', 'R4: Finn Total Holes Won', 'r4-finn-total', 'match_play', 'over_under', 7.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000012', 'Over 7.5', 1.90, 1),
  ('d3000000-0000-0000-0000-000000000012', 'Under 7.5', 1.90, 2);

-- Ando (15) vs Daniel (20) - Ando slight fav, Daniel gets shots
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d3000000-0000-0000-0000-000000000013', 'R4: Ando vs Daniel', 'r4-ando-daniel-h2h', 'match_play', 'winner', 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000013', 'Ando', 1.80, 1),
  ('d3000000-0000-0000-0000-000000000013', 'Daniel', 2.00, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000014', 'R4: Ando vs Daniel Margin', 'r4-ando-daniel-margin', 'match_play', 'over_under', 1.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000014', 'Over 1.5 holes', 1.80, 1),
  ('d3000000-0000-0000-0000-000000000014', 'Under 1.5 holes', 2.00, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000015', 'R4: Ando Total Holes Won', 'r4-ando-total', 'match_play', 'over_under', 9.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000015', 'Over 9.5', 1.90, 1),
  ('d3000000-0000-0000-0000-000000000015', 'Under 9.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000016', 'R4: Daniel Total Holes Won', 'r4-daniel-total', 'match_play', 'over_under', 8.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000016', 'Over 8.5', 1.95, 1),
  ('d3000000-0000-0000-0000-000000000016', 'Under 8.5', 1.85, 2);

-- Brad (15) vs Parker (22) - Brad favoured, Parker gets shots
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d3000000-0000-0000-0000-000000000017', 'R4: Brad vs Parker', 'r4-brad-parker-h2h', 'match_play', 'winner', 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000017', 'Brad', 1.75, 1),
  ('d3000000-0000-0000-0000-000000000017', 'Parker', 2.10, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000018', 'R4: Brad vs Parker Margin', 'r4-brad-parker-margin', 'match_play', 'over_under', 2.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000018', 'Over 2.5 holes', 1.85, 1),
  ('d3000000-0000-0000-0000-000000000018', 'Under 2.5 holes', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000019', 'R4: Brad Total Holes Won', 'r4-brad-total', 'match_play', 'over_under', 10.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000019', 'Over 10.5', 1.90, 1),
  ('d3000000-0000-0000-0000-000000000019', 'Under 10.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000020', 'R4: Parker Total Holes Won', 'r4-parker-total', 'match_play', 'over_under', 7.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000020', 'Over 7.5', 1.95, 1),
  ('d3000000-0000-0000-0000-000000000020', 'Under 7.5', 1.85, 2);

-- McNaughton (18) vs General (15) - General slight edge
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('d3000000-0000-0000-0000-000000000021', 'R4: McNaughton vs General', 'r4-horny-general-h2h', 'match_play', 'winner', 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000021', 'General', 1.80, 1),
  ('d3000000-0000-0000-0000-000000000021', 'McNaughton', 2.00, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000022', 'R4: McNaughton vs General Margin', 'r4-horny-general-margin', 'match_play', 'over_under', 1.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000022', 'Over 1.5 holes', 1.80, 1),
  ('d3000000-0000-0000-0000-000000000022', 'Under 1.5 holes', 2.00, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000023', 'R4: General Total Holes Won', 'r4-general-total', 'match_play', 'over_under', 9.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000023', 'Over 9.5', 1.90, 1),
  ('d3000000-0000-0000-0000-000000000023', 'Under 9.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d3000000-0000-0000-0000-000000000024', 'R4: McNaughton Total Holes Won', 'r4-horny-total', 'match_play', 'over_under', 8.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d3000000-0000-0000-0000-000000000024', 'Over 8.5', 1.95, 1),
  ('d3000000-0000-0000-0000-000000000024', 'Under 8.5', 1.85, 2);
