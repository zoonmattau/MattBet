-- =============================================
-- Recalculated Odds (updated handicaps)
-- Run this in Supabase SQL Editor
-- =============================================

-- === TRIP CHAMPION ===
UPDATE public.market_selections SET odds_decimal = 4.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 5.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 5.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 9.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 9.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 10.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 10.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 10.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 15.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 18.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 21.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'General';
UPDATE public.market_selections SET odds_decimal = 23.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'trip-champion') AND name = 'Parker';

-- === WINNING TEAM (Group 2 now fav with Finn at 10) ===
UPDATE public.market_selections SET odds_decimal = 2.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'winning-team') AND name = 'Group 2';
UPDATE public.market_selections SET odds_decimal = 3.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'winning-team') AND name = 'Group 3';
UPDATE public.market_selections SET odds_decimal = 3.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'winning-team') AND name = 'Group 1';

-- === FRIDAY STABLEFORD WINNER ===
UPDATE public.market_selections SET odds_decimal = 5.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 6.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 6.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Finn';
UPDATE public.market_selections SET odds_decimal = 10.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Bails';
UPDATE public.market_selections SET odds_decimal = 10.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Jackson';
UPDATE public.market_selections SET odds_decimal = 12.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 12.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 12.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 17.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 21.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 26.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'General';
UPDATE public.market_selections SET odds_decimal = 29.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-stableford-winner') AND name = 'Parker';

-- === R2 H2H (Jackson/Finn now favs over Hugo/Bails) ===
UPDATE public.market_selections SET odds_decimal = 2.10 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r2-m1-h2h') AND name = 'Hugo and Bails';
UPDATE public.market_selections SET odds_decimal = 1.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r2-m1-h2h') AND name = 'Jackson and Finn';

-- Lewis/Jacob vs Ando/McNaughton unchanged (Lewis/Jacob still clear favs)
UPDATE public.market_selections SET odds_decimal = 1.55 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r2-m2-h2h') AND name = 'Lewis and Jacob';
UPDATE public.market_selections SET odds_decimal = 2.40 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r2-m2-h2h') AND name = 'Ando and McNaughton';

-- Brad/General vs Daniel/Parker (closer now, General is 21)
UPDATE public.market_selections SET odds_decimal = 1.85 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r2-m3-h2h') AND name = 'Brad and General';
UPDATE public.market_selections SET odds_decimal = 1.95 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r2-m3-h2h') AND name = 'Daniel and Parker';

-- === R3 H2H ===
-- Hugo/Bails vs Daniel/Parker (Hugo/Bails still favs)
UPDATE public.market_selections SET odds_decimal = 1.60 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r3-m1-h2h') AND name = 'Hugo and Bails';
UPDATE public.market_selections SET odds_decimal = 2.30 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r3-m1-h2h') AND name = 'Daniel and Parker';

-- Jackson/Finn vs Brad/General (Jackson/Finn now clear favs)
UPDATE public.market_selections SET odds_decimal = 1.55 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r3-m2-h2h') AND name = 'Jackson and Finn';
UPDATE public.market_selections SET odds_decimal = 2.40 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r3-m2-h2h') AND name = 'Brad and General';

-- Lewis/Jacob vs Ando/McNaughton
UPDATE public.market_selections SET odds_decimal = 1.45 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r3-m3-h2h') AND name = 'Lewis and Jacob';
UPDATE public.market_selections SET odds_decimal = 2.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r3-m3-h2h') AND name = 'Ando and McNaughton';

-- === R4 H2H ===
-- Hugo(15) vs Jackson(14) - Jackson now slight fav
UPDATE public.market_selections SET odds_decimal = 2.05 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-hugo-jacko-h2h') AND name = 'Hugo';
UPDATE public.market_selections SET odds_decimal = 1.85 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-hugo-jacko-h2h') AND name = 'Jackson';

-- Lewis(9) vs Bails(14) - Lewis clear fav
UPDATE public.market_selections SET odds_decimal = 1.55 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-lewis-bails-h2h') AND name = 'Lewis';
UPDATE public.market_selections SET odds_decimal = 2.40 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-lewis-bails-h2h') AND name = 'Bails';

-- Finn(10) vs Jacob(10) - dead even
UPDATE public.market_selections SET odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-finn-jacob-h2h') AND name = 'Jacob';
UPDATE public.market_selections SET odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-finn-jacob-h2h') AND name = 'Finn';

-- Ando(15) vs Daniel(20) - Ando fav
UPDATE public.market_selections SET odds_decimal = 1.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-ando-daniel-h2h') AND name = 'Ando';
UPDATE public.market_selections SET odds_decimal = 2.15 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-ando-daniel-h2h') AND name = 'Daniel';

-- Brad(15) vs Parker(22) - Brad fav
UPDATE public.market_selections SET odds_decimal = 1.60 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-brad-parker-h2h') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 2.30 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-brad-parker-h2h') AND name = 'Parker';

-- General(21) vs McNaughton(18) - McNaughton now fav!
UPDATE public.market_selections SET odds_decimal = 2.15 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-horny-general-h2h') AND name = 'General';
UPDATE public.market_selections SET odds_decimal = 1.70 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-horny-general-h2h') AND name = 'McNaughton';

-- === R2 LINES (update favourites) ===
UPDATE public.market_selections SET name = 'Jackson/Finn -1.5', odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r2-m1-line') AND sort_order = 1;
UPDATE public.market_selections SET name = 'Hugo/Bails +1.5', odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r2-m1-line') AND sort_order = 2;

-- === R4 LINES ===
UPDATE public.market_selections SET name = 'Jackson -1.5', odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-hugo-jacko-line') AND sort_order = 1;
UPDATE public.market_selections SET name = 'Hugo +1.5', odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-hugo-jacko-line') AND sort_order = 2;

UPDATE public.market_selections SET name = 'McNaughton -1.5', odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-horny-general-line') AND sort_order = 1;
UPDATE public.market_selections SET name = 'General +1.5', odds_decimal = 1.90 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'r4-horny-general-line') AND sort_order = 2;

-- === WOODEN SPOON (General now more likely) ===
UPDATE public.market_selections SET odds_decimal = 3.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'wooden-spoon') AND name = 'Parker';
UPDATE public.market_selections SET odds_decimal = 3.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'wooden-spoon') AND name = 'General';
UPDATE public.market_selections SET odds_decimal = 4.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'wooden-spoon') AND name = 'Daniel';
UPDATE public.market_selections SET odds_decimal = 6.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'wooden-spoon') AND name = 'McNaughton';
UPDATE public.market_selections SET odds_decimal = 10.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'wooden-spoon') AND name = 'Brad';
UPDATE public.market_selections SET odds_decimal = 4.00 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'wooden-spoon') AND name = 'Any Other';

-- === FRIDAY BEST TEAM (Group 2 now fav) ===
UPDATE public.market_selections SET odds_decimal = 2.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-best-team') AND name = 'Group 3';
UPDATE public.market_selections SET odds_decimal = 2.75 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-best-team') AND name = 'Group 2';
UPDATE public.market_selections SET odds_decimal = 3.50 WHERE market_id = (SELECT id FROM public.markets WHERE slug = 'friday-best-team') AND name = 'Group 1';

-- === GROUP TOTAL TRIP POINTS (adjusted) ===
UPDATE public.markets SET line_value = 26.5 WHERE slug = 'group-1-total-points';
UPDATE public.markets SET line_value = 29.5 WHERE slug = 'group-2-total-points';
UPDATE public.markets SET line_value = 28.5 WHERE slug = 'group-3-total-points';
