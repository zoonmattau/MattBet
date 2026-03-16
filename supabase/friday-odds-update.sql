-- =============================================
-- Friday Odds Recalculation
-- Based on: Lewis $4, Finn $5, Jacob $5.50, Jackson $8.50, Bails $9,
-- Hugo $10, Ando $10, Brad $11, McNaughton $15, Daniel $18, Watto $21, Parker $26
-- =============================================

-- === STABLEFORD WINNER ===
UPDATE public.market_selections SET odds_decimal = 4.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 5.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 5.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 8.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 9.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 10.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 10.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 11.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 15.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 18.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 21.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Watto';
UPDATE public.market_selections SET odds_decimal = 26.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Parker';

-- === FRIDAY TOP 3 (shorter odds, ~60-70% of winner implied prob) ===
UPDATE public.market_selections SET odds_decimal = 1.45 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 1.60 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 1.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 2.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 2.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 3.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 3.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 3.25 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 4.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 5.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 6.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Watto';
UPDATE public.market_selections SET odds_decimal = 8.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-3') AND name = 'Parker';

-- === FRIDAY TOP 4 ===
UPDATE public.market_selections SET odds_decimal = 1.30 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 1.45 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 1.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 2.10 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 2.25 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 2.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 2.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 2.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 3.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 4.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 5.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Watto';
UPDATE public.market_selections SET odds_decimal = 6.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-4') AND name = 'Parker';

-- === FRIDAY TOP HALF (1st-6th) ===
UPDATE public.market_selections SET odds_decimal = 1.15 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 1.25 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 1.30 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 1.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 1.80 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 2.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 2.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 3.25 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 3.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Watto';
UPDATE public.market_selections SET odds_decimal = 4.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-top-half') AND name = 'Parker';

-- === FRIDAY BOTTOM HALF (7th-12th) ===
UPDATE public.market_selections SET odds_decimal = 5.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 4.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 4.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 2.25 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 2.10 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 2.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 2.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 1.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 1.35 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 1.25 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Watto';
UPDATE public.market_selections SET odds_decimal = 1.15 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-half') AND name = 'Parker';

-- === FRIDAY BOTTOM 4 ===
UPDATE public.market_selections SET odds_decimal = 8.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 7.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 6.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 3.25 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 3.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 2.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 2.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 2.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 1.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 1.45 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 1.30 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Watto';
UPDATE public.market_selections SET odds_decimal = 1.20 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-bottom-4') AND name = 'Parker';

-- === FRIDAY LAST PLACE ===
UPDATE public.market_selections SET odds_decimal = 34.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 29.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 26.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 13.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 12.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 11.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 11.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 10.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 5.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 4.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 3.25 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Watto';
UPDATE public.market_selections SET odds_decimal = 2.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-last-place') AND name = 'Parker';

-- === FRIDAY BEST TEAM ===
UPDATE public.market_selections SET odds_decimal = 2.25 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-best-team') AND name = 'Group 3';
UPDATE public.market_selections SET odds_decimal = 2.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-best-team') AND name = 'Group 2';
UPDATE public.market_selections SET odds_decimal = 3.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-best-team') AND name = 'Group 1';

-- === FRIDAY BEST OF GROUP ===
UPDATE public.market_selections SET odds_decimal = 1.80 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-best-of-group') AND name = 'Group 3 top scorer';
UPDATE public.market_selections SET odds_decimal = 2.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-best-of-group') AND name = 'Group 2 top scorer';
UPDATE public.market_selections SET odds_decimal = 3.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-best-of-group') AND name = 'Group 1 top scorer';
