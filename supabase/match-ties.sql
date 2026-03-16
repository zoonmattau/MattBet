-- =============================================
-- Add Tie/Halved option to all H2H match markets
-- Run this in Supabase SQL Editor
-- =============================================

-- Round 2
insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 9.00, 3 from public.markets where slug = 'r2-m1-h2h';

insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 11.00, 3 from public.markets where slug = 'r2-m2-h2h';

insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 11.00, 3 from public.markets where slug = 'r2-m3-h2h';

-- Round 3
insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 11.00, 3 from public.markets where slug = 'r3-m1-h2h';

insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 9.00, 3 from public.markets where slug = 'r3-m2-h2h';

insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 11.00, 3 from public.markets where slug = 'r3-m3-h2h';

-- Round 4
insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 8.00, 3 from public.markets where slug = 'r4-hugo-jacko-h2h';

insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 11.00, 3 from public.markets where slug = 'r4-lewis-bails-h2h';

insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 11.00, 3 from public.markets where slug = 'r4-finn-jacob-h2h';

insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 9.00, 3 from public.markets where slug = 'r4-ando-daniel-h2h';

insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 11.00, 3 from public.markets where slug = 'r4-brad-parker-h2h';

insert into public.market_selections (market_id, name, odds_decimal, sort_order)
select id, 'Halved', 9.00, 3 from public.markets where slug = 'r4-horny-general-h2h';
