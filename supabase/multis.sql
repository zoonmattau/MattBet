-- =============================================
-- Multi/Accumulator Bet Support
-- Run this in Supabase SQL Editor
-- =============================================

-- Add multi fields to bets table
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS bet_type text NOT NULL DEFAULT 'single' CHECK (bet_type IN ('single', 'multi'));
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS multi_odds numeric(12,2);

-- Bet legs table for multi bets
CREATE TABLE IF NOT EXISTS public.bet_legs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bet_id uuid NOT NULL REFERENCES public.bets(id) ON DELETE CASCADE,
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  selection_id uuid NOT NULL REFERENCES public.market_selections(id) ON DELETE CASCADE,
  market_title text NOT NULL,
  selection_name text NOT NULL,
  odds_taken numeric(8,2) NOT NULL,
  result text DEFAULT 'pending' CHECK (result IN ('pending', 'won', 'lost', 'void')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bet_legs_bet ON public.bet_legs(bet_id);

-- RLS
ALTER TABLE public.bet_legs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bet_legs" ON public.bet_legs FOR SELECT USING (true);
CREATE POLICY "Public insert bet_legs" ON public.bet_legs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access bet_legs" ON public.bet_legs FOR ALL USING (auth.jwt() ->> 'email' = 'matthew.parker@live.com.au');
