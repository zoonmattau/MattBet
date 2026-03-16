import { createServerSupabase } from '@/lib/supabase/server';
import { LeaderboardClient } from './leaderboard-client';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const supabase = await createServerSupabase();

  const { data: individual } = await supabase
    .from('leaderboard_individual')
    .select('*')
    .order('position');

  const { data: team } = await supabase
    .from('leaderboard_team')
    .select('*')
    .order('position');

  return (
    <LeaderboardClient
      individual={individual || []}
      team={team || []}
    />
  );
}
