'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Market, MarketSelection, Bet } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/status-badge';
import { calculateExposure, impliedProbability, formatCurrency } from '@/lib/exposure';
import Link from 'next/link';

type MarketWithSelections = Market & { selections: MarketSelection[] };

export function MarketDetailAdmin({
  market: initialMarket,
  bets: initialBets,
}: {
  market: MarketWithSelections;
  bets: Bet[];
}) {
  const router = useRouter();
  const [market, setMarket] = useState(initialMarket);
  const [editingOdds, setEditingOdds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const exposure = calculateExposure(market, market.selections, initialBets);

  const handleStatusChange = async (status: string) => {
    const supabase = createClient();
    await supabase.from('markets').update({ status }).eq('id', market.id);
    setMarket({ ...market, status: status as Market['status'] });
    router.refresh();
  };

  const handleOddsChange = (selId: string, value: string) => {
    setEditingOdds((prev) => ({ ...prev, [selId]: value }));
  };

  const saveOdds = async (selId: string) => {
    const newOdds = parseFloat(editingOdds[selId]);
    if (!newOdds || newOdds <= 1) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('market_selections')
      .update({ odds_decimal: newOdds })
      .eq('id', selId);

    setMarket((prev) => ({
      ...prev,
      selections: prev.selections.map((s) =>
        s.id === selId ? { ...s, odds_decimal: newOdds } : s
      ),
    }));
    setEditingOdds((prev) => {
      const next = { ...prev };
      delete next[selId];
      return next;
    });
    setSaving(false);
  };

  const handleSettle = async (winnerSelectionId: string) => {
    if (!confirm('Settle this market? This will update all bet statuses.')) return;
    const supabase = createClient();

    // Mark winning selection
    await supabase
      .from('market_selections')
      .update({ is_winner: false })
      .eq('market_id', market.id);
    await supabase
      .from('market_selections')
      .update({ is_winner: true })
      .eq('id', winnerSelectionId);

    // Update bets
    await supabase
      .from('bets')
      .update({ status: 'lost', settled_at: new Date().toISOString() })
      .eq('market_id', market.id)
      .neq('selection_id', winnerSelectionId)
      .eq('status', 'pending');

    await supabase
      .from('bets')
      .update({ status: 'won', settled_at: new Date().toISOString() })
      .eq('market_id', market.id)
      .eq('selection_id', winnerSelectionId)
      .eq('status', 'pending');

    // Update market status
    await supabase.from('markets').update({ status: 'settled' }).eq('id', market.id);

    router.refresh();
  };

  const handleAddSelection = async () => {
    const name = prompt('Selection name:');
    if (!name) return;
    const oddsStr = prompt('Decimal odds:', '3.00');
    const odds = parseFloat(oddsStr || '3.00') || 3.0;

    const supabase = createClient();
    const { data } = await supabase
      .from('market_selections')
      .insert({
        market_id: market.id,
        name,
        odds_decimal: odds,
        sort_order: market.selections.length + 1,
      })
      .select()
      .single();

    if (data) {
      setMarket((prev) => ({
        ...prev,
        selections: [...prev.selections, data],
      }));
    }
  };

  const handleDeleteSelection = async (selId: string) => {
    if (!confirm('Remove this selection?')) return;
    const supabase = createClient();
    await supabase.from('market_selections').delete().eq('id', selId);
    setMarket((prev) => ({
      ...prev,
      selections: prev.selections.filter((s) => s.id !== selId),
    }));
  };

  const handleDuplicate = async () => {
    const supabase = createClient();
    const newTitle = `${market.title} (Copy)`;
    const newSlug = `${market.slug}-copy-${Date.now()}`;

    const { data: newMarket } = await supabase
      .from('markets')
      .insert({
        title: newTitle,
        slug: newSlug,
        category: market.category,
        market_type: market.market_type,
        line_value: market.line_value,
        round_label: market.round_label,
        is_featured: false,
        status: 'open',
      })
      .select()
      .single();

    if (newMarket) {
      const sels = market.selections.map((s) => ({
        market_id: newMarket.id,
        name: s.name,
        odds_decimal: Number(s.odds_decimal),
        sort_order: s.sort_order,
      }));
      await supabase.from('market_selections').insert(sels);
      router.push(`/admin/markets/${newMarket.id}`);
    }
  };

  const overround = market.selections.reduce((s, sel) => s + 1 / Number(sel.odds_decimal), 0) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/markets" className="text-sm text-white/40 hover:text-white/60 transition-colors">
          Markets
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-sm text-white/70">{market.title}</span>
      </div>

      {/* Market Header */}
      <div className="bg-navy-card border border-white/8 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-2">{market.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={market.status} />
              <span className="text-xs text-white/30">{market.category}</span>
              {market.line_value && (
                <span className="text-xs text-gold">Line: {market.line_value}</span>
              )}
              <span className="text-xs text-white/30">Margin: {overround.toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {['open', 'suspended', 'settled', 'void'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={market.status === s}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  market.status === s
                    ? 'bg-white/15 text-white cursor-default'
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDuplicate}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
          >
            Duplicate
          </button>
          <button
            onClick={handleAddSelection}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-accent/20 text-green-bright hover:bg-green-accent/30 transition-colors"
          >
            Add Selection
          </button>
        </div>
      </div>

      {/* Selections & Odds Editor */}
      <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Selections and Odds</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Selection</th>
                <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Odds</th>
                <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Implied %</th>
                <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Staked</th>
                <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Liability</th>
                <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Book Result</th>
                <th className="text-right px-4 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exposure.selections
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((sel) => (
                  <tr key={sel.id} className="border-b border-white/3">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{sel.name}</span>
                        {sel.is_winner && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-accent/20 text-green-bright font-bold">
                            WINNER
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={editingOdds[sel.id] ?? Number(sel.odds_decimal).toFixed(2)}
                          onChange={(e) => handleOddsChange(sel.id, e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-white/5 border border-white/10 text-green-bright text-sm font-bold text-right focus:outline-none focus:border-green-bright/50"
                        />
                        {editingOdds[sel.id] && (
                          <button
                            onClick={() => saveOdds(sel.id)}
                            disabled={saving}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-green-accent text-white"
                          >
                            save
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right text-white/50 text-xs font-mono">
                      {impliedProbability(Number(sel.odds_decimal)).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2.5 text-right text-white/60">
                      {formatCurrency(sel.total_staked)}
                      <span className="text-white/30 text-xs ml-1">({sel.bet_count})</span>
                    </td>
                    <td className={`px-3 py-2.5 text-right font-medium ${sel.liability > 0 ? 'text-danger' : 'text-white/50'}`}>
                      {formatCurrency(sel.liability)}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-bold ${sel.net_result >= 0 ? 'text-green-bright' : 'text-danger'}`}>
                      {sel.net_result >= 0 ? '+' : ''}{formatCurrency(sel.net_result)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {market.status === 'open' && (
                          <button
                            onClick={() => handleSettle(sel.id)}
                            className="text-[10px] px-2 py-1 rounded bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
                          >
                            settle as winner
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSelection(sel.id)}
                          className="text-[10px] px-2 py-1 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                        >
                          remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exposure Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-navy-card border border-white/8 rounded-xl p-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Total Handle</div>
          <div className="text-lg font-bold text-white">{formatCurrency(exposure.total_handle)}</div>
        </div>
        <div className="bg-navy-card border border-white/8 rounded-xl p-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Best Case</div>
          <div className="text-lg font-bold text-green-bright">+{formatCurrency(exposure.best_case)}</div>
        </div>
        <div className="bg-navy-card border border-white/8 rounded-xl p-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Worst Case</div>
          <div className="text-lg font-bold text-danger">{formatCurrency(exposure.worst_case)}</div>
        </div>
        <div className="bg-navy-card border border-white/8 rounded-xl p-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Overround</div>
          <div className="text-lg font-bold text-white">{exposure.overround.toFixed(1)}%</div>
        </div>
      </div>

      {/* Market Bets */}
      {initialBets.length > 0 && (
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Bets on this Market ({initialBets.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-2.5 text-white/40 text-xs uppercase font-medium">Bettor</th>
                <th className="text-left px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Selection</th>
                <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Stake</th>
                <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Odds</th>
                <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Payout</th>
                <th className="text-right px-4 py-2.5 text-white/40 text-xs uppercase font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {initialBets.map((bet) => {
                const sel = market.selections.find((s) => s.id === bet.selection_id);
                return (
                  <tr key={bet.id} className="border-b border-white/3">
                    <td className="px-4 py-2.5 text-white font-medium">{bet.bettor_name}</td>
                    <td className="px-3 py-2.5 text-white/60">{sel?.name || 'Unknown'}</td>
                    <td className="px-3 py-2.5 text-right text-white/60">{formatCurrency(Number(bet.stake))}</td>
                    <td className="px-3 py-2.5 text-right text-green-bright font-bold">{Number(bet.odds_taken).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right text-white/60">{formatCurrency(Number(bet.potential_payout))}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase status-${bet.status}`}>
                        {bet.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
