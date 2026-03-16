-- Add review system for large bets
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS requires_review boolean DEFAULT false;
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'none' CHECK (review_status IN ('none', 'pending', 'approved', 'denied', 'partial'));
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS original_stake numeric(10,2);
