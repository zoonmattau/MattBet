import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MarketDetailAdmin } from './market-detail-admin';

export const dynamic = 'force-dynamic';

export default async function AdminMarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: market } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .eq('id', id)
    .single();

  if (!market) notFound();

  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .eq('market_id', id);

  return <MarketDetailAdmin market={market} bets={bets || []} />;
}
