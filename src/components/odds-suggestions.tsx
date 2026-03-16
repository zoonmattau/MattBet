'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/exposure';

interface Selection {
  id: string;
  name: string;
  odds_decimal: number;
  sort_order: number;
}

interface MarketWithData {
  id: string;
  title: string;
  slug: string;
  status: string;
  selections: Selection[];
  bets: { selection_id: string; stake: number; status: string }[];
}

interface Suggestion {
  selectionId: string;
  selectionName: string;
  currentOdds: number;
  suggestedOdds: number;
  direction: 'shorten' | 'lengthen';
  moneyPct: number;
}

interface MarketSuggestion {
  market: MarketWithData;
  totalHandle: number;
  suggestions: Suggestion[];
  imbalancePct: number; // how lopsided (0 = balanced, 100 = all on one side)
}

function getSuggestions(markets: MarketWithData[]): MarketSuggestion[] {
  const results: MarketSuggestion[] = [];

  for (const market of markets) {
    if (market.selections.length < 2) continue;

    const activeBets = market.bets.filter((b) => b.status !== 'void');
    const totalHandle = activeBets.reduce((s, b) => s + Number(b.stake), 0);
    if (totalHandle === 0) continue;

    // Calculate money % on each selection
    const selData = market.selections.map((sel) => {
      const staked = activeBets
        .filter((b) => b.selection_id === sel.id)
        .reduce((s, b) => s + Number(b.stake), 0);
      return { ...sel, staked, moneyPct: staked / totalHandle };
    });

    // Check if lopsided: if any selection has >60% of the money
    const maxPct = Math.max(...selData.map((s) => s.moneyPct));
    if (maxPct < 0.60) continue; // balanced enough, no suggestion needed

    // Current overround (margin we want to preserve)
    const currentOverround = market.selections.reduce(
      (s, sel) => s + 1 / Number(sel.odds_decimal),
      0
    );

    // Calculate suggested odds based on money-weighted probabilities + margin
    // Target: odds that would make payouts more balanced
    // We blend current implied prob with money weight to get a nudged probability
    const suggestions: Suggestion[] = [];

    for (const sel of selData) {
      const currentImplied = 1 / Number(sel.odds_decimal);
      const moneyWeight = sel.moneyPct || 0.001; // avoid zero

      // Blend: nudge implied probability toward where the money is
      // This shortens odds on heavy side, lengthens on light side
      const blendFactor = 0.4; // how aggressively to adjust
      const nudgedProb = currentImplied * (1 - blendFactor) + moneyWeight * currentOverround * blendFactor;

      // Scale to preserve overround
      const suggestedOdds = Math.round((1 / nudgedProb) * 100) / 100;
      const currentOdds = Number(sel.odds_decimal);

      // Only suggest if the change is meaningful (>3% shift)
      const pctChange = Math.abs(suggestedOdds - currentOdds) / currentOdds;
      if (pctChange < 0.03) continue;

      suggestions.push({
        selectionId: sel.id,
        selectionName: sel.name,
        currentOdds,
        suggestedOdds: Math.max(1.01, suggestedOdds), // never below 1.01
        direction: suggestedOdds < currentOdds ? 'shorten' : 'lengthen',
        moneyPct: sel.moneyPct * 100,
      });
    }

    if (suggestions.length > 0) {
      results.push({
        market,
        totalHandle,
        suggestions,
        imbalancePct: maxPct * 100,
      });
    }
  }

  // Sort by most imbalanced first
  return results.sort((a, b) => b.imbalancePct - a.imbalancePct);
}

export function OddsSuggestions({ markets }: { markets: MarketWithData[] }) {
  const router = useRouter();
  const [applying, setApplying] = useState<string | null>(null);
  const marketSuggestions = getSuggestions(markets);

  if (marketSuggestions.length === 0) {
    return (
      <div className="bg-navy-card border border-white/8 rounded-xl p-4">
        <h2 className="text-sm font-bold text-white mb-2">Odds Adjustments</h2>
        <p className="text-xs text-white/30">No lopsided markets - book looks balanced.</p>
      </div>
    );
  }

  const applyAll = async (ms: MarketSuggestion) => {
    setApplying(ms.market.id);
    const supabase = createClient();
    for (const s of ms.suggestions) {
      await supabase
        .from('market_selections')
        .update({ odds_decimal: s.suggestedOdds })
        .eq('id', s.selectionId);
    }
    setApplying(null);
    router.refresh();
  };

  const applySingle = async (s: Suggestion) => {
    setApplying(s.selectionId);
    const supabase = createClient();
    await supabase
      .from('market_selections')
      .update({ odds_decimal: s.suggestedOdds })
      .eq('id', s.selectionId);
    setApplying(null);
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-white">Suggested Odds Adjustments</h2>
      <p className="text-[10px] text-white/30">Markets where money is lopsided (&gt;60% on one side). Suggestions shorten the heavy side and lengthen the light side to balance liability.</p>

      {marketSuggestions.map((ms) => (
        <div
          key={ms.market.id}
          className="bg-navy-card border border-white/8 rounded-xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div>
              <div className="text-white font-semibold text-sm">{ms.market.title}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-white/30">
                  Handle: {formatCurrency(ms.totalHandle)}
                </span>
                <span className="text-[10px] text-danger font-bold">
                  {ms.imbalancePct.toFixed(0)}% on one side
                </span>
              </div>
            </div>
            <button
              onClick={() => applyAll(ms)}
              disabled={applying === ms.market.id}
              className="px-3 py-1.5 rounded-lg bg-green-accent text-white text-xs font-bold hover:bg-green-bright transition-colors disabled:opacity-50 shrink-0"
            >
              {applying === ms.market.id ? 'Applying...' : 'Apply All'}
            </button>
          </div>

          {/* Money distribution bar */}
          <div className="px-4 py-2 border-b border-white/5">
            <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
              {ms.market.selections.map((sel, i) => {
                const activeBets = ms.market.bets.filter((b) => b.status !== 'void');
                const staked = activeBets
                  .filter((b) => b.selection_id === sel.id)
                  .reduce((s, b) => s + Number(b.stake), 0);
                const pct = ms.totalHandle > 0 ? (staked / ms.totalHandle) * 100 : 0;
                const colors = [
                  'bg-green-bright',
                  'bg-gold',
                  'bg-danger',
                  'bg-blue-400',
                  'bg-purple-400',
                  'bg-orange-400',
                ];
                return (
                  <div
                    key={sel.id}
                    className={`${colors[i % colors.length]} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${sel.name}: ${pct.toFixed(0)}%`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              {ms.market.selections.map((sel, i) => {
                const activeBets = ms.market.bets.filter((b) => b.status !== 'void');
                const staked = activeBets
                  .filter((b) => b.selection_id === sel.id)
                  .reduce((s, b) => s + Number(b.stake), 0);
                const pct = ms.totalHandle > 0 ? (staked / ms.totalHandle) * 100 : 0;
                const colors = [
                  'text-green-bright',
                  'text-gold',
                  'text-danger',
                  'text-blue-400',
                  'text-purple-400',
                  'text-orange-400',
                ];
                return (
                  <span key={sel.id} className={`text-[9px] ${colors[i % colors.length]}`}>
                    {sel.name} {pct.toFixed(0)}%
                  </span>
                );
              })}
            </div>
          </div>

          {/* Suggestions */}
          <div className="divide-y divide-white/3">
            {ms.suggestions.map((s) => (
              <div key={s.selectionId} className="px-4 py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/70">{s.selectionName}</div>
                  <div className="text-[10px] text-white/30">
                    {s.moneyPct.toFixed(0)}% of money
                    {' -- '}
                    {s.direction === 'shorten' ? 'too much action, shorten' : 'needs action, lengthen'}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-white/40 font-mono">
                    {s.currentOdds.toFixed(2)}
                  </span>
                  <span className="text-white/20">→</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      s.direction === 'shorten' ? 'text-danger' : 'text-green-bright'
                    }`}
                  >
                    {s.suggestedOdds.toFixed(2)}
                  </span>
                  <button
                    onClick={() => applySingle(s)}
                    disabled={applying === s.selectionId}
                    className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors disabled:opacity-50"
                  >
                    {applying === s.selectionId ? '...' : 'Apply'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
