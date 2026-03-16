import { createServerSupabase } from '@/lib/supabase/server';
import { Market, MarketSelection } from '@/lib/types';
import { MarketsClient } from './markets-client';

export const dynamic = 'force-dynamic';

export default async function MarketsPage() {
  const supabase = await createServerSupabase();

  const { data: markets } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .order('title');

  return (
    <MarketsClient
      markets={(markets as (Market & { selections: MarketSelection[] })[]) || []}
    />
  );
}
