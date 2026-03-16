'use client';

import { useState, useEffect, useRef } from 'react';
import { BetSlipItem } from '@/lib/types';
import { formatCurrency } from '@/lib/exposure';
import { createClient } from '@/lib/supabase/client';

// Top = good finish, Bottom = bad finish
const TOP_SLUGS = ['trip-champion', 'overall-top-3', 'friday-stableford-winner', 'friday-top-3', 'friday-top-4', 'friday-top-half'];
const BOTTOM_SLUGS = ['wooden-spoon', 'overall-bottom-3', 'friday-bottom-half', 'friday-bottom-4', 'friday-last-place'];

// Correlated groups -- odds get discounted when combined
const CORRELATED_GROUPS = [
  ['trip-champion', 'overall-top-3', 'winning-team'],
  ['wooden-spoon', 'overall-bottom-3'],
  ['friday-stableford-winner', 'friday-top-3', 'friday-top-4', 'friday-top-half', 'friday-best-team', 'friday-best-of-group'],
  ['friday-bottom-half', 'friday-bottom-4', 'friday-last-place'],
  ['winning-team', 'group-1-total-points', 'group-2-total-points', 'group-3-total-points'],
];

// Implication pairs: if the first slug's selection wins, the second slug's selection is guaranteed
// [harder market slug suffix, easier market slug suffix]
// These are within the same match/event -- matched by slug prefix
const SAME_MATCH_IMPLICATIONS: [string, string][] = [
  ['-line', '-h2h'],      // covering the line guarantees winning h2h
  ['-margin', '-h2h'],    // winning margin over guarantees h2h win (contextual)
];

// Cross-market implications: [harder slug, easier slug] where same player selected
const CROSS_IMPLICATIONS: [string, string][] = [
  ['friday-stableford-winner', 'friday-top-3'],
  ['friday-stableford-winner', 'friday-top-4'],
  ['friday-stableford-winner', 'friday-top-half'],
  ['friday-top-3', 'friday-top-4'],
  ['friday-top-3', 'friday-top-half'],
  ['friday-top-4', 'friday-top-half'],
  ['friday-last-place', 'friday-bottom-4'],
  ['friday-last-place', 'friday-bottom-half'],
  ['friday-bottom-4', 'friday-bottom-half'],
  ['trip-champion', 'overall-top-3'],
  ['wooden-spoon', 'overall-bottom-3'],
];

// Partial correlation discount for related-but-not-implied legs
const PARTIAL_CORRELATION = 0.80;
const PARTIAL_GROUPS = [
  ['winning-team', 'group-1-total-points', 'group-2-total-points', 'group-3-total-points'],
  ['trip-champion', 'winning-team'],
  ['friday-best-team', 'friday-best-of-group'],
];

function getMatchPrefix(slug: string): string | null {
  // r2-m1-h2h -> r2-m1, r4-hugo-jacko-h2h -> r4-hugo-jacko
  const m = slug.match(/^(r[234]-m\d)/);
  if (m) return m[1];
  const r4 = slug.match(/^(r4-[a-z]+-[a-z]+)-/);
  return r4 ? r4[1] : null;
}

function getConflict(items: BetSlipItem[]): string | null {
  // Check if a player is picked for both a top AND bottom market
  for (const a of items) {
    for (const b of items) {
      if (a === b) continue;
      const aIsTop = TOP_SLUGS.includes(a.market.slug);
      const bIsBottom = BOTTOM_SLUGS.includes(b.market.slug);
      if (aIsTop && bIsBottom && a.selection.name === b.selection.name) {
        return `${a.selection.name} can't both ${a.market.title.toLowerCase()} and ${b.market.title.toLowerCase()}`;
      }
      if (bIsBottom && aIsTop && b.selection.name === a.selection.name) continue; // already caught
      // Reverse check
      const aIsBottom = BOTTOM_SLUGS.includes(a.market.slug);
      const bIsTop = TOP_SLUGS.includes(b.market.slug);
      if (aIsBottom && bIsTop && a.selection.name === b.selection.name) {
        return `${a.selection.name} can't both ${b.market.title.toLowerCase()} and ${a.market.title.toLowerCase()}`;
      }
    }
  }
  return null;
}

function calculateMultiOdds(items: BetSlipItem[]): { raw: number; adjusted: number; isCorrelated: boolean; droppedLegs: string[] } {
  const raw = items.reduce((acc, item) => acc * Number(item.selection.odds_decimal), 1);
  if (items.length < 2) return { raw, adjusted: raw, isCorrelated: false, droppedLegs: [] };

  // Build list of effective legs after removing implied ones
  const dropped = new Set<string>(); // selection IDs of legs that are implied by another

  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (i === j || dropped.has(items[i].selection.id) || dropped.has(items[j].selection.id)) continue;

      const a = items[i];
      const b = items[j];

      // Check same-match implications (line implies h2h etc)
      const prefixA = getMatchPrefix(a.market.slug);
      const prefixB = getMatchPrefix(b.market.slug);
      if (prefixA && prefixB && prefixA === prefixB) {
        const suffixA = a.market.slug.replace(prefixA, '');
        const suffixB = b.market.slug.replace(prefixB, '');
        for (const [harder, easier] of SAME_MATCH_IMPLICATIONS) {
          // If a is the harder bet and b is the easier, b is implied
          if (suffixA === harder && suffixB === easier) {
            dropped.add(b.selection.id);
          }
          if (suffixB === harder && suffixA === easier) {
            dropped.add(a.selection.id);
          }
        }
      }

      // Check cross-market implications (winner implies top 3 etc)
      // Only applies when same player/team is selected in both
      if (a.selection.name === b.selection.name) {
        for (const [harder, easier] of CROSS_IMPLICATIONS) {
          if (a.market.slug === harder && b.market.slug === easier) {
            dropped.add(b.selection.id);
          }
          if (b.market.slug === harder && a.market.slug === easier) {
            dropped.add(a.selection.id);
          }
        }
      }
    }
  }

  // Calculate odds from effective legs only
  const effectiveLegs = items.filter((item) => !dropped.has(item.selection.id));
  let adjusted = effectiveLegs.reduce((acc, item) => acc * Number(item.selection.odds_decimal), 1);

  // Apply partial correlation discount for remaining related legs
  const effectiveSlugs = effectiveLegs.map((i) => i.market.slug);
  let partialCount = 0;
  for (const group of PARTIAL_GROUPS) {
    const matches = effectiveSlugs.filter((s) => group.includes(s));
    if (matches.length >= 2) partialCount += matches.length - 1;
  }
  // Same match legs that weren't dropped (e.g. h2h + total holes)
  const effectivePrefixes = effectiveLegs.map((i) => getMatchPrefix(i.market.slug)).filter(Boolean);
  const prefixCounts: Record<string, number> = {};
  effectivePrefixes.forEach((p) => { prefixCounts[p!] = (prefixCounts[p!] || 0) + 1; });
  Object.values(prefixCounts).forEach((c) => { if (c >= 2) partialCount += c - 1; });

  if (partialCount > 0) {
    adjusted *= Math.pow(PARTIAL_CORRELATION, partialCount);
  }

  const droppedLegs = items
    .filter((item) => dropped.has(item.selection.id))
    .map((item) => item.market.title);

  return {
    raw,
    adjusted: parseFloat(adjusted.toFixed(2)),
    isCorrelated: dropped.size > 0 || partialCount > 0,
    droppedLegs,
  };
}

interface BetSlipProps {
  items: BetSlipItem[];
  onRemove: (selectionId: string) => void;
  onClear: () => void;
  onBetPlaced: () => void;
}

export function BetSlip({ items, onRemove, onClear, onBetPlaced }: BetSlipProps) {
  const [bettorName, setBettorName] = useState('');
  const [mode, setMode] = useState<'singles' | 'multi'>('singles');
  const [singleStakes, setSingleStakes] = useState<Record<string, string>>({});
  const [multiStake, setMultiStake] = useState('');
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevCount = useRef(items.length);

  const conflict = items.length >= 2 ? getConflict(items) : null;
  const canMulti = items.length >= 2 && !conflict;

  useEffect(() => {
    if (items.length >= 2 && prevCount.current < 2 && !getConflict(items)) {
      setMode('multi');
    }
    if (items.length < 2 || getConflict(items)) {
      setMode('singles');
    }
    prevCount.current = items.length;
  }, [items]);

  if (items.length === 0 && !confirmation) return null;

  if (confirmation) {
    return (
      <div className="bg-navy-card border border-white/[0.08] rounded-lg p-5 text-center">
        <div className="text-green-bright font-bold text-base mb-2">Bet Placed</div>
        <p className="text-white/50 text-sm mb-4">{confirmation}</p>
        <button
          onClick={() => { setConfirmation(null); onClear(); }}
          className="px-5 py-2 rounded-lg bg-green-accent text-white font-medium text-sm hover:bg-green-bright transition-colors"
        >
          Done
        </button>
      </div>
    );
  }
  const getSingleStake = (id: string) => parseFloat(singleStakes[id] || '0') || 0;
  const multiStakeNum = parseFloat(multiStake || '0') || 0;

  const { raw: rawMultiOdds, adjusted: multiOdds, isCorrelated, droppedLegs } = canMulti
    ? calculateMultiOdds(items)
    : { raw: 1, adjusted: 1, isCorrelated: false, droppedLegs: [] as string[] };
  const multiPayout = multiStakeNum * multiOdds;

  const singlesTotalStake = items.reduce((s, item) => s + getSingleStake(item.selection.id), 0);
  const singlesTotalReturn = items.reduce((s, item) => {
    return s + getSingleStake(item.selection.id) * Number(item.selection.odds_decimal);
  }, 0);

  const handlePlaceBets = async () => {
    if (!bettorName.trim()) { setError('Enter your name'); return; }

    if (mode === 'singles' && singlesTotalStake <= 0) { setError('Enter a stake'); return; }
    if (mode === 'multi' && multiStakeNum <= 0) { setError('Enter a stake'); return; }

    setPlacing(true);
    setError(null);
    const supabase = createClient();

    try {
      if (mode === 'singles') {
        const bets = items
          .filter((item) => getSingleStake(item.selection.id) > 0)
          .map((item) => {
            const stake = getSingleStake(item.selection.id);
            return {
              bettor_name: bettorName.trim(),
              market_id: item.market.id,
              selection_id: item.selection.id,
              stake,
              odds_taken: Number(item.selection.odds_decimal),
              potential_payout: parseFloat((stake * Number(item.selection.odds_decimal)).toFixed(2)),
              status: 'pending' as const,
              bet_type: 'single',
            };
          });

        const { error: insertError } = await supabase.from('bets').insert(bets);
        if (insertError) throw insertError;

        setConfirmation(
          `${bets.length} single${bets.length > 1 ? 's' : ''} placed. Stake: ${formatCurrency(singlesTotalStake)}.`
        );
      } else {
        // Multi bet
        const { data: bet, error: betError } = await supabase
          .from('bets')
          .insert({
            bettor_name: bettorName.trim(),
            market_id: items[0].market.id,
            selection_id: items[0].selection.id,
            stake: multiStakeNum,
            odds_taken: parseFloat(multiOdds.toFixed(2)),
            potential_payout: parseFloat(multiPayout.toFixed(2)),
            status: 'pending',
            bet_type: 'multi',
            multi_odds: parseFloat(multiOdds.toFixed(2)),
          })
          .select()
          .single();

        if (betError) throw betError;

        // Insert legs
        const legs = items.map((item) => ({
          bet_id: bet.id,
          market_id: item.market.id,
          selection_id: item.selection.id,
          market_title: item.market.title,
          selection_name: item.selection.name,
          odds_taken: Number(item.selection.odds_decimal),
        }));

        const { error: legsError } = await supabase.from('bet_legs').insert(legs);
        if (legsError) throw legsError;

        setConfirmation(
          `${items.length}-leg multi placed at ${multiOdds.toFixed(2)}. Stake: ${formatCurrency(multiStakeNum)}, return: ${formatCurrency(multiPayout)}.`
        );
      }

      setSingleStakes({});
      setMultiStake('');
      onBetPlaced();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bets');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="bg-navy-card border border-white/[0.08] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-white font-bold text-sm">Bet Slip</span>
        <button onClick={onClear} className="text-[11px] text-white/30 hover:text-white/50">Clear</button>
      </div>

      {/* Mode toggle */}
      {canMulti && (
        <div className="px-4 pt-3 flex gap-1">
          <button
            onClick={() => setMode('singles')}
            className={`flex-1 py-1.5 rounded text-[12px] font-medium transition-colors ${
              mode === 'singles' ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/50'
            }`}
          >
            Singles
          </button>
          <button
            onClick={() => setMode('multi')}
            className={`flex-1 py-1.5 rounded text-[12px] font-medium transition-colors ${
              mode === 'multi' ? 'bg-green-bright/20 text-green-bright' : 'text-white/30 hover:text-white/50'
            }`}
          >
            Multi ({items.length} legs)
          </button>
        </div>
      )}

      {conflict && (
        <div className="px-4 py-2 text-[11px] text-danger bg-danger/[0.06]">
          Multi unavailable -- {conflict}
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Legs */}
        {items.map((item) => (
          <div key={item.selection.id}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="min-w-0">
                <div className="text-[13px] text-white font-medium">{item.selection.name}</div>
                <div className="text-[11px] text-white/30">{item.market.title}</div>
              </div>
              <span className="text-green-bright font-bold text-[13px] ml-3">
                ${Number(item.selection.odds_decimal).toFixed(2)}
              </span>
            </div>
            {mode === 'singles' && (
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                  <input
                    type="number" min="0" step="1"
                    value={singleStakes[item.selection.id] || ''}
                    onChange={(e) => setSingleStakes((p) => ({ ...p, [item.selection.id]: e.target.value }))}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-1.5 rounded bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-green-bright/50"
                  />
                </div>
                {getSingleStake(item.selection.id) > 0 && (
                  <span className="text-[11px] text-white/35 shrink-0">
                    {formatCurrency(getSingleStake(item.selection.id) * Number(item.selection.odds_decimal))}
                  </span>
                )}
                <button onClick={() => onRemove(item.selection.id)} className="text-[10px] text-white/20 hover:text-white/40 shrink-0">
                  remove
                </button>
              </div>
            )}
            {mode === 'multi' && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/20">Leg {items.indexOf(item) + 1}</span>
                <button onClick={() => onRemove(item.selection.id)} className="text-[10px] text-white/20 hover:text-white/40">
                  remove
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Multi combined odds + stake */}
        {mode === 'multi' && (
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-white/50">Combined Odds</span>
              <span className="text-[14px] text-green-bright font-bold">${multiOdds.toFixed(2)}</span>
            </div>
            {isCorrelated && (
              <div className="text-[10px] text-gold/60 mb-2">
                {droppedLegs.length > 0
                  ? `${droppedLegs.length} implied leg${droppedLegs.length > 1 ? 's' : ''} absorbed -- odds adjusted`
                  : 'Correlated legs -- odds adjusted'}
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                <input
                  type="number" min="0" step="1"
                  value={multiStake}
                  onChange={(e) => setMultiStake(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 rounded bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-green-bright/50"
                />
              </div>
              {multiStakeNum > 0 && (
                <span className="text-[12px] text-white/40 shrink-0">
                  Returns {formatCurrency(multiPayout)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Name */}
        <input
          type="text"
          value={bettorName}
          onChange={(e) => setBettorName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 rounded bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-green-bright/50"
        />

        {/* Total for singles */}
        {mode === 'singles' && singlesTotalStake > 0 && (
          <div className="flex justify-between text-sm pt-1">
            <span className="text-white/40">Returns</span>
            <span className="text-green-bright font-bold">{formatCurrency(singlesTotalReturn)}</span>
          </div>
        )}

        {error && <div className="text-[11px] text-danger">{error}</div>}

        {/* Place button */}
        <button
          onClick={handlePlaceBets}
          disabled={placing || (mode === 'singles' ? singlesTotalStake <= 0 : multiStakeNum <= 0)}
          className="w-full py-2.5 rounded-lg bg-green-accent text-white font-bold text-sm hover:bg-green-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {placing
            ? 'Placing...'
            : mode === 'multi'
              ? `Place Multi -- ${formatCurrency(multiStakeNum)}`
              : `Place Bet${singlesTotalStake > 0 ? ` -- ${formatCurrency(singlesTotalStake)}` : ''}`}
        </button>

        <p className="text-[10px] text-white/20 leading-relaxed">
          By placing this bet you agree to pay MattBet in full on any losing bets. All bets are final -- non-cancellable, non-editable, and involve real money.
        </p>
        <p className="text-[10px] text-white/15 italic text-center">
          Imagine what you could be buying instead.
        </p>
      </div>
    </div>
  );
}
