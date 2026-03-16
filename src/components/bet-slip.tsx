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

const CORRELATION_DISCOUNT = 0.82;

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

function getCorrelationCount(items: BetSlipItem[]): number {
  const slugs = items.map((i) => i.market.slug);
  let count = 0;

  for (const group of CORRELATED_GROUPS) {
    const matches = slugs.filter((s) => group.includes(s));
    if (matches.length >= 2) count += matches.length - 1;
  }

  // Same match prefix
  const matchPrefixes = slugs
    .map((s) => {
      const m = s.match(/^(r[234]-m\d+|r4-[a-z]+-[a-z]+)/);
      return m ? m[1] : null;
    })
    .filter(Boolean);
  const prefixCounts: Record<string, number> = {};
  matchPrefixes.forEach((p) => { prefixCounts[p!] = (prefixCounts[p!] || 0) + 1; });
  Object.values(prefixCounts).forEach((c) => { if (c >= 2) count += c - 1; });

  return count;
}

function calculateMultiOdds(items: BetSlipItem[]): { raw: number; adjusted: number; isCorrelated: boolean } {
  const raw = items.reduce((acc, item) => acc * Number(item.selection.odds_decimal), 1);
  const correlations = getCorrelationCount(items);
  const adjusted = correlations > 0
    ? raw * Math.pow(CORRELATION_DISCOUNT, correlations)
    : raw;
  return { raw, adjusted, isCorrelated: correlations > 0 };
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

  const conflict = items.length >= 2 ? getConflict(items) : null;
  const canMulti = items.length >= 2 && !conflict;
  const prevCount = useRef(items.length);

  useEffect(() => {
    if (items.length >= 2 && prevCount.current < 2 && !getConflict(items)) {
      setMode('multi');
    }
    if (items.length < 2 || getConflict(items)) {
      setMode('singles');
    }
    prevCount.current = items.length;
  }, [items]);
  const getSingleStake = (id: string) => parseFloat(singleStakes[id] || '0') || 0;
  const multiStakeNum = parseFloat(multiStake || '0') || 0;

  const { raw: rawMultiOdds, adjusted: multiOdds, isCorrelated } = canMulti
    ? calculateMultiOdds(items)
    : { raw: 1, adjusted: 1, isCorrelated: false };
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
                Same-game multi -- correlated odds adjusted
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
