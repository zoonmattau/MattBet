'use client';

import { useState } from 'react';
import { BetSlipItem } from '@/lib/types';
import { formatCurrency } from '@/lib/exposure';
import { createClient } from '@/lib/supabase/client';

interface BetSlipProps {
  items: BetSlipItem[];
  onRemove: (selectionId: string) => void;
  onClear: () => void;
  onBetPlaced: () => void;
}

export function BetSlip({ items, onRemove, onClear, onBetPlaced }: BetSlipProps) {
  const [bettorName, setBettorName] = useState('');
  const [stakes, setStakes] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0 && !confirmation) return null;

  if (confirmation) {
    return (
      <div className="bg-navy-card border border-white/8 rounded-xl p-5 text-center">
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

  const getStake = (selectionId: string) => parseFloat(stakes[selectionId] || '0') || 0;
  const totalStake = items.reduce((sum, item) => sum + getStake(item.selection.id), 0);
  const totalReturn = items.reduce((sum, item) => {
    return sum + getStake(item.selection.id) * Number(item.selection.odds_decimal);
  }, 0);

  const handlePlaceBets = async () => {
    if (!bettorName.trim()) { setError('Enter your name'); return; }
    if (totalStake <= 0) { setError('Enter a stake'); return; }

    setPlacing(true);
    setError(null);
    const supabase = createClient();

    try {
      const bets = items
        .filter((item) => getStake(item.selection.id) > 0)
        .map((item) => {
          const stake = getStake(item.selection.id);
          return {
            bettor_name: bettorName.trim(),
            market_id: item.market.id,
            selection_id: item.selection.id,
            stake,
            odds_taken: Number(item.selection.odds_decimal),
            potential_payout: parseFloat((stake * Number(item.selection.odds_decimal)).toFixed(2)),
            status: 'pending' as const,
          };
        });

      const { error: insertError } = await supabase.from('bets').insert(bets);
      if (insertError) throw insertError;

      setConfirmation(
        `${bets.length} bet${bets.length > 1 ? 's' : ''} placed. Stake: ${formatCurrency(totalStake)}, return: ${formatCurrency(totalReturn)}.`
      );
      setStakes({});
      onBetPlaced();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bets');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-white font-bold text-sm">Bet Slip</span>
        <button onClick={onClear} className="text-xs text-white/30 hover:text-white/50">
          Clear
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Bets */}
        {items.map((item) => {
          const stake = getStake(item.selection.id);
          const payout = stake * Number(item.selection.odds_decimal);
          return (
            <div key={item.selection.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0">
                  <div className="text-sm text-white font-medium">{item.selection.name}</div>
                  <div className="text-xs text-white/30">{item.market.title}</div>
                </div>
                <span className="text-green-bright font-bold text-sm ml-3">
                  ${Number(item.selection.odds_decimal).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stakes[item.selection.id] || ''}
                    onChange={(e) => setStakes((prev) => ({ ...prev, [item.selection.id]: e.target.value }))}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-green-bright/50"
                  />
                </div>
                {stake > 0 && (
                  <span className="text-xs text-white/40 shrink-0">
                    {formatCurrency(payout)}
                  </span>
                )}
                <button
                  onClick={() => onRemove(item.selection.id)}
                  className="text-[10px] text-white/20 hover:text-white/40 shrink-0"
                >
                  remove
                </button>
              </div>
            </div>
          );
        })}

        {/* Name */}
        <input
          type="text"
          value={bettorName}
          onChange={(e) => setBettorName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-green-bright/50"
        />

        {/* Total */}
        {totalStake > 0 && (
          <div className="flex justify-between text-sm pt-2 border-t border-white/5">
            <span className="text-white/40">Returns</span>
            <span className="text-green-bright font-bold">{formatCurrency(totalReturn)}</span>
          </div>
        )}

        {error && (
          <div className="text-xs text-danger">{error}</div>
        )}

        {/* Place Bet */}
        <button
          onClick={handlePlaceBets}
          disabled={placing || totalStake <= 0}
          className="w-full py-2.5 rounded-lg bg-green-accent text-white font-bold text-sm hover:bg-green-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {placing ? 'Placing...' : `Place Bet${totalStake > 0 ? ` -- ${formatCurrency(totalStake)}` : ''}`}
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
