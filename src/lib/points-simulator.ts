/**
 * Points simulator: converts match sim results into trip points distributions.
 * Used to auto-calculate O/U lines for individual totals, group totals, and per-round group points.
 */

import { SimResult, getMatchSims, getMatchConfig, registerMatchFromDefinition } from './match-simulator';
import { MatchDefinition } from './matches';
import { HANDICAPS } from './constants';

const SIMS = 10000;

// R1 stableford position-based points
const R1_POSITION_POINTS = [6, 5, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0];

const HOUSE_EDGE = 1.05;

export const GROUPS = [
  { name: 'Group 1', slug: 'group-1-total-points', players: ['hugo', 'bails', 'brad', 'watto'] },
  { name: 'Group 2', slug: 'group-2-total-points', players: ['finn', 'ando', 'jackson', 'mcnaughton'] },
  { name: 'Group 3', slug: 'group-3-total-points', players: ['daniel', 'jacob', 'lewis', 'parker'] },
];

export const PLAYER_MARKET_SLUGS: Record<string, string> = {
  lewis: 'lewis-total-pts', jacob: 'jacob-total-pts', finn: 'finn-total-pts',
  bails: 'bails-total-pts', jackson: 'jackson-total-pts', brad: 'brad-total-pts',
  ando: 'ando-total-pts', hugo: 'hugo-total-pts', mcnaughton: 'mcnaughton-total-pts',
  daniel: 'daniel-total-pts', watto: 'watto-total-pts', parker: 'parker-total-pts',
};

export const ROUND_GROUP_SLUGS: Record<number, Record<string, string>> = {
  2: { 'Group 1': 'r2-group-1-pts', 'Group 2': 'r2-group-2-pts', 'Group 3': 'r2-group-3-pts' },
  3: { 'Group 1': 'r3-group-1-pts', 'Group 2': 'r3-group-2-pts', 'Group 3': 'r3-group-3-pts' },
  4: { 'Group 1': 'r4-group-1-pts', 'Group 2': 'r4-group-2-pts', 'Group 3': 'r4-group-3-pts' },
};

function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Simulate R1 stableford positions for all 12 players.
 * Returns 10,000 arrays of per-player R1 points.
 */
function simulateR1(): Map<string, number[]> {
  const players = Object.entries(HANDICAPS).map(([name, hc]) => ({
    name: name.toLowerCase(),
    hc,
  }));

  const result = new Map<string, number[]>();
  players.forEach((p) => result.set(p.name, []));

  for (let i = 0; i < SIMS; i++) {
    // Generate scores (lower handicap = better = higher strength)
    const scores = players.map((p) => ({
      name: p.name,
      score: -p.hc + gaussianRandom() * 5, // negative HC so lower HC = higher score
    }));
    scores.sort((a, b) => b.score - a.score); // best first

    for (let pos = 0; pos < scores.length; pos++) {
      result.get(scores[pos].name)!.push(R1_POSITION_POINTS[pos] ?? 0);
    }
  }

  return result;
}

/**
 * Convert a match SimResult into points for each player in that match.
 */
function matchResultToPoints(
  sim: SimResult,
  teamANames: string[],
  teamBNames: string[],
  round: number
): Map<string, number> {
  const points = new Map<string, number>();
  const baseWin = round === 4 ? 4 : 6;
  const baseHalve = round === 4 ? 2 : 3;

  if (sim.winner === 'a') {
    const pts = baseWin + 0.5 * sim.margin;
    teamANames.forEach((n) => points.set(n, pts));
    teamBNames.forEach((n) => points.set(n, 0));
  } else if (sim.winner === 'b') {
    const pts = baseWin + 0.5 * sim.margin;
    teamBNames.forEach((n) => points.set(n, pts));
    teamANames.forEach((n) => points.set(n, 0));
  } else {
    [...teamANames, ...teamBNames].forEach((n) => points.set(n, baseHalve));
  }
  return points;
}

export interface LeaderboardRow {
  player_name: string;
  round_1_points: number | null;
  round_2_points: number | null;
  round_3_points: number | null;
  round_4_points: number | null;
  total_points: number | null;
}

export interface PointsSimResult {
  // Per player: 10,000 simulated total trip points
  playerTotals: Map<string, number[]>;
  // Per player per round: 10,000 simulated round points (only for incomplete rounds)
  playerRoundPoints: Map<string, Map<number, number[]>>;
  // Which rounds are complete
  completedRounds: Set<number>;
}

/**
 * Main simulation function.
 * Returns distributions of total trip points for each player.
 */
export function simulatePoints(
  leaderboard: LeaderboardRow[],
  matches: MatchDefinition[]
): PointsSimResult {
  const allPlayers = Object.keys(HANDICAPS).map((n) => n.toLowerCase());

  // Determine completed rounds
  const completedRounds = new Set<number>();
  const roundKeys = [
    { round: 1, key: 'round_1_points' as const },
    { round: 2, key: 'round_2_points' as const },
    { round: 3, key: 'round_3_points' as const },
    { round: 4, key: 'round_4_points' as const },
  ];

  for (const { round, key } of roundKeys) {
    const hasData = leaderboard.some((r) => r[key] !== null && r[key] !== undefined);
    if (hasData) completedRounds.add(round);
  }

  // Get actual points for completed rounds
  const actualPoints = new Map<string, number>();
  for (const row of leaderboard) {
    const name = row.player_name.toLowerCase();
    let pts = 0;
    if (completedRounds.has(1) && row.round_1_points != null) pts += Number(row.round_1_points);
    if (completedRounds.has(2) && row.round_2_points != null) pts += Number(row.round_2_points);
    if (completedRounds.has(3) && row.round_3_points != null) pts += Number(row.round_3_points);
    if (completedRounds.has(4) && row.round_4_points != null) pts += Number(row.round_4_points);
    actualPoints.set(name, pts);
  }

  // Register matches and get sims for incomplete rounds
  for (const match of matches) {
    registerMatchFromDefinition(match);
  }

  // Simulate R1 if not complete
  const r1Sims = !completedRounds.has(1) ? simulateR1() : null;

  // Get match sims for incomplete match-play rounds
  const roundMatchSims: Map<number, { match: MatchDefinition; sims: SimResult[]; config: ReturnType<typeof getMatchConfig> }[]> = new Map();
  for (const round of [2, 3, 4]) {
    if (completedRounds.has(round)) continue;
    const roundMatches = matches.filter((m) => m.round === round);
    const matchData = roundMatches.map((m) => ({
      match: m,
      sims: getMatchSims(m.slugPrefix),
      config: getMatchConfig(m.slugPrefix),
    }));
    roundMatchSims.set(round, matchData);
  }

  // Build per-player distributions
  const playerTotals = new Map<string, number[]>();
  const playerRoundPoints = new Map<string, Map<number, number[]>>();

  for (const player of allPlayers) {
    playerTotals.set(player, []);
    playerRoundPoints.set(player, new Map());
    for (const round of [1, 2, 3, 4]) {
      if (!completedRounds.has(round)) {
        playerRoundPoints.get(player)!.set(round, []);
      }
    }
  }

  for (let i = 0; i < SIMS; i++) {
    for (const player of allPlayers) {
      let total = actualPoints.get(player) ?? 0;

      // R1
      if (!completedRounds.has(1) && r1Sims) {
        const r1pts = r1Sims.get(player)?.[i] ?? 0;
        total += r1pts;
        playerRoundPoints.get(player)!.get(1)!.push(r1pts);
      }

      // R2, R3, R4
      for (const round of [2, 3, 4] as const) {
        if (completedRounds.has(round)) continue;
        const matchData = roundMatchSims.get(round);
        if (!matchData) continue;

        let roundPts = 0;
        for (const { sims, config } of matchData) {
          if (!config || sims.length === 0) continue;
          const sim = sims[i % sims.length];
          const pts = matchResultToPoints(sim, config.teamANames, config.teamBNames, round);
          const playerPts = pts.get(player);
          if (playerPts !== undefined) {
            roundPts += playerPts;
          }
        }
        total += roundPts;
        playerRoundPoints.get(player)!.get(round)!.push(roundPts);
      }

      playerTotals.get(player)!.push(total);
    }
  }

  return { playerTotals, playerRoundPoints, completedRounds };
}

/**
 * Calculate O/U line and odds from a distribution of values.
 */
export function calculateLineOdds(values: number[]): { line: number; overOdds: number; underOdds: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  // Use .5 line near median for no push
  const line = Math.round(median * 2) / 2 - 0.5;

  const overCount = values.filter((v) => v > line).length;
  const underCount = values.filter((v) => v < line).length;
  const decided = overCount + underCount;

  const toOdds = (count: number) => {
    const raw = Math.max(1.01, (decided / (count || 1)) / HOUSE_EDGE);
    if (raw >= 10) return Math.round(raw);
    if (raw >= 5) return parseFloat((Math.round(raw * 2) / 2).toFixed(2));
    return parseFloat((Math.round(raw * 20) / 20).toFixed(2));
  };

  return {
    line,
    overOdds: toOdds(overCount),
    underOdds: toOdds(underCount),
  };
}
