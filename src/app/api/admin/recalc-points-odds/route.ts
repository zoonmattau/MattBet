import { NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase/server';
import { DEFAULT_MATCHES, PairingOverrides, applyPairingOverrides, MatchDefinition } from '@/lib/matches';
import {
  simulatePoints,
  calculateLineOdds,
  PLAYER_MARKET_SLUGS,
  GROUPS,
  ROUND_GROUP_SLUGS,
  LeaderboardRow,
} from '@/lib/points-simulator';

export async function POST() {
  const supabase = createServiceSupabase();

  // Load current pairings
  const { data: settings } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'match_pairings')
    .single();

  let matches: MatchDefinition[];
  if (settings?.value) {
    try {
      const overrides: PairingOverrides = JSON.parse(settings.value);
      matches = applyPairingOverrides(overrides);
    } catch {
      matches = DEFAULT_MATCHES;
    }
  } else {
    matches = DEFAULT_MATCHES;
  }

  // Load leaderboard
  const { data: leaderboard } = await supabase
    .from('leaderboard_individual')
    .select('player_name, round_1_points, round_2_points, round_3_points, round_4_points, total_points');

  if (!leaderboard || leaderboard.length === 0) {
    return NextResponse.json({ error: 'No leaderboard data found' }, { status: 404 });
  }

  // Run simulation
  const simResult = simulatePoints(leaderboard as LeaderboardRow[], matches);
  const updates: { market: string; line: number; overOdds: number; underOdds: number; median: number }[] = [];

  // Helper to update an O/U market
  async function updateOUMarket(slug: string, values: number[]) {
    const { line, overOdds, underOdds } = calculateLineOdds(values);
    const median = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

    const { data: market } = await supabase
      .from('markets')
      .select('id, title')
      .eq('slug', slug)
      .single();

    if (!market) return;

    // Update line value
    await supabase
      .from('markets')
      .update({ line_value: line })
      .eq('id', market.id);

    // Update Over selection (sort_order 1)
    await supabase
      .from('market_selections')
      .update({ name: `Over ${line}`, odds_decimal: overOdds })
      .eq('market_id', market.id)
      .eq('sort_order', 1);

    // Update Under selection (sort_order 2)
    await supabase
      .from('market_selections')
      .update({ name: `Under ${line}`, odds_decimal: underOdds })
      .eq('market_id', market.id)
      .eq('sort_order', 2);

    updates.push({ market: market.title, line, overOdds, underOdds, median });
  }

  // --- Individual total points markets ---
  for (const [player, slug] of Object.entries(PLAYER_MARKET_SLUGS)) {
    const values = simResult.playerTotals.get(player);
    if (!values || values.length === 0) continue;
    await updateOUMarket(slug, values);
  }

  // --- Group total points markets ---
  for (const group of GROUPS) {
    const groupValues: number[] = [];
    for (let i = 0; i < (simResult.playerTotals.get(group.players[0])?.length ?? 0); i++) {
      let groupTotal = 0;
      for (const player of group.players) {
        groupTotal += simResult.playerTotals.get(player)?.[i] ?? 0;
      }
      groupValues.push(groupTotal);
    }
    if (groupValues.length > 0) {
      await updateOUMarket(group.slug, groupValues);
    }
  }

  // --- Per-round group points markets ---
  for (const [roundStr, groupSlugs] of Object.entries(ROUND_GROUP_SLUGS)) {
    const round = parseInt(roundStr);
    if (simResult.completedRounds.has(round)) continue; // skip completed rounds

    for (const group of GROUPS) {
      const slug = groupSlugs[group.name];
      if (!slug) continue;

      const groupValues: number[] = [];
      const samplePlayer = group.players[0];
      const roundPoints = simResult.playerRoundPoints.get(samplePlayer)?.get(round);
      if (!roundPoints) continue;

      for (let i = 0; i < roundPoints.length; i++) {
        let groupTotal = 0;
        for (const player of group.players) {
          const pts = simResult.playerRoundPoints.get(player)?.get(round)?.[i] ?? 0;
          groupTotal += pts;
        }
        groupValues.push(groupTotal);
      }

      if (groupValues.length > 0) {
        await updateOUMarket(slug, groupValues);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    completedRounds: Array.from(simResult.completedRounds),
    updates,
  });
}
