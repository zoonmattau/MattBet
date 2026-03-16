/**
 * Monte Carlo match play simulator.
 * Simulates 10,000 matches per matchup, caches results.
 * SGM odds are derived by counting sims where all conditions pass.
 */

import { BetSlipItem } from './types';

export interface SimResult {
  winner: 'a' | 'b' | 'halved';
  margin: number; // absolute holes up at end
  holesWonA: number;
  holesWonB: number;
  holesPlayed: number;
}

const SIMS = 10000;
const HOUSE_EDGE_SGM = 1.12; // 12% margin on SGM odds
const HOUSE_EDGE_H2H = 1.15; // 15% margin on H2H markets
const HOUSE_EDGE_LINE = 1.05; // 5% margin on lines and totals

// Cache sims by match prefix
const simCache = new Map<string, SimResult[]>();

// Handicaps for all players
const HC: Record<string, number> = {
  lewis: 9, jacob: 9, finn: 10, bails: 14, jackson: 14,
  brad: 15, ando: 15, hugo: 15, mcnaughton: 18, daniel: 20, watto: 21, parker: 22,
};

/**
 * Simulate a single hole.
 * advantage: P(A wins) shift from 0.38 base.
 * Returns: 1 = A wins, -1 = B wins, 0 = halve
 */
function simHole(advantage: number): number {
  const pA = Math.max(0.10, Math.min(0.70, 0.46 + advantage));
  const pB = Math.max(0.10, Math.min(0.70, 0.46 - advantage));
  const r = Math.random();
  if (r < pA) return 1;
  if (r < pA + pB) return -1;
  return 0;
}

/**
 * Build per-hole advantage array.
 *
 * Handicap match play: lower HC has natural skill edge on every hole.
 * Higher HC receives strokes on specific holes (hardest first).
 * One received stroke swings ~15% on that hole.
 * Natural edge per hole ≈ handicapDiff * 1.5% (small but cumulative).
 *
 * 5 stroke diff example (Lewis 9 vs Bails 14):
 * - 13 non-stroke holes: advantage = +0.075 per hole
 * - 5 stroke holes: advantage = 0.075 - 0.15 = -0.075
 * - Average: +0.033 → P(A) ≈ 0.41, P(B) ≈ 0.35 → ~62% match win
 */
function buildAdvantageArray(hcA: number, hcB: number, numHoles: number): number[] {
  const diff = hcB - hcA; // positive = A is better
  const edgePerHole = diff * 0.015; // natural skill edge per hole
  const strokeCount = Math.round(Math.abs(diff));
  const strokeDir = diff > 0 ? -1 : 1; // strokes go against the better player

  const adv = new Array(numHoles).fill(edgePerHole);

  // Distribute strokes evenly across the course
  for (let i = 0; i < Math.min(strokeCount, numHoles); i++) {
    const holeIdx = Math.round((i + 0.5) * numHoles / Math.max(strokeCount, 1)) % numHoles;
    adv[holeIdx] += strokeDir * (0.014 * numHoles * 0.55); // each stroke cancels 55% of one stroke's worth of natural edge
  }

  return adv;
}

function build2v2Advantage(hcA: number[], hcB: number[], numHoles: number): number[] {
  const avgA = (hcA[0] + hcA[1]) / 2;
  const avgB = (hcB[0] + hcB[1]) / 2;
  return buildAdvantageArray(avgA, avgB, numHoles);
}

/**
 * Simulate one match.
 */
function simulateOneMatch(advantages: number[], numHoles: number): SimResult {
  let score = 0;
  let holesWonA = 0;
  let holesWonB = 0;
  let matchDecidedAt = numHoles;
  let matchScore = 0;

  // Play ALL holes (totals count every hole even after match is decided)
  for (let h = 0; h < numHoles; h++) {
    const result = simHole(advantages[h]);

    if (result === 1) { score++; holesWonA++; }
    else if (result === -1) { score--; holesWonB++; }

    // Track when match result was decided (for margin calculation)
    const remaining = numHoles - h - 1;
    if (matchDecidedAt === numHoles && Math.abs(score) > remaining) {
      matchDecidedAt = h + 1;
      matchScore = score;
    }
  }

  // If match was never "decided early", use final score
  if (matchDecidedAt === numHoles) {
    matchScore = score;
  }

  return {
    winner: matchScore > 0 ? 'a' : matchScore < 0 ? 'b' : 'halved',
    margin: Math.abs(matchScore),
    holesWonA,
    holesWonB,
    holesPlayed: numHoles,
  };
}

/**
 * Run N simulations for a match.
 */
function simulateMatch(
  hcA: number | number[],
  hcB: number | number[],
  numHoles: number
): SimResult[] {
  const advantages = Array.isArray(hcA)
    ? build2v2Advantage(hcA as number[], hcB as number[], numHoles)
    : buildAdvantageArray(hcA as number, hcB as number, numHoles);

  const results: SimResult[] = [];
  for (let i = 0; i < SIMS; i++) {
    results.push(simulateOneMatch(advantages, numHoles));
  }
  return results;
}

// Match definitions for simulation
interface MatchConfig {
  prefix: string;
  teamANames: string[]; // lowercase first names
  teamBNames: string[];
  hcA: number | number[];
  hcB: number | number[];
  numHoles: number;
}

const MATCH_CONFIGS: MatchConfig[] = [
  // R2 - 2v2 Match Play at Lost Farm (18 holes)
  { prefix: 'r2-m1', teamANames: ['hugo', 'bails'], teamBNames: ['jackson', 'finn'], hcA: [HC.hugo, HC.bails], hcB: [HC.jackson, HC.finn], numHoles: 18 },
  { prefix: 'r2-m2', teamANames: ['lewis', 'jacob'], teamBNames: ['ando', 'mcnaughton'], hcA: [HC.lewis, HC.jacob], hcB: [HC.ando, HC.mcnaughton], numHoles: 18 },
  { prefix: 'r2-m3', teamANames: ['brad', 'watto'], teamBNames: ['daniel', 'parker'], hcA: [HC.brad, HC.watto], hcB: [HC.daniel, HC.parker], numHoles: 18 },

  // R3 - 2v2 Scramble at Bougle Run (14 holes)
  { prefix: 'r3-m1', teamANames: ['hugo', 'bails'], teamBNames: ['daniel', 'parker'], hcA: [HC.hugo, HC.bails], hcB: [HC.daniel, HC.parker], numHoles: 14 },
  { prefix: 'r3-m2', teamANames: ['jackson', 'finn'], teamBNames: ['brad', 'watto'], hcA: [HC.jackson, HC.finn], hcB: [HC.brad, HC.watto], numHoles: 14 },
  { prefix: 'r3-m3', teamANames: ['lewis', 'jacob'], teamBNames: ['ando', 'mcnaughton'], hcA: [HC.lewis, HC.jacob], hcB: [HC.ando, HC.mcnaughton], numHoles: 14 },

  // R4 - 1v1 Match Play at Barnbougle Dunes (18 holes)
  { prefix: 'r4-hugo-jacko', teamANames: ['hugo'], teamBNames: ['jackson'], hcA: HC.hugo, hcB: HC.jackson, numHoles: 18 },
  { prefix: 'r4-lewis-bails', teamANames: ['lewis'], teamBNames: ['bails'], hcA: HC.lewis, hcB: HC.bails, numHoles: 18 },
  { prefix: 'r4-finn-jacob', teamANames: ['jacob'], teamBNames: ['finn'], hcA: HC.jacob, hcB: HC.finn, numHoles: 18 },
  { prefix: 'r4-ando-daniel', teamANames: ['ando'], teamBNames: ['daniel'], hcA: HC.ando, hcB: HC.daniel, numHoles: 18 },
  { prefix: 'r4-brad-parker', teamANames: ['brad'], teamBNames: ['parker'], hcA: HC.brad, hcB: HC.parker, numHoles: 18 },
  { prefix: 'r4-horny-general', teamANames: ['watto'], teamBNames: ['mcnaughton'], hcA: HC.watto, hcB: HC.mcnaughton, numHoles: 18 },
];

function getMatchPrefix(slug: string): string | null {
  const m = slug.match(/^(r[234]-m\d)/);
  if (m) return m[1];
  const r4 = slug.match(/^(r4-[a-z]+-[a-z]+)/);
  return r4 ? r4[1] : null;
}

function getSimsForMatch(prefix: string): SimResult[] {
  if (!simCache.has(prefix)) {
    const config = MATCH_CONFIGS.find((c) => c.prefix === prefix);
    if (!config) return [];
    simCache.set(prefix, simulateMatch(config.hcA, config.hcB, config.numHoles));
  }
  return simCache.get(prefix)!;
}

/**
 * For a given selection, return a filter function that checks if a SimResult satisfies it.
 */
function selectionToFilter(
  item: BetSlipItem,
  config: MatchConfig
): ((sim: SimResult) => boolean) | null {
  const slug = item.market.slug;
  const name = item.selection.name.toLowerCase();

  // Determine which team this selection refers to
  const isTeamA = config.teamANames.some((n) => name.includes(n));
  const isTeamB = config.teamBNames.some((n) => name.includes(n));

  if (slug.includes('-h2h')) {
    if (name === 'halved') return (sim) => sim.winner === 'halved';
    if (isTeamA) return (sim) => sim.winner === 'a';
    if (isTeamB) return (sim) => sim.winner === 'b';
  }

  if (slug.includes('-dnb')) {
    // Draw no bet: same as H2H but halved = push (no result)
    if (isTeamA) return (sim) => sim.winner === 'a';
    if (isTeamB) return (sim) => sim.winner === 'b';
  }

  if (slug.includes('-line')) {
    const val = parseFloat(name.match(/[\d.]+/)?.[0] || '0');
    const isMinus = name.includes('-');
    const isHalf = val % 1 !== 0;
    if (isMinus) {
      // -1.5 means win by 2+, -2 means win by 3+ (exactly 2 = push)
      if (isTeamA) return (sim) => sim.winner === 'a' && sim.margin > val;
      if (isTeamB) return (sim) => sim.winner === 'b' && sim.margin > val;
    } else {
      // +1.5 means lose by at most 1, +2 means lose by at most 1 (exactly 2 = push)
      if (isTeamA) return (sim) => sim.winner === 'a' || sim.winner === 'halved' || (sim.winner === 'b' && sim.margin < val);
      if (isTeamB) return (sim) => sim.winner === 'b' || sim.winner === 'halved' || (sim.winner === 'a' && sim.margin < val);
    }
  }

  if (slug.includes('-total')) {
    const val = parseFloat(name.match(/[\d.]+/)?.[0] || '0');
    const isOver = name.startsWith('over');
    const title = item.market.title.toLowerCase();
    const totalIsTeamA = config.teamANames.some((n) => title.includes(n));

    if (isOver) {
      return totalIsTeamA
        ? (sim) => sim.holesWonA > val
        : (sim) => sim.holesWonB > val;
    } else {
      return totalIsTeamA
        ? (sim) => sim.holesWonA < val
        : (sim) => sim.holesWonB < val;
    }
  }

  return null;
}

/**
 * Calculate SGM odds using Monte Carlo simulation.
 * Returns the adjusted odds with house edge, or null if not a same-match multi.
 */
/**
 * Generate all individual market odds for a match from simulation.
 * Use this to set/update database odds to be consistent with SGM pricing.
 */
export function generateMatchOdds(prefix: string): {
  debug: { aWins: number; bWins: number; halved: number; n: number; winPct: number };
  h2h: { a: number; b: number; halved: number };
  line: { fav: number; dog: number; value: number; favSide: 'a' | 'b' };
  dnb: { a: number; b: number };
  totalA: { over: number; under: number; value: number };
  totalB: { over: number; under: number; value: number };
} | null {
  const config = MATCH_CONFIGS.find((c) => c.prefix === prefix);
  if (!config) return null;

  const sims = getSimsForMatch(prefix);
  const n = sims.length;

  const aWins = sims.filter((s) => s.winner === 'a').length;
  const bWins = sims.filter((s) => s.winner === 'b').length;
  const halved = sims.filter((s) => s.winner === 'halved').length;

  // Find the most balanced spread line
  const aIsFav = aWins >= bWins;
  let bestSpread = 1.5;
  let bestSpreadDiff = Infinity;
  let bestFavCovers = 0;
  const winPct = Math.max(aWins, bWins) / n;
  // -0.5 only for close matches (fav wins <58% of sims), otherwise start at -1.5
  const minSpread = winPct < 0.54 ? 0.5 : 1.5;
  for (const lineVal of [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5].filter(v => v >= minSpread)) {
    const isHalf = lineVal % 1 !== 0;
    const favCovers = sims.filter((s) => {
      const wins = aIsFav ? s.winner === 'a' : s.winner === 'b';
      if (!wins) return false;
      return isHalf ? s.margin >= Math.ceil(lineVal) : s.margin > lineVal;
    }).length;
    const dogCovers = sims.filter((s) => {
      const loses = aIsFav ? s.winner === 'b' : s.winner === 'a';
      if (s.winner === 'halved') return !isHalf; // halved = push on whole, dog covers on .5? No, halved = margin 0
      if (loses) return true; // dog wins outright
      // Fav wins but doesn't cover
      const wins = aIsFav ? s.winner === 'a' : s.winner === 'b';
      if (wins) return isHalf ? s.margin < Math.ceil(lineVal) : s.margin < lineVal;
      return false;
    }).length;
    const diff = Math.abs(favCovers - dogCovers);
    if (diff < bestSpreadDiff) {
      bestSpreadDiff = diff;
      bestSpread = lineVal;
      bestFavCovers = favCovers;
    }
  }

  const favCovers = bestFavCovers;

  // Find the most balanced total line using median
  function findBestLine(sims: SimResult[], getHoles: (s: SimResult) => number): { line: number; overCount: number } {
    const holes = sims.map(getHoles).sort((a, b) => a - b);
    const median = holes[Math.floor(holes.length / 2)];
    const line = median - 0.5; // .5 below median = roughly even split, no push
    const overCount = sims.filter((s) => getHoles(s) > line).length;
    return { line, overCount };
  }

  const bestA = findBestLine(sims, (s) => s.holesWonA);
  const bestB = findBestLine(sims, (s) => s.holesWonB);
  const totalLineA = bestA.line;
  const totalLineB = bestB.line;
  const aOverCount = bestA.overCount;
  const bOverCount = bestB.overCount;

  const roundOdds = (raw: number) => {
    if (raw >= 1001) return 1001;
    if (raw >= 10) return Math.round(raw);
    if (raw >= 5) return parseFloat((Math.round(raw * 2) / 2).toFixed(2));
    return parseFloat((Math.round(raw * 20) / 20).toFixed(2));
  };
  const toH2HOdds = (count: number) => roundOdds(Math.max(1.01, (n / count) / HOUSE_EDGE_H2H));
  const toLineOdds = (count: number) => roundOdds(Math.max(1.01, (n / count) / HOUSE_EDGE_LINE));

  return {
    debug: { aWins, bWins, halved, n, winPct: Math.round(winPct * 100) },
    h2h: {
      a: toH2HOdds(aWins || 1),
      b: toH2HOdds(bWins || 1),
      halved: toH2HOdds(halved || 1),
    },
    dnb: {
      // DNB: odds based on decided matches only (halves excluded, stake returned)
      // Use 5% overround
      a: (() => {
        const decidedTotal = aWins + bWins;
        const raw = Math.max(1.05, (decidedTotal / (aWins || 1)) / HOUSE_EDGE_LINE);
        return parseFloat((Math.round(raw * 20) / 20).toFixed(2));
      })(),
      b: (() => {
        const decidedTotal = aWins + bWins;
        const raw = Math.max(1.05, (decidedTotal / (bWins || 1)) / HOUSE_EDGE_LINE);
        return parseFloat((Math.round(raw * 20) / 20).toFixed(2));
      })(),
    },
    line: (() => {
      if (bestSpread === 0.5) {
        // Fav matches H2H odds, dog compensates to hit 5% total overround
        const favOdds = toH2HOdds(favCovers || 1);
        const favImplied = 1 / favOdds;
        const dogImplied = 1.05 - favImplied;
        const dogOdds = parseFloat((Math.round((1 / dogImplied) * 20) / 20).toFixed(2));
        return { fav: favOdds, dog: dogOdds, value: bestSpread, favSide: aIsFav ? 'a' as const : 'b' as const };
      }
      return {
        fav: toLineOdds(favCovers || 1),
        dog: toLineOdds((n - favCovers) || 1),
        value: bestSpread,
        favSide: aIsFav ? 'a' as const : 'b' as const,
      };
    })(),
    totalA: {
      over: toLineOdds(aOverCount || 1),
      under: toLineOdds((n - aOverCount) || 1),
      value: totalLineA,
    },
    totalB: {
      over: toLineOdds(bOverCount || 1),
      under: toLineOdds((n - bOverCount) || 1),
      value: totalLineB,
    },
  };
}

/**
 * Generate odds for all matches. Call this to get SQL update statements.
 */
export function generateAllMatchOdds(): Record<string, ReturnType<typeof generateMatchOdds>> {
  simCache.clear(); // fresh sims each run
  const results: Record<string, ReturnType<typeof generateMatchOdds>> = {};
  for (const config of MATCH_CONFIGS) {
    results[config.prefix] = generateMatchOdds(config.prefix);
  }
  return results;
}

/**
 * Get raw sim results for a match (for alternate line/total calculations).
 */
export function getMatchSims(prefix: string): SimResult[] {
  return getSimsForMatch(prefix);
}

export function getMatchConfig(prefix: string) {
  return MATCH_CONFIGS.find((c) => c.prefix === prefix) || null;
}

export function calculateSGMOdds(
  items: BetSlipItem[]
): { odds: number; probability: number; conflict: string | null; isCorrelated: boolean } | null {
  // Group items by match prefix
  const byPrefix = new Map<string, BetSlipItem[]>();

  for (const item of items) {
    const prefix = getMatchPrefix(item.market.slug);
    if (prefix) {
      const list = byPrefix.get(prefix) || [];
      list.push(item);
      byPrefix.set(prefix, list);
    }
  }

  // Only use sim for matches with 2+ legs from the same match
  const hasMultiLegMatch = Array.from(byPrefix.values()).some((items) => items.length >= 2);
  if (!hasMultiLegMatch) return null;

  let combinedProbability = 1;
  let isCorrelated = false;

  for (const [prefix, matchItems] of byPrefix) {
    const config = MATCH_CONFIGS.find((c) => c.prefix === prefix);
    if (!config) continue;

    if (matchItems.length === 1) {
      // Single leg: use the market odds directly
      combinedProbability *= 1 / Number(matchItems[0].selection.odds_decimal);
      continue;
    }

    // Multiple legs from same match: simulate
    isCorrelated = true;
    const sims = getSimsForMatch(prefix);
    if (sims.length === 0) continue;

    const filters = matchItems.map((item) => selectionToFilter(item, config)).filter(Boolean) as ((sim: SimResult) => boolean)[];

    if (filters.length === 0) continue;

    // Count sims where ALL conditions are met
    let passing = 0;
    for (const sim of sims) {
      if (filters.every((f) => f(sim))) passing++;
    }

    const prob = passing / sims.length;

    if (prob === 0) {
      return { odds: 0, probability: 0, conflict: 'This combination is impossible based on simulation', isCorrelated: true };
    }

    combinedProbability *= prob;
  }

  // Add non-match items (straight multiply)
  for (const item of items) {
    const prefix = getMatchPrefix(item.market.slug);
    if (!prefix) {
      combinedProbability *= 1 / Number(item.selection.odds_decimal);
    }
  }

  const rawOdds = 1 / combinedProbability;
  let adjustedOdds = rawOdds / HOUSE_EDGE_SGM;

  // SGM should never pay worse than the hardest individual leg
  const bestSingleOdds = Math.max(...items.map((i) => Number(i.selection.odds_decimal)));
  if (adjustedOdds < bestSingleOdds) {
    adjustedOdds = bestSingleOdds;
  }

  return {
    odds: parseFloat(Math.max(1.01, adjustedOdds).toFixed(2)),
    probability: combinedProbability,
    conflict: null,
    isCorrelated,
  };
}
