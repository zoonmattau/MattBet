import { createServerSupabase } from '@/lib/supabase/server';
import { MATCHES } from '@/lib/matches';
import { notFound } from 'next/navigation';
import { PlayerClient } from './player-client';

export const dynamic = 'force-dynamic';

export default async function PlayerPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const supabase = await createServerSupabase();

  // Fetch player (case-insensitive match)
  const { data: player } = await supabase
    .from('players')
    .select('*, team:teams(*)')
    .ilike('name', name)
    .single();

  if (!player) {
    notFound();
  }

  // Fetch all markets with selections
  const { data: allMarkets } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .order('title');

  // Filter markets where a selection name matches the player (case-insensitive)
  const playerMarkets = (allMarkets || []).filter((market) =>
    market.selections?.some((sel: { name: string }) =>
      sel.name.toLowerCase().includes(player.name.toLowerCase())
    )
  );

  // Fetch leaderboard entry
  const { data: leaderboardEntry } = await supabase
    .from('leaderboard_individual')
    .select('*')
    .ilike('player_name', player.name)
    .single();

  // Filter matches where player is involved
  const playerMatches = MATCHES.filter(
    (m) =>
      m.teamA.toLowerCase().includes(player.name.toLowerCase()) ||
      m.teamB.toLowerCase().includes(player.name.toLowerCase())
  );

  return (
    <PlayerClient
      player={player}
      team={player.team}
      markets={playerMarkets}
      leaderboard={leaderboardEntry}
      matches={playerMatches}
    />
  );
}
