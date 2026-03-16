-- =============================================
-- Friday Top Half / Bottom Half at 700% overround
-- =============================================

-- === TOP HALF (1st-6th) - 700% overround ===
UPDATE public.market_selections SET odds_decimal = 1.05 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 1.10 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 1.15 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 1.55 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 1.60 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 1.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 1.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 1.80 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 2.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 2.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 3.35 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Watto';
UPDATE public.market_selections SET odds_decimal = 4.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Parker';

-- === BOTTOM HALF (7th-12th) - 700% overround ===
UPDATE public.market_selections SET odds_decimal = 5.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 3.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 3.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 1.80 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 1.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 1.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 1.65 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 1.30 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 1.20 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 1.15 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Watto';
UPDATE public.market_selections SET odds_decimal = 1.05 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Parker';
