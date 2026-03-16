-- =============================================
-- Additional Friday Stableford Markets
-- Run this in Supabase SQL Editor
-- =============================================

-- Worst Friday Stableford Score Over/Under
insert into public.markets (id, title, slug, category, market_type, line_value, status, round_label) values
  ('e1000000-0000-0000-0000-000000000001', 'Lowest Friday Stableford Score', 'lowest-friday-score', 'score_totals', 'over_under', 18.5, 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e1000000-0000-0000-0000-000000000001', 'Over 18.5', 1.85, 1),
  ('e1000000-0000-0000-0000-000000000001', 'Under 18.5', 1.95, 2);

-- Top 4 Finish
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e1000000-0000-0000-0000-000000000002', 'Friday Top 4 Finish', 'friday-top-4', 'stableford', 'top_n', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e1000000-0000-0000-0000-000000000002', 'Lewis', 1.50, 1),
  ('e1000000-0000-0000-0000-000000000002', 'Jacob', 1.65, 2),
  ('e1000000-0000-0000-0000-000000000002', 'Hugo', 2.10, 3),
  ('e1000000-0000-0000-0000-000000000002', 'Jackson', 2.10, 4),
  ('e1000000-0000-0000-0000-000000000002', 'Bails', 2.50, 5),
  ('e1000000-0000-0000-0000-000000000002', 'Finn', 3.25, 6),
  ('e1000000-0000-0000-0000-000000000002', 'Ando', 3.25, 7),
  ('e1000000-0000-0000-0000-000000000002', 'Brad', 3.25, 8),
  ('e1000000-0000-0000-0000-000000000002', 'General', 3.25, 9),
  ('e1000000-0000-0000-0000-000000000002', 'McNaughton', 4.50, 10),
  ('e1000000-0000-0000-0000-000000000002', 'Daniel', 4.50, 11),
  ('e1000000-0000-0000-0000-000000000002', 'Parker', 5.50, 12);

-- Bottom 4 Finish
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e1000000-0000-0000-0000-000000000003', 'Friday Bottom 4 Finish', 'friday-bottom-4', 'stableford', 'top_n', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e1000000-0000-0000-0000-000000000003', 'Parker', 1.60, 1),
  ('e1000000-0000-0000-0000-000000000003', 'Daniel', 1.75, 2),
  ('e1000000-0000-0000-0000-000000000003', 'McNaughton', 2.00, 3),
  ('e1000000-0000-0000-0000-000000000003', 'General', 2.75, 4),
  ('e1000000-0000-0000-0000-000000000003', 'Brad', 2.75, 5),
  ('e1000000-0000-0000-0000-000000000003', 'Finn', 2.75, 6),
  ('e1000000-0000-0000-0000-000000000003', 'Ando', 2.75, 7),
  ('e1000000-0000-0000-0000-000000000003', 'Bails', 3.50, 8),
  ('e1000000-0000-0000-0000-000000000003', 'Jackson', 4.00, 9),
  ('e1000000-0000-0000-0000-000000000003', 'Hugo', 4.00, 10),
  ('e1000000-0000-0000-0000-000000000003', 'Jacob', 6.00, 11),
  ('e1000000-0000-0000-0000-000000000003', 'Lewis', 8.00, 12);

-- Last Place Finish (Dead Last)
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e1000000-0000-0000-0000-000000000004', 'Friday Last Place', 'friday-last-place', 'stableford', 'winner', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e1000000-0000-0000-0000-000000000004', 'Parker', 3.50, 1),
  ('e1000000-0000-0000-0000-000000000004', 'Daniel', 4.50, 2),
  ('e1000000-0000-0000-0000-000000000004', 'McNaughton', 5.50, 3),
  ('e1000000-0000-0000-0000-000000000004', 'General', 8.00, 4),
  ('e1000000-0000-0000-0000-000000000004', 'Brad', 8.00, 5),
  ('e1000000-0000-0000-0000-000000000004', 'Finn', 10.00, 6),
  ('e1000000-0000-0000-0000-000000000004', 'Ando', 10.00, 7),
  ('e1000000-0000-0000-0000-000000000004', 'Bails', 12.00, 8),
  ('e1000000-0000-0000-0000-000000000004', 'Jackson', 15.00, 9),
  ('e1000000-0000-0000-0000-000000000004', 'Hugo', 15.00, 10),
  ('e1000000-0000-0000-0000-000000000004', 'Jacob', 21.00, 11),
  ('e1000000-0000-0000-0000-000000000004', 'Lewis', 26.00, 12);
