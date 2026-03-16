import { createServerSupabase } from '@/lib/supabase/server';
import { MATCHES } from '@/lib/matches';
import { Market, MarketSelection } from '@/lib/types';
import { MatchesClient } from './matches-client';

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const supabase = await createServerSupabase();

  const h2hSlugs = MATCHES.map((m) => m.marketSlugs.h2h);
  const { data: markets } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .in('slug', h2hSlugs);

  const { data: stablefordMarkets } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .eq('category', 'stableford')
    .order('created_at');

  const marketMap: Record<string, Market & { selections: MarketSelection[] }> = {};
  (markets || []).forEach((m) => {
    marketMap[m.slug] = m as Market & { selections: MarketSelection[] };
  });

  return (
    <MatchesClient
      h2hMarkets={marketMap}
      stablefordMarkets={(stablefordMarkets as (Market & { selections: MarketSelection[] })[]) || []}
    />
  );
}
