'use client';

import { useState, useEffect, useRef } from 'react';
import { BetSlipItem, Market, MarketSelection } from '@/lib/types';
import { formatCurrency } from '@/lib/exposure';
import { createClient } from '@/lib/supabase/client';
import { priceSameMatchMulti } from '@/lib/multi-pricing';
import { calculateSGMOdds } from '@/lib/match-simulator';

// Cross-market implications for non-match markets (winner implies top 3 etc)
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

const TOP_SLUGS = ['trip-champion', 'overall-top-3', 'friday-stableford-winner', 'friday-top-3', 'friday-top-4', 'friday-top-half'];
const BOTTOM_SLUGS = ['wooden-spoon', 'overall-bottom-3', 'friday-bottom-half', 'friday-bottom-4', 'friday-last-place'];

const PARTIAL_GROUPS = [
  ['winning-team', 'group-1-total-points', 'group-2-total-points', 'group-3-total-points'],
  ['trip-champion', 'winning-team'],
  ['friday-best-team', 'friday-best-of-group'],
];

function getNonMatchConflict(items: BetSlipItem[]): string | null {
  for (const a of items) {
    for (const b of items) {
      if (a === b) continue;
      const aIsTop = TOP_SLUGS.includes(a.market.slug);
      const bIsBottom = BOTTOM_SLUGS.includes(b.market.slug);
      if (aIsTop && bIsBottom && a.selection.name === b.selection.name) {
        return `${a.selection.name} can't both ${a.market.title.toLowerCase()} and ${b.market.title.toLowerCase()}`;
      }
      const aIsBottom = BOTTOM_SLUGS.includes(a.market.slug);
      const bIsTop = TOP_SLUGS.includes(b.market.slug);
      if (aIsBottom && bIsTop && a.selection.name === b.selection.name) {
        return `${a.selection.name} can't both ${b.market.title.toLowerCase()} and ${a.market.title.toLowerCase()}`;
      }
    }
  }
  return null;
}

function calculateMultiOdds(items: BetSlipItem[], allMarkets?: (Market & { selections: MarketSelection[] })[]) {
  const raw = items.reduce((acc, item) => acc * Number(item.selection.odds_decimal), 1);
  if (items.length < 2) return { raw, adjusted: raw, isCorrelated: false, droppedLegs: [] as string[], conflict: null as string | null };

  // Try Monte Carlo simulation for same-match combos
  const simResult = calculateSGMOdds(items);

  if (simResult?.conflict) {
    return { raw, adjusted: 0, isCorrelated: true, droppedLegs: [], conflict: simResult.conflict };
  }

  // Start with sim odds if available, otherwise use truth table fallback
  let adjusted: number;
  let baseCorrelated = false;
  let baseAbsorbed: string[] = [];

  if (simResult) {
    adjusted = simResult.odds;
    baseCorrelated = simResult.isCorrelated;
  } else {
    // Fallback: truth table approach for non-match or single-match-leg multis
    const result = priceSameMatchMulti(items, allMarkets);
    if (result.conflict) {
      return { raw, adjusted: 0, isCorrelated: false, droppedLegs: [], conflict: result.conflict };
    }
    adjusted = result.odds;
    baseCorrelated = result.isCorrelated;
    baseAbsorbed = result.absorbed;
  }

  // Apply cross-market implied leg absorption (winner implies top 3 etc)
  const slugs = items.map((i) => i.market.slug);
  const droppedSlugs = new Set<string>();

  for (const a of items) {
    for (const b of items) {
      if (a === b) continue;
      if (a.selection.name === b.selection.name) {
        for (const [harder, easier] of CROSS_IMPLICATIONS) {
          if (a.market.slug === harder && b.market.slug === easier && !droppedSlugs.has(b.market.slug)) {
            adjusted = adjusted / Number(b.selection.odds_decimal);
            droppedSlugs.add(b.market.slug);
          }
        }
      }
    }
  }

  // Apply partial correlation for loosely related cross-event markets
  let partialCount = 0;
  const activeSlugs = slugs.filter((s) => !droppedSlugs.has(s));
  for (const group of PARTIAL_GROUPS) {
    const matches = activeSlugs.filter((s) => group.includes(s));
    if (matches.length >= 2) partialCount += matches.length - 1;
  }
  if (partialCount > 0) {
    adjusted *= Math.pow(0.85, partialCount);
  }

  const droppedLegs = items
    .filter((item) => droppedSlugs.has(item.market.slug))
    .map((item) => item.market.title);

  return {
    raw,
    adjusted: parseFloat(Math.max(1.01, adjusted).toFixed(2)),
    isCorrelated: baseCorrelated || droppedSlugs.size > 0 || partialCount > 0,
    droppedLegs: [...baseAbsorbed, ...droppedLegs],
    conflict: null as string | null,
  };
}

interface BetSlipProps {
  items: BetSlipItem[];
  onRemove: (selectionId: string) => void;
  onClear: () => void;
  onBetPlaced: () => void;
  allMarkets?: (Market & { selections: MarketSelection[] })[];
}

export function BetSlip({ items, onRemove, onClear, onBetPlaced, allMarkets }: BetSlipProps) {
  const [bettorName, setBettorName] = useState('');
  const [mode, setMode] = useState<'singles' | 'multi'>('singles');
  const [singleStakes, setSingleStakes] = useState<Record<string, string>>({});
  const [multiStake, setMultiStake] = useState('');
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevCount = useRef(items.length);

  const multiCalc = items.length >= 2 ? calculateMultiOdds(items, allMarkets) : null;
  const conflict = multiCalc?.conflict || (items.length >= 2 ? getNonMatchConflict(items) : null);
  const canMulti = items.length >= 2 && !conflict;

  useEffect(() => {
    if (items.length >= 2 && prevCount.current < 2 && !conflict) {
      setMode('multi');
    }
    if (items.length < 2 || conflict) {
      setMode('singles');
    }
    prevCount.current = items.length;
  }, [items, conflict]);

  if (items.length === 0 && !confirmation) return null;

  if (confirmation) {
    return (
      <div className="bg-navy-card border border-white/[0.08] rounded-lg p-5 text-center">
        <div className={`font-bold text-base mb-2 ${confirmation.includes('review') ? 'text-gold' : 'text-green-bright'}`}>
          {confirmation.includes('review') ? 'Bet Submitted for Review' : 'Bet Accepted'}
        </div>
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

  const multiOdds = multiCalc?.adjusted || 1;
  const isCorrelated = multiCalc?.isCorrelated || false;
  const droppedLegs = multiCalc?.droppedLegs || [];
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
            const payout = parseFloat((stake * Number(item.selection.odds_decimal)).toFixed(2));
            const needsReview = payout > 500;
            return {
              bettor_name: bettorName.trim(),
              market_id: item.market.id,
              selection_id: item.selection.id,
              stake,
              odds_taken: Number(item.selection.odds_decimal),
              potential_payout: payout,
              status: 'pending' as const,
              bet_type: 'single',
              requires_review: needsReview,
              review_status: needsReview ? 'pending' : 'none',
              original_stake: stake,
            };
          });
        const { error: insertError } = await supabase.from('bets').insert(bets);
        if (insertError) throw insertError;
        const reviewCount = bets.filter((b) => b.requires_review).length;
        setConfirmation(
          reviewCount > 0
            ? `${bets.length} bet${bets.length > 1 ? 's' : ''} placed. ${reviewCount} require${reviewCount === 1 ? 's' : ''} admin approval (payout over $500).`
            : `${bets.length} single${bets.length > 1 ? 's' : ''} placed. Stake: ${formatCurrency(singlesTotalStake)}.`
        );
      } else {
        const { data: bet, error: betError } = await supabase
          .from('bets')
          .insert({
            bettor_name: bettorName.trim(),
            market_id: items[0].market.id,
            selection_id: items[0].selection.id,
            stake: multiStakeNum,
            odds_taken: multiOdds,
            potential_payout: parseFloat(multiPayout.toFixed(2)),
            status: 'pending',
            bet_type: 'multi',
            multi_odds: multiOdds,
            requires_review: multiPayout > 500,
            review_status: multiPayout > 500 ? 'pending' : 'none',
            original_stake: multiStakeNum,
          })
          .select()
          .single();
        if (betError) throw betError;

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
          multiPayout > 500
            ? `${items.length}-leg multi submitted for review (payout over $500). Stake: ${formatCurrency(multiStakeNum)}.`
            : `${items.length}-leg multi placed at $${multiOdds.toFixed(2)}. Stake: ${formatCurrency(multiStakeNum)}, return: ${formatCurrency(multiPayout)}.`
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
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-white font-bold text-sm">Bet Slip</span>
        <button onClick={onClear} className="text-[11px] text-white/30 hover:text-white/50">Clear</button>
      </div>

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

        <input
          type="text"
          value={bettorName}
          onChange={(e) => setBettorName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 rounded bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-green-bright/50"
        />

        {mode === 'singles' && singlesTotalStake > 0 && (
          <div className="flex justify-between text-sm pt-1">
            <span className="text-white/40">Returns</span>
            <span className="text-green-bright font-bold">{formatCurrency(singlesTotalReturn)}</span>
          </div>
        )}

        {error && <div className="text-[11px] text-danger">{error}</div>}

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
