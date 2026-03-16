-- =============================================
-- Friday Top Half / Bottom Half Markets
-- Run this in Supabase SQL Editor
-- =============================================

-- Top Half Finish (1st-6th)
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e3000000-0000-0000-0000-000000000001', 'Friday Top Half Finish (1st-6th)', 'friday-top-half', 'stableford', 'top_n', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e3000000-0000-0000-0000-000000000001', 'Lewis', 1.30, 1),
  ('e3000000-0000-0000-0000-000000000001', 'Jacob', 1.45, 2),
  ('e3000000-0000-0000-0000-000000000001', 'Hugo', 1.70, 3),
  ('e3000000-0000-0000-0000-000000000001', 'Jackson', 1.70, 4),
  ('e3000000-0000-0000-0000-000000000001', 'Bails', 2.00, 5),
  ('e3000000-0000-0000-0000-000000000001', 'Finn', 2.50, 6),
  ('e3000000-0000-0000-0000-000000000001', 'Ando', 2.50, 7),
  ('e3000000-0000-0000-0000-000000000001', 'Brad', 2.50, 8),
  ('e3000000-0000-0000-0000-000000000001', 'General', 2.50, 9),
  ('e3000000-0000-0000-0000-000000000001', 'McNaughton', 3.50, 10),
  ('e3000000-0000-0000-0000-000000000001', 'Daniel', 3.50, 11),
  ('e3000000-0000-0000-0000-000000000001', 'Parker', 4.50, 12);

-- Bottom Half Finish (7th-12th)
insert into public.markets (id, title, slug, category, market_type, status, round_label) values
  ('e3000000-0000-0000-0000-000000000002', 'Friday Bottom Half Finish (7th-12th)', 'friday-bottom-half', 'stableford', 'top_n', 'open', 'Friday');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('e3000000-0000-0000-0000-000000000002', 'Parker', 1.35, 1),
  ('e3000000-0000-0000-0000-000000000002', 'Daniel', 1.50, 2),
  ('e3000000-0000-0000-0000-000000000002', 'McNaughton', 1.70, 3),
  ('e3000000-0000-0000-0000-000000000002', 'General', 2.25, 4),
  ('e3000000-0000-0000-0000-000000000002', 'Brad', 2.25, 5),
  ('e3000000-0000-0000-0000-000000000002', 'Finn', 2.25, 6),
  ('e3000000-0000-0000-0000-000000000002', 'Ando', 2.25, 7),
  ('e3000000-0000-0000-0000-000000000002', 'Bails', 3.00, 8),
  ('e3000000-0000-0000-0000-000000000002', 'Jackson', 3.50, 9),
  ('e3000000-0000-0000-0000-000000000002', 'Hugo', 3.50, 10),
  ('e3000000-0000-0000-0000-000000000002', 'Jacob', 5.50, 11),
  ('e3000000-0000-0000-0000-000000000002', 'Lewis', 7.00, 12);
