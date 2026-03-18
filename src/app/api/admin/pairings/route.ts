import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase/server';
import { DEFAULT_MATCHES, PairingOverrides, applyPairingOverrides } from '@/lib/matches';

export async function GET() {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'match_pairings')
    .single();

  const overrides: PairingOverrides = data?.value ? JSON.parse(data.value) : {};
  const matches = applyPairingOverrides(overrides);

  return NextResponse.json({ matches, overrides });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceSupabase();
  const { overrides } = (await req.json()) as { overrides: PairingOverrides };

  // Upsert pairings into admin_settings
  const { error } = await supabase
    .from('admin_settings')
    .upsert({ key: 'match_pairings', value: JSON.stringify(overrides) }, { onConflict: 'key' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update market selection names to reflect new pairings
  const matches = applyPairingOverrides(overrides);
  for (const match of matches) {
    const defaultMatch = DEFAULT_MATCHES.find((m) => m.id === match.id)!;
    const teamAChanged = match.teamA !== defaultMatch.teamA;
    const teamBChanged = match.teamB !== defaultMatch.teamB;

    if (!teamAChanged && !teamBChanged) continue;

    // Update H2H market selections
    const { data: h2hMarket } = await supabase
      .from('markets')
      .select('id, title')
      .eq('slug', match.marketSlugs.h2h)
      .single();

    if (h2hMarket) {
      // Update market title
      await supabase
        .from('markets')
        .update({ title: `${match.teamA} vs ${match.teamB}` })
        .eq('id', h2hMarket.id);

      // Update selection names (match old team name -> new team name)
      if (teamAChanged) {
        await supabase
          .from('market_selections')
          .update({ name: match.teamA })
          .eq('market_id', h2hMarket.id)
          .eq('name', defaultMatch.teamA);
      }
      if (teamBChanged) {
        await supabase
          .from('market_selections')
          .update({ name: match.teamB })
          .eq('market_id', h2hMarket.id)
          .eq('name', defaultMatch.teamB);
      }
    }

    // Update line market title
    const { data: lineMarket } = await supabase
      .from('markets')
      .select('id')
      .eq('slug', match.marketSlugs.line)
      .single();

    if (lineMarket) {
      await supabase
        .from('markets')
        .update({ title: `${match.teamA} vs ${match.teamB} Line` })
        .eq('id', lineMarket.id);
    }
  }

  return NextResponse.json({ ok: true, matches });
}
