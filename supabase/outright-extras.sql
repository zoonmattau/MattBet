-- =============================================
-- Additional Outright Markets
-- Run this in Supabase SQL Editor
-- =============================================

-- Hole in One on the Trip
insert into public.markets (id, title, slug, category, market_type, status) values
  ('f1000000-0000-0000-0000-000000000001', 'Will There Be a Hole in One?', 'trip-hole-in-one', 'outrights', 'yes_no', 'open');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f1000000-0000-0000-0000-000000000001', 'Yes (excl. short course)', 101.00, 1),
  ('f1000000-0000-0000-0000-000000000001', 'Yes (incl. short course)', 21.00, 2),
  ('f1000000-0000-0000-0000-000000000001', 'No', 1.01, 3);

-- Overall Top 3 Finish
insert into public.markets (id, title, slug, category, market_type, status) values
  ('f1000000-0000-0000-0000-000000000002', 'Overall Top 3 Finish', 'overall-top-3', 'outrights', 'top_n', 'open');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f1000000-0000-0000-0000-000000000002', 'Lewis', 1.55, 1),
  ('f1000000-0000-0000-0000-000000000002', 'Jacob', 1.75, 2),
  ('f1000000-0000-0000-0000-000000000002', 'Hugo', 2.25, 3),
  ('f1000000-0000-0000-0000-000000000002', 'Jackson', 2.25, 4),
  ('f1000000-0000-0000-0000-000000000002', 'Bails', 2.75, 5),
  ('f1000000-0000-0000-0000-000000000002', 'Finn', 3.50, 6),
  ('f1000000-0000-0000-0000-000000000002', 'Ando', 3.50, 7),
  ('f1000000-0000-0000-0000-000000000002', 'Brad', 3.50, 8),
  ('f1000000-0000-0000-0000-000000000002', 'General', 3.50, 9),
  ('f1000000-0000-0000-0000-000000000002', 'McNaughton', 5.00, 10),
  ('f1000000-0000-0000-0000-000000000002', 'Daniel', 5.00, 11),
  ('f1000000-0000-0000-0000-000000000002', 'Parker', 6.50, 12);

-- Overall Bottom 3 Finish
insert into public.markets (id, title, slug, category, market_type, status) values
  ('f1000000-0000-0000-0000-000000000003', 'Overall Bottom 3 Finish', 'overall-bottom-3', 'outrights', 'top_n', 'open');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f1000000-0000-0000-0000-000000000003', 'Parker', 1.60, 1),
  ('f1000000-0000-0000-0000-000000000003', 'Daniel', 1.75, 2),
  ('f1000000-0000-0000-0000-000000000003', 'McNaughton', 2.10, 3),
  ('f1000000-0000-0000-0000-000000000003', 'General', 3.00, 4),
  ('f1000000-0000-0000-0000-000000000003', 'Brad', 3.00, 5),
  ('f1000000-0000-0000-0000-000000000003', 'Finn', 3.00, 6),
  ('f1000000-0000-0000-0000-000000000003', 'Ando', 3.00, 7),
  ('f1000000-0000-0000-0000-000000000003', 'Bails', 3.75, 8),
  ('f1000000-0000-0000-0000-000000000003', 'Jackson', 4.50, 9),
  ('f1000000-0000-0000-0000-000000000003', 'Hugo', 4.50, 10),
  ('f1000000-0000-0000-0000-000000000003', 'Jacob', 7.00, 11),
  ('f1000000-0000-0000-0000-000000000003', 'Lewis', 9.00, 12);
