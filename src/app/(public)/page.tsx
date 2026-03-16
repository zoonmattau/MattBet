import { createServerSupabase } from '@/lib/supabase/server';
import { Market, MarketSelection, LeaderboardTeam, LeaderboardIndividual } from '@/lib/types';
import { HomeClient } from './home-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createServerSupabase();

  const { data: featuredMarkets } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .eq('is_featured', true)
    .eq('status', 'open')
    .order('created_at')
    .limit(3);

  const { data: teams } = await supabase
    .from('teams')
    .select('*, players(*)')
    .order('name');

  const { data: teamLeaderboard } = await supabase
    .from('leaderboard_team')
    .select('*')
    .order('position');

  const { data: individualLeaderboard } = await supabase
    .from('leaderboard_individual')
    .select('*')
    .order('position');

  const { data: settings } = await supabase
    .from('admin_settings')
    .select('*')
    .in('key', ['trip_status']);

  const tripStatus = settings?.find((s) => s.key === 'trip_status')?.value || 'Markets Open';

  return (
    <HomeClient
      featuredMarkets={(featuredMarkets as (Market & { selections: MarketSelection[] })[]) || []}
      teams={teams || []}
      teamLeaderboard={(teamLeaderboard as LeaderboardTeam[]) || []}
      individualLeaderboard={(individualLeaderboard as LeaderboardIndividual[]) || []}
      tripStatus={tripStatus}
    />
  );
}
