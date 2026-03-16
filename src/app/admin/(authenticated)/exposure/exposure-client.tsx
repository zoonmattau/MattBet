'use client';

import { useState } from 'react';
import { Market, MarketSelection, Bet, ExposureData } from '@/lib/types';
import { calculateExposure, formatCurrency } from '@/lib/exposure';

interface ExposureClientProps {
  markets: (Market & { selections: MarketSelection[] })[];
  bets: Bet[];
}

export function ExposureClient({ markets, bets }: ExposureClientProps) {
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

  const openMarkets = markets.filter((m) => m.status === 'open');
  const exposures = openMarkets.map((m) => {
    const marketBets = bets.filter((b) => b.market_id === m.id);
    return calculateExposure(m, m.selections, marketBets);
  });

  const byWorstCase = [...exposures].sort((a, b) => a.worst_case - b.worst_case);
  const byBestCase = [...exposures].sort((a, b) => b.best_case - a.best_case);

  const totalHandle = exposures.reduce((s, e) => s + e.total_handle, 0);
  const totalWorstCase = exposures.reduce((s, e) => s + e.worst_case, 0);
  const totalBestCase = exposures.reduce((s, e) => s + e.best_case, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-white">Exposure and Risk</h1>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-navy-card border border-white/8 rounded-xl p-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Open Markets</div>
          <div className="text-lg font-bold text-white">{openMarkets.length}</div>
        </div>
        <div className="bg-navy-card border border-white/8 rounded-xl p-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Total Handle</div>
          <div className="text-lg font-bold text-white">{formatCurrency(totalHandle)}</div>
        </div>
        <div className="bg-navy-card border border-white/8 rounded-xl p-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Portfolio Best</div>
          <div className="text-lg font-bold text-green-bright">+{formatCurrency(totalBestCase)}</div>
        </div>
        <div className="bg-navy-card border border-white/8 rounded-xl p-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Portfolio Worst</div>
          <div className="text-lg font-bold text-danger">{formatCurrency(totalWorstCase)}</div>
        </div>
      </div>


      {/* Market-by-Market - Expandable */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">All Markets</h2>
        <div className="space-y-2">
          {exposures.map((exp) => {
            const isExpanded = expandedMarket === exp.market.id;
            return (
              <div key={exp.market.id} className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedMarket(isExpanded ? null : exp.market.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/3 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-semibold">{exp.market.title}</div>
                    <div className="text-[10px] text-white/30">
                      Handle: {formatCurrency(exp.total_handle)} -- {exp.overround.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-green-bright font-bold">+{formatCurrency(exp.best_case)}</div>
                      <div className="text-[10px] text-white/20">best</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-danger font-bold">{formatCurrency(exp.worst_case)}</div>
                      <div className="text-[10px] text-white/20">worst</div>
                    </div>
                    <span className="text-[10px] text-white/20">{isExpanded ? 'Hide' : 'Show'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/5">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-4 py-2 text-white/40 uppercase font-medium">Selection</th>
                          <th className="text-right px-3 py-2 text-white/40 uppercase font-medium">Staked</th>
                          <th className="text-right px-3 py-2 text-white/40 uppercase font-medium">Bets</th>
                          <th className="text-right px-3 py-2 text-white/40 uppercase font-medium">Liability</th>
                          <th className="text-right px-4 py-2 text-white/40 uppercase font-medium">Net Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exp.selections.map((sel) => (
                          <tr key={sel.id} className="border-b border-white/3">
                            <td className="px-4 py-2 text-white/70">{sel.name}</td>
                            <td className="px-3 py-2 text-right text-white/50">{formatCurrency(sel.total_staked)}</td>
                            <td className="px-3 py-2 text-right text-white/40">{sel.bet_count}</td>
                            <td className={`px-3 py-2 text-right font-medium ${sel.liability > 0 ? 'text-danger' : 'text-white/40'}`}>
                              {formatCurrency(sel.liability)}
                            </td>
                            <td className={`px-4 py-2 text-right font-bold ${
                              sel.net_result > 0 ? 'text-green-bright' : sel.net_result < 0 ? 'text-danger' : 'text-white/40'
                            }`}>
                              {sel.net_result >= 0 ? '+' : ''}{formatCurrency(sel.net_result)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
