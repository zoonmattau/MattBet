import { createServerSupabase } from '@/lib/supabase/server';
import { Market, MarketSelection, Bet } from '@/lib/types';
import { ExposureClient } from './exposure-client';

export const dynamic = 'force-dynamic';

export default async function AdminExposurePage() {
  const supabase = await createServerSupabase();

  const { data: markets } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .order('created_at');

  const { data: bets } = await supabase.from('bets').select('*');

  return (
    <ExposureClient
      markets={(markets || []) as (Market & { selections: MarketSelection[] })[]}
      bets={(bets || []) as Bet[]}
    />
  );
}
