-- =============================================
-- Trip Specials - Performance Markets
-- Run this in Supabase SQL Editor
-- =============================================

-- Lowest Gross Round (excl. short course)
insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f2000000-0000-0000-0000-000000000001', 'Lowest Gross Score of the Trip (excl. Bougle Run)', 'trip-lowest-gross', 'outrights', 'over_under', 78.5, 'open');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f2000000-0000-0000-0000-000000000001', 'Over 78.5', 1.95, 1),
  ('f2000000-0000-0000-0000-000000000001', 'Under 78.5', 1.85, 2);

-- Group 1 Total Trip Points Over/Under
insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f2000000-0000-0000-0000-000000000002', 'Group 1 Total Trip Points', 'group-1-total-points', 'outrights', 'over_under', 28.5, 'open');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f2000000-0000-0000-0000-000000000002', 'Over 28.5', 1.90, 1),
  ('f2000000-0000-0000-0000-000000000002', 'Under 28.5', 1.90, 2);

-- Group 2 Total Trip Points Over/Under
insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f2000000-0000-0000-0000-000000000003', 'Group 2 Total Trip Points', 'group-2-total-points', 'outrights', 'over_under', 27.5, 'open');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f2000000-0000-0000-0000-000000000003', 'Over 27.5', 1.90, 1),
  ('f2000000-0000-0000-0000-000000000003', 'Under 27.5', 1.90, 2);

-- Group 3 Total Trip Points Over/Under
insert into public.markets (id, title, slug, category, market_type, line_value, status) values
  ('f2000000-0000-0000-0000-000000000004', 'Group 3 Total Trip Points', 'group-3-total-points', 'outrights', 'over_under', 32.5, 'open');

insert into public.market_selections (market_id, name, odds_decimal, sort_order) values
  ('f2000000-0000-0000-0000-000000000004', 'Over 32.5', 1.85, 1),
  ('f2000000-0000-0000-0000-000000000004', 'Under 32.5', 1.95, 2);
