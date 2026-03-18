import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase/server';

const SIMS = 50000;
const HOUSE_EDGE = 1.12; // 12% margin on derived markets

interface DeriveRequest {
  sourceSlug: string; // e.g. 'trip-champion' or 'friday-stableford-winner'
}

/**
 * Given a winner market with implied probabilities for each player,
 * simulate finishing order 50,000 times and derive:
 * - Top 3 finish probabilities
 * - Bottom 3 finish probabilities
 * - Wooden spoon (last place) probabilities
 */
function simulateFinishingPositions(
  players: { name: string; winProb: number }[],
  numSims: number
): { name: string; top3: number; bottom3: number; last: number }[] {
  const n = players.length;
  const counts = players.map(() => ({ top3: 0, bottom3: 0, last: 0 }));

  for (let sim = 0; sim < numSims; sim++) {
    // Generate a "score" for each player based on their win probability
    // Higher win prob = higher expected score
    // Use inverse normal-ish sampling: score = strength + noise
    const scores: { idx: number; score: number }[] = players.map((p, idx) => {
      // Convert win prob to a "strength" rating
      // Use log-odds as strength, then add gaussian noise
      const strength = Math.log(p.winProb / (1 - p.winProb + 0.001));
      const noise = gaussianRandom() * 1.8; // significant randomness
      return { idx, score: strength + noise };
    });

    // Sort by score descending (highest = best finish)
    scores.sort((a, b) => b.score - a.score);

    // Assign positions
    for (let pos = 0; pos < n; pos++) {
      const playerIdx = scores[pos].idx;
      if (pos < 3) counts[playerIdx].top3++;
      if (pos >= n - 3) counts[playerIdx].bottom3++;
      if (pos === n - 1) counts[playerIdx].last++;
    }
  }

  return players.map((p, i) => ({
    name: p.name,
    top3: counts[i].top3 / numSims,
    bottom3: counts[i].bottom3 / numSims,
    last: counts[i].last / numSims,
  }));
}

// Box-Muller transform for gaussian random
function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function toOdds(prob: number): number {
  if (prob <= 0.001) return 501;
  const raw = Math.max(1.01, (1 / prob) / HOUSE_EDGE);
  if (raw >= 100) return Math.round(raw);
  if (raw >= 10) return Math.round(raw);
  if (raw >= 5) return parseFloat((Math.round(raw * 2) / 2).toFixed(2));
  return parseFloat((Math.round(raw * 20) / 20).toFixed(2));
}

export async function POST(req: NextRequest) {
  const { sourceSlug } = (await req.json()) as DeriveRequest;
  const supabase = createServiceSupabase();

  // Fetch source market
  const { data: sourceMarket } = await supabase
    .from('markets')
    .select('id, title, slug')
    .eq('slug', sourceSlug)
    .single();

  if (!sourceMarket) {
    return NextResponse.json({ error: 'Source market not found' }, { status: 404 });
  }

  const { data: sourceSelections } = await supabase
    .from('market_selections')
    .select('*')
    .eq('market_id', sourceMarket.id)
    .order('sort_order');

  if (!sourceSelections || sourceSelections.length === 0) {
    return NextResponse.json({ error: 'No selections found' }, { status: 404 });
  }

  // Extract implied probabilities (normalize to remove overround)
  const rawProbs = sourceSelections.map((s: any) => 1 / Number(s.odds_decimal));
  const totalProb = rawProbs.reduce((a: number, b: number) => a + b, 0);
  const players = sourceSelections.map((s: any, i: number) => ({
    name: s.name as string,
    winProb: rawProbs[i] / totalProb, // normalized true probability
  }));

  // Run simulation
  const results = simulateFinishingPositions(players, SIMS);

  // Determine which derivative markets to update based on source
  const isTrip = sourceSlug === 'trip-champion';
  const isFriday = sourceSlug === 'friday-stableford-winner';

  const updates: { market: string; selections: { name: string; odds: number; prob: number }[] }[] = [];

  // Helper to update a market
  async function updateMarket(
    slug: string,
    getProb: (r: typeof results[0]) => number,
    includeAnyOther?: boolean
  ) {
    const { data: market } = await supabase
      .from('markets')
      .select('id, title')
      .eq('slug', slug)
      .single();

    if (!market) return;

    const { data: selections } = await supabase
      .from('market_selections')
      .select('*')
      .eq('market_id', market.id)
      .order('sort_order');

    if (!selections) return;

    const marketUpdates: { name: string; odds: number; prob: number }[] = [];

    for (const sel of selections as any[]) {
      const name = sel.name as string;

      // Handle "Any Other" style selections
      if (name.toLowerCase().includes('any other') || name.toLowerCase().includes('the field')) {
        if (includeAnyOther) {
          // Sum probabilities of players NOT in the named selections
          const namedPlayers = (selections as any[])
            .filter((s: any) => !s.name.toLowerCase().includes('any other') && !s.name.toLowerCase().includes('the field'))
            .map((s: any) => s.name.toLowerCase());
          const otherProb = results
            .filter((r) => !namedPlayers.includes(r.name.toLowerCase()))
            .reduce((sum, r) => sum + getProb(r), 0);
          const odds = toOdds(otherProb);
          await supabase
            .from('market_selections')
            .update({ odds_decimal: odds })
            .eq('id', sel.id);
          marketUpdates.push({ name, odds, prob: otherProb * 100 });
        }
        continue;
      }

      const result = results.find(
        (r) => r.name.toLowerCase() === name.toLowerCase()
      );
      if (!result) continue;

      const prob = getProb(result);
      const odds = toOdds(prob);

      await supabase
        .from('market_selections')
        .update({ odds_decimal: odds })
        .eq('id', sel.id);

      marketUpdates.push({ name, odds, prob: prob * 100 });
    }

    updates.push({ market: market.title, selections: marketUpdates });
  }

  if (isTrip) {
    await updateMarket('overall-top-3', (r) => r.top3);
    await updateMarket('overall-bottom-3', (r) => r.bottom3);
    await updateMarket('wooden-spoon', (r) => r.last, true);
  }

  if (isFriday) {
    await updateMarket('friday-top-3', (r) => r.top3);
  }

  return NextResponse.json({
    ok: true,
    source: sourceMarket.title,
    players: results.map((r) => ({
      name: r.name,
      winProb: (players.find((p: { name: string; winProb: number }) => p.name === r.name)?.winProb ?? 0) * 100,
      top3: r.top3 * 100,
      bottom3: r.bottom3 * 100,
      last: r.last * 100,
    })),
    updates,
  });
}
