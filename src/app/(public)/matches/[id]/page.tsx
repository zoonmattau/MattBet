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

  // Fetch this match's markets
  const slugs = Object.values(match.marketSlugs);
  const { data: markets } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .in('slug', slugs);

  const marketMap: Record<string, Market & { selections: MarketSelection[] }> = {};
  (markets || []).forEach((m) => {
    marketMap[m.slug] = m as Market & { selections: MarketSelection[] };
  });

  // Fetch all H2H markets for the scroll bar odds
  const allH2HSlugs = MATCHES.map((m) => m.marketSlugs.h2h);
  const { data: allH2H } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .in('slug', allH2HSlugs);

  const h2hMap: Record<string, Market & { selections: MarketSelection[] }> = {};
  (allH2H || []).forEach((m) => {
    h2hMap[m.slug] = m as Market & { selections: MarketSelection[] };
  });

  // Fetch Friday stableford winner for scroll bar
  const { data: fridayWinner } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .eq('slug', 'friday-stableford-winner')
    .single();

  return <MatchHubClient match={match} markets={marketMap} allH2H={h2hMap} fridayWinner={fridayWinner as (Market & { selections: MarketSelection[] }) | null} />;
}
