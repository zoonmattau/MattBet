-- =============================================
-- Updated team points O/Us and individual player total points O/Us
-- Run this in Supabase SQL Editor
-- =============================================

-- With new scoring: R1 max 6pts, R2/R3 win 6+bonus, R4 win 4+bonus
-- Realistic individual totals range ~5-20pts across the trip

-- === INDIVIDUAL PLAYER TOTAL POINTS O/Us ===

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000001', 'Lewis Total Trip Points', 'lewis-total-pts', 'outrights', 'over_under', 16.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000001', 'Over 16.5', 1.85, 1),
  ('f3000000-0000-0000-0000-000000000001', 'Under 16.5', 1.95, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000002', 'Jacob Total Trip Points', 'jacob-total-pts', 'outrights', 'over_under', 16.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000002', 'Over 16.5', 1.90, 1),
  ('f3000000-0000-0000-0000-000000000002', 'Under 16.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000003', 'Finn Total Trip Points', 'finn-total-pts', 'outrights', 'over_under', 15.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000003', 'Over 15.5', 1.90, 1),
  ('f3000000-0000-0000-0000-000000000003', 'Under 15.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000004', 'Bails Total Trip Points', 'bails-total-pts', 'outrights', 'over_under', 12.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000004', 'Over 12.5', 1.90, 1),
  ('f3000000-0000-0000-0000-000000000004', 'Under 12.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000005', 'Jackson Total Trip Points', 'jackson-total-pts', 'outrights', 'over_under', 12.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000005', 'Over 12.5', 1.90, 1),
  ('f3000000-0000-0000-0000-000000000005', 'Under 12.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000006', 'Brad Total Trip Points', 'brad-total-pts', 'outrights', 'over_under', 11.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000006', 'Over 11.5', 1.90, 1),
  ('f3000000-0000-0000-0000-000000000006', 'Under 11.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000007', 'Ando Total Trip Points', 'ando-total-pts', 'outrights', 'over_under', 11.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000007', 'Over 11.5', 1.90, 1),
  ('f3000000-0000-0000-0000-000000000007', 'Under 11.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000008', 'Hugo Total Trip Points', 'hugo-total-pts', 'outrights', 'over_under', 11.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000008', 'Over 11.5', 1.90, 1),
  ('f3000000-0000-0000-0000-000000000008', 'Under 11.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000009', 'McNaughton Total Trip Points', 'mcnaughton-total-pts', 'outrights', 'over_under', 9.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000009', 'Over 9.5', 1.90, 1),
  ('f3000000-0000-0000-0000-000000000009', 'Under 9.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000010', 'Daniel Total Trip Points', 'daniel-total-pts', 'outrights', 'over_under', 8.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000010', 'Over 8.5', 1.90, 1),
  ('f3000000-0000-0000-0000-000000000010', 'Under 8.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000011', 'Watto Total Trip Points', 'watto-total-pts', 'outrights', 'over_under', 7.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000011', 'Over 7.5', 1.90, 1),
  ('f3000000-0000-0000-0000-000000000011', 'Under 7.5', 1.90, 2);

insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f3000000-0000-0000-0000-000000000012', 'Parker Total Trip Points', 'parker-total-pts', 'outrights', 'over_under', 7.5, 'open');
insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f3000000-0000-0000-0000-000000000012', 'Over 7.5', 1.95, 1),
  ('f3000000-0000-0000-0000-000000000012', 'Under 7.5', 1.85, 2);

-- === UPDATE GROUP TOTAL POINTS LINES (new scoring structure) ===
-- R1: max 6+5+4+3=18 for best team, R2: max ~8+8=16, R3: same, R4: max ~5+5=10
-- Realistic team totals: 30-50 range

UPDATE public.markets SET line_value = 33.5 WHERE slug = 'group-1-total-points';
UPDATE public.markets SET line_value = 37.5 WHERE slug = 'group-2-total-points';
UPDATE public.markets SET line_value = 35.5 WHERE slug = 'group-3-total-points';

-- === ADD ALL NAMES TO WOODEN SPOON ===
-- First delete existing and re-insert with all 12 players
DELETE FROM public.market_selections WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'wooden-spoon');

INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Parker', 2.75, 1 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Watto', 3.25, 2 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Daniel', 4.00, 3 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'McNaughton', 6.00, 4 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Brad', 12.00, 5 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Ando', 12.00, 6 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Hugo', 12.00, 7 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Bails', 15.00, 8 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Jackson', 15.00, 9 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Finn', 26.00, 10 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Jacob', 29.00, 11 FROM public.markets WHERE slug = 'wooden-spoon';
INSERT INTO public.market_selections (market_id, name, odds_decimal, sort_order)
SELECT id, 'Lewis', 34.00, 12 FROM public.markets WHERE slug = 'wooden-spoon';
