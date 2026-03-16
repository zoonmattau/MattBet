/**
 * Same-match multi pricing engine.
 *
 * For every pair of selections from the same match, determines:
 * - 'conflict': impossible combo, block multi
 * - 'absorb': one implies the other, pay the harder leg only
 * - 'correlated': positively correlated, discount the multiply
 * - 'anti': negatively correlated (hard combo), boost the multiply
 * - 'independent': straight multiply (rare for same-match)
 */

import { BetSlipItem, Market, MarketSelection } from './types';

type LegType =
  | { kind: 'h2h'; side: 'a' | 'b' | 'halved' }
  | { kind: 'line'; side: 'fav' | 'dog'; team: 'a' | 'b' }
  | { kind: 'margin'; dir: 'over' | 'under' }
  | { kind: 'total'; team: 'a' | 'b'; dir: 'over' | 'under' };

type PairResult =
  | { action: 'conflict'; reason: string }
  | { action: 'absorb'; keepIndex: number } // keep the harder leg
  | { action: 'multiply'; factor: number }; // multiply individual odds by this factor (< 1 = correlated, > 1 = anti)

function getMatchPrefix(slug: string): string | null {
  const m = slug.match(/^(r[234]-m\d)/);
  if (m) return m[1];
  const r4 = slug.match(/^(r4-[a-z]+-[a-z]+)/);
  return r4 ? r4[1] : null;
}

// Get the team names from the H2H market (team A = first non-halved selection)
function getTeamNames(matchItems: BetSlipItem[]): { teamAName: string; teamBName: string } | null {
  const h2hItem = matchItems.find((i) => i.market.slug.includes('-h2h'));
  if (!h2hItem || !h2hItem.market.selections) return null;
  const sels = [...h2hItem.market.selections]
    .filter((s) => s.name.toLowerCase() !== 'halved')
    .sort((a, b) => a.sort_order - b.sort_order);
  if (sels.length < 2) return null;
  return { teamAName: sels[0].name.toLowerCase(), teamBName: sels[1].name.toLowerCase() };
}

// Check if a selection name belongs to team A or B by matching against H2H team names
function whichTeam(selName: string, teams: { teamAName: string; teamBName: string }): 'a' | 'b' {
  const name = selName.toLowerCase();
  // Extract first name before any slash, space+number, or +/-
  const clean = name.replace(/[\/].*/, '').replace(/\s*[+-].*/, '').trim();
  const teamAFirst = teams.teamAName.split(/\s+and\s+/)[0];
  const teamBFirst = teams.teamBName.split(/\s+and\s+/)[0];
  if (clean.includes(teamAFirst)) return 'a';
  if (clean.includes(teamBFirst)) return 'b';
  // Fallback: check if full name contains either
  if (name.includes(teamAFirst)) return 'a';
  return 'b';
}

function classifyLeg(item: BetSlipItem, matchPrefix: string, matchItems: BetSlipItem[]): LegType | null {
  const slug = item.market.slug;
  const name = item.selection.name.toLowerCase();
  const teams = getTeamNames(matchItems);

  if (slug.includes('-h2h')) {
    if (name === 'halved') return { kind: 'h2h', side: 'halved' };
    if (teams) {
      return { kind: 'h2h', side: whichTeam(name, teams) };
    }
    const sels = (item.market.selections || []).filter(s => s.name.toLowerCase() !== 'halved').sort((a, b) => a.sort_order - b.sort_order);
    return { kind: 'h2h', side: name === sels[0]?.name.toLowerCase() ? 'a' : 'b' };
  }

  if (slug.includes('-line')) {
    const isMinus = name.includes('-');
    const team = teams ? whichTeam(name, teams) : 'a';
    return { kind: 'line', side: isMinus ? 'fav' : 'dog', team };
  }


  if (slug.includes('-total')) {
    const dir = name.startsWith('over') ? 'over' : 'under';
    // Determine team from the market title
    if (teams) {
      const title = item.market.title.toLowerCase();
      const teamAFirst = teams.teamAName.split(/\s+and\s+/)[0];
      const teamBFirst = teams.teamBName.split(/\s+and\s+/)[0];
      if (title.includes(teamAFirst)) return { kind: 'total', team: 'a', dir };
      if (title.includes(teamBFirst)) return { kind: 'total', team: 'b', dir };
    }
    // Fallback: use slug
    const suffix = slug.replace(matchPrefix + '-', '').replace('-total', '');
    return { kind: 'total', team: suffix < 'm' ? 'a' : 'b', dir };
  }

  return null;
}

// Get the numeric value from a selection name like "Over 7.5" or "Jackson/Finn -1.5"
function getNumericValue(name: string): number | null {
  const m = name.match(/[+-]?\d+\.?\d*/);
  return m ? Math.abs(parseFloat(m[0])) : null;
}

// In match play, if a player wins X holes, worst case deficit = totalHoles - 2X
// totalHoles = 18 for full rounds, 14 for Bougle Run (round 3)
function overImpliesLine(overThreshold: number, lineValue: number, totalHoles: number = 18): boolean {
  const minHolesWon = Math.ceil(overThreshold);
  const worstDeficit = totalHoles - 2 * minHolesWon;
  return worstDeficit <= lineValue;
}

function underImpliesLine(underThreshold: number, lineValue: number, totalHoles: number = 18): boolean {
  // Under T means winning fewer than ceil(T) holes
  // Max holes won = floor(T)
  // If they win at most floor(T), best case margin for opponent = totalHoles - 2*floor(T)
  // This means opponent wins by at least totalHoles - 2*floor(T)
  // For opponent's -line: does their under guarantee opponent covers -line?
  const maxHolesWon = Math.floor(underThreshold);
  const minOpponentMargin = totalHoles - 2 * maxHolesWon;
  return minOpponentMargin >= lineValue;
}

// The truth table for every pair
function pricePair(leg1: LegType, leg2: LegType, odds1: number, odds2: number, sel1Name?: string, sel2Name?: string): PairResult {
  const k1 = leg1.kind;
  const k2 = leg2.kind;

  // === H2H + LINE ===
  if (k1 === 'h2h' && k2 === 'line') {
    const h2hTeam = leg1.side; // 'a', 'b', or 'halved'
    const lineTeam = leg2.team; // which team the line is for
    const isMinus = leg2.side === 'fav';
    const sameTeam = h2hTeam === lineTeam;

    if (h2hTeam === 'halved') {
      if (isMinus) {
        return { action: 'conflict', reason: "Halved and a minus line can't both win" };
      } else {
        // Halved guarantees any +line. Absorb +line.
        return { action: 'absorb', keepIndex: 0 };
      }
    }

    if (sameTeam && isMinus) {
      // Team wins + same team covers -line. Line is harder. Absorb H2H.
      return { action: 'absorb', keepIndex: 1 };
    }
    if (sameTeam && !isMinus) {
      // Team wins + same team's +line. +line is guaranteed if they win. Absorb +line.
      return { action: 'absorb', keepIndex: 0 };
    }
    if (!sameTeam && isMinus) {
      // Team wins + OTHER team covers -line = IMPOSSIBLE (both can't win)
      return { action: 'conflict', reason: "One side can't win while the other covers the minus line" };
    }
    if (!sameTeam && !isMinus) {
      // Team wins + other team's +line = winner wins by exactly 1. Specific outcome.
      return { action: 'multiply', factor: 1.8 };
    }
  }


  // === H2H + TOTAL (same side) ===
  if (k1 === 'h2h' && k2 === 'total' && ((leg1.side === 'a' && leg2.team === 'a') || (leg1.side === 'b' && leg2.team === 'b'))) {
    if (leg2.dir === 'over') {
      // Winner + their over = they dominate. Over is the binding constraint.
      return { action: 'multiply', factor: 0.55 }; // heavy correlation, over nearly implies winning
    }
    if (leg2.dir === 'under') {
      // Winner + their under = win ugly. Anti-correlated.
      return { action: 'multiply', factor: 1.3 };
    }
  }

  // === H2H + TOTAL (opposite side) ===
  if (k1 === 'h2h' && k2 === 'total' && ((leg1.side === 'a' && leg2.team === 'b') || (leg1.side === 'b' && leg2.team === 'a'))) {
    if (leg2.dir === 'under') {
      // Winner + loser's under = almost implied. Barely moves the price.
      return { action: 'multiply', factor: 0.52 };
    }
    if (leg2.dir === 'over') {
      // Winner + loser gets lots of holes = competitive loss. Genuine multi.
      return { action: 'multiply', factor: 0.85 };
    }
  }

  // === HALVED + TOTAL ===
  if (k1 === 'h2h' && leg1.side === 'halved' && k2 === 'total') {
    // Halved + either total = genuine multi, moderate correlation
    return { action: 'multiply', factor: 0.8 };
  }


  // === LINE + TOTAL ===
  if (k1 === 'line' && k2 === 'total') {
    const lineTeam = leg1.team;
    const sameTeam = lineTeam === leg2.team;
    const lineVal = sel1Name ? getNumericValue(sel1Name) : null;
    const totalVal = sel2Name ? getNumericValue(sel2Name) : null;

    if (lineVal !== null && totalVal !== null) {
      if (leg1.side === 'fav' && sameTeam) {
        // Fav -line + same team total
        if (leg2.dir === 'over') {
          // Fav over implies -line? Check: if they win ceil(T) holes, worst case opponent wins 18-ceil(T)
          // Their margin = ceil(T) - (18-ceil(T)) = 2*ceil(T) - 18. Covers -L if 2*ceil(T)-18 >= L
          const minMargin = 2 * Math.ceil(totalVal) - 18;
          if (minMargin >= lineVal) return { action: 'absorb', keepIndex: 1 }; // over implies line
          return { action: 'multiply', factor: 0.6 }; // correlated but not implied
        }
        if (leg2.dir === 'under') return { action: 'multiply', factor: 1.4 }; // anti: win big but few holes
      }

      if (leg1.side === 'fav' && !sameTeam) {
        // Fav -line + opponent total
        if (leg2.dir === 'under') {
          // Opponent under = opponent gets few holes, correlated with fav covering
          if (underImpliesLine(totalVal, lineVal)) return { action: 'absorb', keepIndex: 0 }; // under implies fav covers
          return { action: 'multiply', factor: 0.6 };
        }
        if (leg2.dir === 'over') return { action: 'multiply', factor: 1.4 }; // anti: opponent lots but fav still covers
      }

      if (leg1.side === 'dog' && sameTeam) {
        // Dog +line + same team total
        if (leg2.dir === 'over') {
          // Dog gets lots of holes + covers. Check if over implies +line
          if (overImpliesLine(totalVal, lineVal)) return { action: 'absorb', keepIndex: 1 }; // over implies +line
          return { action: 'multiply', factor: 0.65 }; // correlated but not fully implied
        }
        if (leg2.dir === 'under') return { action: 'multiply', factor: 1.3 }; // anti: few holes but still covers
      }

      if (leg1.side === 'dog' && !sameTeam) {
        // Dog +line + opponent total
        if (leg2.dir === 'under') {
          // Opponent few holes + dog covers = correlated
          return { action: 'multiply', factor: 0.6 };
        }
        if (leg2.dir === 'over') {
          // Opponent lots of holes + dog covers = anti-correlated
          // Check if it's actually impossible: if opponent gets ceil(T) holes, margin = 2*ceil(T)-18
          const opponentMinMargin = 2 * Math.ceil(totalVal) - 18;
          if (opponentMinMargin > lineVal) {
            return { action: 'conflict', reason: "Opponent can't win that many holes while the dog covers the line" };
          }
          return { action: 'multiply', factor: 1.4 };
        }
      }
    }

    // Fallback if we can't read the values
    return { action: 'multiply', factor: 0.85 };
  }


  // === TOTAL A + TOTAL B ===
  if (k1 === 'total' && k2 === 'total' && leg1.team !== leg2.team) {
    if (leg1.dir === 'over' && leg2.dir === 'under') return { action: 'multiply', factor: 0.65 };
    if (leg1.dir === 'under' && leg2.dir === 'over') return { action: 'multiply', factor: 0.65 };
    if (leg1.dir === 'over' && leg2.dir === 'over') return { action: 'multiply', factor: 1.1 };
    if (leg1.dir === 'under' && leg2.dir === 'under') return { action: 'multiply', factor: 0.75 };
  }

  // === TOTAL same team over + under = IMPOSSIBLE ===
  if (k1 === 'total' && k2 === 'total' && leg1.team === leg2.team) {
    return { action: 'conflict', reason: "Can't bet both over and under on the same total" };
  }

  // Default: straight multiply
  return { action: 'multiply', factor: 1.0 };
}

export interface MultiPriceResult {
  odds: number;
  conflict: string | null;
  isCorrelated: boolean;
  absorbed: string[];
}

export function priceSameMatchMulti(
  items: BetSlipItem[],
  allMarkets?: (Market & { selections: MarketSelection[] })[]
): MultiPriceResult {
  // Group items by match prefix
  const byPrefix = new Map<string, BetSlipItem[]>();
  const nonMatch: BetSlipItem[] = [];

  for (const item of items) {
    const prefix = getMatchPrefix(item.market.slug);
    if (prefix) {
      const list = byPrefix.get(prefix) || [];
      list.push(item);
      byPrefix.set(prefix, list);
    } else {
      nonMatch.push(item);
    }
  }

  let combinedOdds = 1;
  const absorbed: string[] = [];
  let isCorrelated = false;

  // Process each match group
  for (const [prefix, matchItems] of byPrefix) {
    if (matchItems.length === 1) {
      combinedOdds *= Number(matchItems[0].selection.odds_decimal);
      continue;
    }

    // Classify all legs
    const classified = matchItems.map((item) => ({
      item,
      leg: classifyLeg(item, prefix, matchItems),
      odds: Number(item.selection.odds_decimal),
    })).filter((c) => c.leg !== null);

    // Check all pairs for conflicts first
    for (let i = 0; i < classified.length; i++) {
      for (let j = i + 1; j < classified.length; j++) {
        const result = pricePair(classified[i].leg!, classified[j].leg!, classified[i].odds, classified[j].odds, classified[i].item.selection.name, classified[j].item.selection.name);
        if (result.action === 'conflict') {
          return { odds: 0, conflict: result.reason, isCorrelated: false, absorbed: [] };
        }
        // Also check reverse
        const reverse = pricePair(classified[j].leg!, classified[i].leg!, classified[j].odds, classified[i].odds, classified[j].item.selection.name, classified[i].item.selection.name);
        if (reverse.action === 'conflict') {
          return { odds: 0, conflict: reverse.reason, isCorrelated: false, absorbed: [] };
        }
      }
    }

    // Now price: process pairs, absorbing and adjusting
    const active = new Set(classified.map((_, idx) => idx));

    for (let i = 0; i < classified.length; i++) {
      if (!active.has(i)) continue;
      for (let j = i + 1; j < classified.length; j++) {
        if (!active.has(j)) continue;

        let result = pricePair(classified[i].leg!, classified[j].leg!, classified[i].odds, classified[j].odds, classified[i].item.selection.name, classified[j].item.selection.name);

        // If no specific rule found forward, try reverse
        if (result.action === 'multiply' && result.factor === 1.0) {
          const reverse = pricePair(classified[j].leg!, classified[i].leg!, classified[j].odds, classified[i].odds, classified[j].item.selection.name, classified[i].item.selection.name);
          if (reverse.action !== 'multiply' || reverse.factor !== 1.0) {
            // Use reverse result but flip the keepIndex
            if (reverse.action === 'absorb') {
              result = { action: 'absorb', keepIndex: reverse.keepIndex === 0 ? 1 : 0 };
            } else {
              result = reverse;
            }
          }
        }

        if (result.action === 'absorb') {
          const dropIdx = result.keepIndex === 0 ? j : i;
          const keepIdx = result.keepIndex === 0 ? i : j;
          active.delete(dropIdx);
          absorbed.push(classified[dropIdx].item.market.title);
          isCorrelated = true;

          // For absorbed legs, look up line odds if applicable
          if (allMarkets) {
            const keepSuffix = classified[keepIdx].item.market.slug.replace(prefix, '');
            if (keepSuffix.includes('-margin') || keepSuffix.includes('-h2h')) {
              // Try to use line odds as the true price
              const dropName = classified[dropIdx].item.selection.name;
              const keepName = classified[keepIdx].item.selection.name;
              const teamName = dropName.toLowerCase() !== 'halved'
                ? dropName.split(' and ')[0].toLowerCase()
                : keepName.split(' and ')[0].toLowerCase();
              const lineSlug = prefix + '-line';
              const lineMarket = allMarkets.find((m) => m.slug === lineSlug);
              if (lineMarket) {
                const lineSel = lineMarket.selections.find((s) =>
                  s.name.toLowerCase().includes(teamName)
                );
                if (lineSel) {
                  classified[keepIdx].odds = Number(lineSel.odds_decimal);
                }
              }
            }
          }
        } else if (result.action === 'multiply' && result.factor !== 1.0) {
          // Adjust the second leg's effective odds
          classified[j].odds = classified[j].odds * result.factor;
          isCorrelated = true;
        }
      }
    }

    // Multiply remaining active legs
    for (const idx of active) {
      combinedOdds *= classified[idx].odds;
    }
  }

  // Add non-match items
  for (const item of nonMatch) {
    combinedOdds *= Number(item.selection.odds_decimal);
  }

  return {
    odds: parseFloat(Math.max(1.01, combinedOdds).toFixed(2)),
    conflict: null,
    isCorrelated,
    absorbed,
  };
}
