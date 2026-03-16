import { NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase/server';
import { fetchSheetCSV, parseIndividualRows, parseTeamRows } from '@/lib/sheets-sync';

export async function POST() {
  try {
    const supabase = createServiceSupabase();

    // Get sheet URLs from settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('*')
      .in('key', ['google_sheet_individual_url', 'google_sheet_team_url']);

    const individualUrl = settings?.find((s: { key: string }) => s.key === 'google_sheet_individual_url')?.value;
    const teamUrl = settings?.find((s: { key: string }) => s.key === 'google_sheet_team_url')?.value;

    let individualCount = 0;
    let teamCount = 0;
    const errors: string[] = [];

    // Sync individual leaderboard
    if (individualUrl) {
      try {
        const csv = await fetchSheetCSV(individualUrl);
        const rows = parseIndividualRows(csv);

        if (rows.length > 0) {
          // Get existing players for matching
          const { data: players } = await supabase.from('players').select('id, name');
          const playerMap = new Map(
            (players || []).map((p: { id: string; name: string }) => [p.name.toLowerCase(), p.id])
          );

          for (const row of rows) {
            const playerId = playerMap.get(row.player_name.toLowerCase()) || null;

            const { error } = await supabase
              .from('leaderboard_individual')
              .upsert(
                {
                  player_id: playerId,
                  player_name: row.player_name,
                  team_name: row.team_name,
                  handicap: row.handicap,
                  round_1_score: row.round_1_score,
                  round_1_points: row.round_1_points,
                  round_2_score: row.round_2_score,
                  round_2_points: row.round_2_points,
                  round_3_score: row.round_3_score,
                  round_3_points: row.round_3_points,
                  round_4_score: row.round_4_score,
                  round_4_points: row.round_4_points,
                  total_points: row.total_points,
                  position: row.position,
                  source: 'sheet',
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'player_id' }
              );

            if (!error) individualCount++;
          }
        }
      } catch (err) {
        errors.push(`Individual sync error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Sync team leaderboard
    if (teamUrl) {
      try {
        const csv = await fetchSheetCSV(teamUrl);
        const rows = parseTeamRows(csv);

        if (rows.length > 0) {
          const { data: teams } = await supabase.from('teams').select('id, name');
          const teamMap = new Map(
            (teams || []).map((t: { id: string; name: string }) => [t.name.toLowerCase(), t.id])
          );

          for (const row of rows) {
            const teamId = teamMap.get(row.team_name.toLowerCase()) || null;

            const { error } = await supabase
              .from('leaderboard_team')
              .upsert(
                {
                  team_id: teamId,
                  team_name: row.team_name,
                  round_1_points: row.round_1_points,
                  round_2_points: row.round_2_points,
                  round_3_points: row.round_3_points,
                  round_4_points: row.round_4_points,
                  total_points: row.total_points,
                  position: row.position,
                  source: 'sheet',
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'team_id' }
              );

            if (!error) teamCount++;
          }
        }
      } catch (err) {
        errors.push(`Team sync error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Log the sync
    await supabase.from('leaderboard_sync_logs').insert({
      source_type: 'google_sheets',
      source_reference: individualUrl || teamUrl || 'no url configured',
      status: errors.length > 0 ? 'error' : 'success',
      rows_processed: individualCount + teamCount,
      message: errors.length > 0 ? errors.join('; ') : `Synced ${individualCount} individual, ${teamCount} team rows`,
    });

    if (!individualUrl && !teamUrl) {
      return NextResponse.json({
        error: 'No Google Sheet URLs configured. Go to Settings to add them.',
      }, { status: 400 });
    }

    return NextResponse.json({
      individualCount,
      teamCount,
      errors,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
