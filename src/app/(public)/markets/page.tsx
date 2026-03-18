import { createServerSupabase } from '@/lib/supabase/server';
import { getMatches } from '@/lib/matches-server';
import { Market, MarketSelection } from '@/lib/types';
import { MarketsClient } from './markets-client';

export const dynamic = 'force-dynamic';

export default async function MarketsPage() {
  const supabase = await createServerSupabase();
  const matches = await getMatches();

  const { data: markets } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .order('title');

  return (
    <MarketsClient
      matches={matches}
      markets={(markets as (Market & { selections: MarketSelection[] })[]) || []}
    />
  );
}
