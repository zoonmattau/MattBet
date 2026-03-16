-- =============================================
-- Spread/Line Markets for Each Match
-- Run this in Supabase SQL Editor
-- =============================================

-- Round 2
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000001', 'R2 M1: Hugo/Bails -1.5 Line', 'r2-m1-line', 'match_play', 'over_under', 1.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000001', 'Hugo/Bails -1.5', 1.90, 1),
  ('d4000000-0000-0000-0000-000000000001', 'Jackson/Finn +1.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000002', 'R2 M2: Lewis/Jacob -2.5 Line', 'r2-m2-line', 'match_play', 'over_under', 2.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000002', 'Lewis/Jacob -2.5', 1.85, 1),
  ('d4000000-0000-0000-0000-000000000002', 'Ando/McNaughton +2.5', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000003', 'R2 M3: Brad/General -2.5 Line', 'r2-m3-line', 'match_play', 'over_under', 2.5, 'open', 'Saturday AM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000003', 'Brad/General -2.5', 1.85, 1),
  ('d4000000-0000-0000-0000-000000000003', 'Daniel/Parker +2.5', 1.95, 2);

-- Round 3
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000004', 'R3 M1: Hugo/Bails -3.5 Line', 'r3-m1-line', 'match_play', 'over_under', 3.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000004', 'Hugo/Bails -3.5', 1.90, 1),
  ('d4000000-0000-0000-0000-000000000004', 'Daniel/Parker +3.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000005', 'R3 M2: Jackson/Finn -1.5 Line', 'r3-m2-line', 'match_play', 'over_under', 1.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000005', 'Jackson/Finn -1.5', 1.85, 1),
  ('d4000000-0000-0000-0000-000000000005', 'Brad/General +1.5', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000006', 'R3 M3: Lewis/Jacob -3.5 Line', 'r3-m3-line', 'match_play', 'over_under', 3.5, 'open', 'Saturday PM');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000006', 'Lewis/Jacob -3.5', 1.85, 1),
  ('d4000000-0000-0000-0000-000000000006', 'Ando/McNaughton +3.5', 1.95, 2);

-- Round 4
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000007', 'R4: Hugo vs Jackson Line', 'r4-hugo-jacko-line', 'match_play', 'over_under', 1.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000007', 'Hugo -1.5', 2.10, 1),
  ('d4000000-0000-0000-0000-000000000007', 'Jackson +1.5', 1.75, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000008', 'R4: Lewis vs Bails Line', 'r4-lewis-bails-line', 'match_play', 'over_under', 2.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000008', 'Lewis -2.5', 1.85, 1),
  ('d4000000-0000-0000-0000-000000000008', 'Bails +2.5', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000009', 'R4: Jacob vs Finn Line', 'r4-finn-jacob-line', 'match_play', 'over_under', 2.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000009', 'Jacob -2.5', 1.90, 1),
  ('d4000000-0000-0000-0000-000000000009', 'Finn +2.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000010', 'R4: Ando vs Daniel Line', 'r4-ando-daniel-line', 'match_play', 'over_under', 1.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000010', 'Ando -1.5', 1.90, 1),
  ('d4000000-0000-0000-0000-000000000010', 'Daniel +1.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000011', 'R4: Brad vs Parker Line', 'r4-brad-parker-line', 'match_play', 'over_under', 2.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000011', 'Brad -2.5', 1.85, 1),
  ('d4000000-0000-0000-0000-000000000011', 'Parker +2.5', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('d4000000-0000-0000-0000-000000000012', 'R4: General vs McNaughton Line', 'r4-horny-general-line', 'match_play', 'over_under', 1.5, 'open', 'Sunday');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('d4000000-0000-0000-0000-000000000012', 'General -1.5', 1.90, 1),
  ('d4000000-0000-0000-0000-000000000012', 'McNaughton +1.5', 1.90, 2);
