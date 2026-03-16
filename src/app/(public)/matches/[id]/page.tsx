import { createServerSupabase } from '@/lib/supabase/server';
import { MATCHES } from '@/lib/matches';
import { notFound } from 'next/navigation';
import { MatchHubClient } from './match-hub-client';
import { Market, MarketSelection } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function MatchHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = MATCHES.find((m) => m.id === id);
  if (!match) notFound();

  const supabase = await createServerSupabase();

  const slugs = Object.values(match.marketSlugs);
  const { data: markets } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .in('slug', slugs);

  const marketMap: Record<string, Market & { selections: MarketSelection[] }> = {};
  (markets || []).forEach((m) => {
    marketMap[m.slug] = m as Market & { selections: MarketSelection[] };
  });

  return <MatchHubClient match={match} markets={marketMap} />;
}
