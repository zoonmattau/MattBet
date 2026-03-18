import { NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase/server';
import { DEFAULT_MATCHES, PairingOverrides, applyPairingOverrides, MatchDefinition } from '@/lib/matches';
import { generateMatchOdds, registerMatchFromDefinition } from '@/lib/match-simulator';

export async function POST() {
  const supabase = createServiceSupabase();

  // Load current pairings from DB
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

  // Register all matches so the sim uses current pairings/handicaps
  for (const match of matches) {
    registerMatchFromDefinition(match);
  }

  const results: { match: string; updates: string[] }[] = [];

  for (const match of matches) {
    const odds = generateMatchOdds(match.slugPrefix);
    if (!odds) continue;

    const matchUpdates: string[] = [];

    // --- H2H market ---
    const { data: h2hMarket } = await supabase
      .from('markets')
      .select('id')
      .eq('slug', match.marketSlugs.h2h)
      .single();

    if (h2hMarket) {
      // Team A selection (sort_order 1)
      await supabase
        .from('market_selections')
        .update({ odds_decimal: odds.h2h.a })
        .eq('market_id', h2hMarket.id)
        .eq('sort_order', 1);
      matchUpdates.push(`H2H ${match.teamA}: $${odds.h2h.a}`);

      // Team B selection (sort_order 2)
      await supabase
        .from('market_selections')
        .update({ odds_decimal: odds.h2h.b })
        .eq('market_id', h2hMarket.id)
        .eq('sort_order', 2);
      matchUpdates.push(`H2H ${match.teamB}: $${odds.h2h.b}`);

      // Halved
      await supabase
        .from('market_selections')
        .update({ odds_decimal: odds.h2h.halved })
        .eq('market_id', h2hMarket.id)
        .ilike('name', 'halved');
      matchUpdates.push(`H2H Halved: $${odds.h2h.halved}`);
    }

    // --- Line market ---
    const { data: lineMarket } = await supabase
      .from('markets')
      .select('id')
      .eq('slug', match.marketSlugs.line)
      .single();

    if (lineMarket) {
      const favName = odds.line.favSide === 'a' ? match.teamA : match.teamB;
      const dogName = odds.line.favSide === 'a' ? match.teamB : match.teamA;

      // Update line value on market
      await supabase
        .from('markets')
        .update({ line_value: odds.line.value })
        .eq('id', lineMarket.id);

      // Favourite (sort_order 1)
      await supabase
        .from('market_selections')
        .update({ name: `${favName} -${odds.line.value}`, odds_decimal: odds.line.fav })
        .eq('market_id', lineMarket.id)
        .eq('sort_order', 1);
      matchUpdates.push(`Line ${favName} -${odds.line.value}: $${odds.line.fav}`);

      // Underdog (sort_order 2)
      await supabase
        .from('market_selections')
        .update({ name: `${dogName} +${odds.line.value}`, odds_decimal: odds.line.dog })
        .eq('market_id', lineMarket.id)
        .eq('sort_order', 2);
      matchUpdates.push(`Line ${dogName} +${odds.line.value}: $${odds.line.dog}`);
    }

    // --- Total A market ---
    const { data: totalAMarket } = await supabase
      .from('markets')
      .select('id')
      .eq('slug', match.marketSlugs.totalA)
      .single();

    if (totalAMarket) {
      await supabase
        .from('markets')
        .update({ line_value: odds.totalA.value })
        .eq('id', totalAMarket.id);

      await supabase
        .from('market_selections')
        .update({ name: `Over ${odds.totalA.value}`, odds_decimal: odds.totalA.over })
        .eq('market_id', totalAMarket.id)
        .eq('sort_order', 1);

      await supabase
        .from('market_selections')
        .update({ name: `Under ${odds.totalA.value}`, odds_decimal: odds.totalA.under })
        .eq('market_id', totalAMarket.id)
        .eq('sort_order', 2);
      matchUpdates.push(`${match.teamA} Total ${odds.totalA.value}: O $${odds.totalA.over} / U $${odds.totalA.under}`);
    }

    // --- Total B market ---
    const { data: totalBMarket } = await supabase
      .from('markets')
      .select('id')
      .eq('slug', match.marketSlugs.totalB)
      .single();

    if (totalBMarket) {
      await supabase
        .from('markets')
        .update({ line_value: odds.totalB.value })
        .eq('id', totalBMarket.id);

      await supabase
        .from('market_selections')
        .update({ name: `Over ${odds.totalB.value}`, odds_decimal: odds.totalB.over })
        .eq('market_id', totalBMarket.id)
        .eq('sort_order', 1);

      await supabase
        .from('market_selections')
        .update({ name: `Under ${odds.totalB.value}`, odds_decimal: odds.totalB.under })
        .eq('market_id', totalBMarket.id)
        .eq('sort_order', 2);
      matchUpdates.push(`${match.teamB} Total ${odds.totalB.value}: O $${odds.totalB.over} / U $${odds.totalB.under}`);
    }

    results.push({ match: `${match.teamA} vs ${match.teamB}`, updates: matchUpdates });
  }

  return NextResponse.json({ ok: true, results });
}
