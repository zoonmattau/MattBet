import { createServerSupabase } from '@/lib/supabase/server';
import { AdminLeaderboardClient } from './leaderboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminLeaderboardPage() {
  const supabase = await createServerSupabase();

  const { data: individual } = await supabase
    .from('leaderboard_individual')
    .select('*')
    .order('position');

  const { data: team } = await supabase
    .from('leaderboard_team')
    .select('*')
    .order('position');

  const { data: syncLogs } = await supabase
    .from('leaderboard_sync_logs')
    .select('*')
    .order('synced_at', { ascending: false })
    .limit(10);

  const { data: settings } = await supabase
    .from('admin_settings')
    .select('*')
    .in('key', ['google_sheet_individual_url', 'google_sheet_team_url', 'leaderboard_source']);

  return (
    <AdminLeaderboardClient
      individual={individual || []}
      team={team || []}
      syncLogs={syncLogs || []}
      settings={settings || []}
    />
  );
}
