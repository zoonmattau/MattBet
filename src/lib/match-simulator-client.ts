/**
 * Client-side functions for generating alternate line/total odds from simulation.
 * Uses the same sim engine but exposes functions for dynamic line selection.
 */

import { SimResult } from './match-simulator';

// Re-export for client use
export type { SimResult };

const HOUSE_EDGE = 1.05;

function toOdds(count: number, total: number): number {
  const raw = Math.max(1.01, (total / count) / HOUSE_EDGE);
  if (raw >= 1001) return 1001;
  if (raw >= 10) return Math.round(raw);
  if (raw >= 5) return parseFloat((Math.round(raw * 2) / 2).toFixed(2));
  return parseFloat((Math.round(raw * 20) / 20).toFixed(2));
}

export function getAlternateLineOdds(
  sims: SimResult[],
  lineValue: number,
  favSide: 'a' | 'b'
): { fav: number; dog: number } {
  const isHalf = lineValue % 1 !== 0;
  // -1.5: fav wins by 2+ (margin >= 2). Dog covers if margin <= 1. No push.
  // -2: fav wins by 3+ (margin >= 3). Dog covers if margin <= 1 or fav loses/halves. Margin exactly 2 = PUSH.
  // -2.5: fav wins by 3+ (margin >= 3). Dog covers if margin <= 2. No push.
  const favCovers = sims.filter((s) => {
    const wins = favSide === 'a' ? s.winner === 'a' : s.winner === 'b';
    if (!wins) return false;
    // Fav covers if margin strictly exceeds the line
    return s.margin > lineValue;
  }).length;
  const dogCovers = sims.filter((s) => {
    const loses = favSide === 'a' ? s.winner === 'b' : s.winner === 'a';
    if (loses) return true;
    if (s.winner === 'halved') return true;
    // Fav wins: dog covers if margin is below the line (not equal for whole numbers)
    const wins = favSide === 'a' ? s.winner === 'a' : s.winner === 'b';
    if (wins) return s.margin < lineValue;
    return false;
  }).length;
  // Push count (whole numbers only): fav wins with margin exactly on the line
  // These are excluded from both sides - odds based on decided outcomes only

  return {
    fav: toOdds(favCovers || 1, favCovers + dogCovers || 1),
    dog: toOdds(dogCovers || 1, favCovers + dogCovers || 1),
  };
}

export function getAlternateTotalOdds(
  sims: SimResult[],
  totalValue: number,
  team: 'a' | 'b'
): { over: number; under: number } {
  const n = sims.length;
  const getHoles = (s: SimResult) => team === 'a' ? s.holesWonA : s.holesWonB;
  const overCount = sims.filter((s) => getHoles(s) > totalValue).length;
  const underCount = sims.filter((s) => getHoles(s) < totalValue).length;
  // For whole numbers, push (exactly on the line) excluded from both sides
  // For .5 numbers, no push possible

  return {
    over: toOdds(overCount || 1, overCount + underCount || 1),
    under: toOdds(underCount || 1, overCount + underCount || 1),
  };
}
