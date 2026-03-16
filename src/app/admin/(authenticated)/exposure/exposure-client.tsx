'use client';

import { useState, useMemo } from 'react';
import { Market, MarketSelection, Bet, ExposureData } from '@/lib/types';
import { calculateExposure, formatCurrency } from '@/lib/exposure';

interface ExposureClientProps {
  markets: (Market & { selections: MarketSelection[] })[];
  bets: Bet[];
}

// Parse the line value from a selection name like "Over 7.5" or "Under 85.5"
function parseLineFromName(name: string): number | null {
  const match = name.match(/[\d]+\.?\d*/);
  return match ? parseFloat(match[0]) : null;
}

// For a given actual result value, figure out the book P&L
// Each bet is checked against the line IT was taken at (parsed from selection name),
// not the current market line - because lines move as bets come in
function calcResultPnL(
  selections: MarketSelection[],
  marketBets: Bet[],
  currentLine: number,
  actualResult: number
) {
  const activeBets = marketBets.filter((b) => b.status !== 'void');
  const totalHandle = activeBets.reduce((s, b) => s + Number(b.stake), 0);

  let totalPayout = 0;
  const betResults: { bet: Bet; selName: string; betLine: number; wins: boolean; payout: number }[] = [];

  for (const bet of activeBets) {
    const sel = selections.find((s) => s.id === bet.selection_id);
    if (!sel) continue;

    const name = sel.name.toLowerCase();
    // Parse the line this bet was taken at from the selection name
    const betLine = parseLineFromName(sel.name) ?? currentLine;
    let wins = false;

    if (name.startsWith('over') || name.includes('+')) {
      wins = actualResult > betLine;
    } else if (name.startsWith('under') || (name.includes('-') && name.match(/\d/))) {
      wins = actualResult < betLine;
    }

    // Exact line = push, no winner
    if (actualResult === betLine) wins = false;

    const payout = wins ? Number(bet.potential_payout) : 0;
    totalPayout += payout;
    betResults.push({ bet, selName: sel.name, betLine, wins, payout });
  }

  return {
    bookPnL: totalHandle - totalPayout,
    totalPayout,
    totalHandle,
    betResults,
  };
}

function ResultSlider({
  market,
  selections,
  marketBets,
}: {
  market: Market;
  selections: MarketSelection[];
  marketBets: Bet[];
}) {
  const lineValue = market.line_value!;

  // Build a range around the line: line ± 20 in steps of 0.5
  const range = useMemo(() => {
    const step = 0.5;
    const spread = 20;
    const min = lineValue - spread;
    const max = lineValue + spread;
    const values: number[] = [];
    for (let v = min; v <= max; v += step) {
      values.push(Math.round(v * 10) / 10);
    }
    return { min, max, step, values };
  }, [lineValue]);

  const [result, setResult] = useState(lineValue);

  const pnl = useMemo(
    () => calcResultPnL(selections, marketBets, lineValue, result),
    [selections, marketBets, lineValue, result]
  );

  // Precompute P&L at every point for the bar chart
  const chartData = useMemo(() => {
    return range.values.map((v) => ({
      value: v,
      pnl: calcResultPnL(selections, marketBets, lineValue, v).bookPnL,
    }));
  }, [range.values, selections, marketBets, lineValue]);

  const maxAbsPnL = Math.max(...chartData.map((d) => Math.abs(d.pnl)), 1);
  const activeBets = marketBets.filter((b) => b.status !== 'void');

  if (activeBets.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-white/30">
        No bets yet — slider will appear when bets are placed.
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Result value display */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-white/30 uppercase tracking-wide">Actual Result</span>
          <div className="text-2xl font-black text-white">{result}</div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-white/30 uppercase tracking-wide">Book P&L</span>
          <div className={`text-2xl font-black ${pnl.bookPnL >= 0 ? 'text-green-bright' : 'text-danger'}`}>
            {pnl.bookPnL >= 0 ? '+' : ''}{formatCurrency(pnl.bookPnL)}
          </div>
        </div>
      </div>

      {/* Mini bar chart */}
      <div className="relative h-24 flex items-end gap-px">
        {chartData.map((d) => {
          const height = Math.max((Math.abs(d.pnl) / maxAbsPnL) * 100, 2);
          const isPositive = d.pnl >= 0;
          const isSelected = d.value === result;
          const isLine = d.value === lineValue;
          return (
            <div
              key={d.value}
              className="flex-1 flex flex-col justify-end items-center relative cursor-pointer"
              style={{ height: '100%' }}
              onClick={() => setResult(d.value)}
            >
              {isLine && (
                <div className="absolute top-0 bottom-0 w-px bg-gold/50 z-10" />
              )}
              <div
                className={`w-full rounded-t-sm transition-all ${
                  isSelected
                    ? isPositive ? 'bg-green-bright' : 'bg-danger'
                    : isPositive ? 'bg-green-bright/30' : 'bg-danger/30'
                }`}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Labels under chart */}
      <div className="flex justify-between text-[9px] text-white/20">
        <span>{range.min}</span>
        <span className="text-gold">Line: {lineValue}</span>
        <span>{range.max}</span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={result}
        onChange={(e) => setResult(parseFloat(e.target.value))}
        className="w-full accent-green-bright"
      />

      {/* Bet breakdown at this result */}
      <div className="space-y-1">
        <div className="text-[10px] text-white/30 uppercase tracking-wide mb-2">
          Bet outcomes at result = {result}
        </div>
        {pnl.betResults.map((br) => (
          <div key={br.bet.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/3">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                br.wins ? 'bg-danger/20 text-danger' : 'bg-green-bright/20 text-green-bright'
              }`}>
                {br.wins ? 'PAYS' : 'KEEP'}
              </span>
              <span className="text-white/60">{br.bet.bettor_name}</span>
              <span className="text-white/30 truncate">{br.selName}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-white/40">${Number(br.bet.stake).toFixed(0)} @ {Number(br.bet.odds_taken).toFixed(2)}</span>
              <span className={`font-bold ${br.wins ? 'text-danger' : 'text-green-bright'}`}>
                {br.wins ? `-${formatCurrency(br.payout)}` : `+${formatCurrency(Number(br.bet.stake))}`}
              </span>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-white/40">
            {pnl.betResults.filter((b) => b.wins).length} pay out, {pnl.betResults.filter((b) => !b.wins).length} kept
          </span>
          <span className={`font-bold text-sm ${pnl.bookPnL >= 0 ? 'text-green-bright' : 'text-danger'}`}>
            Net: {pnl.bookPnL >= 0 ? '+' : ''}{formatCurrency(pnl.bookPnL)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ExposureClient({ markets, bets }: ExposureClientProps) {
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

  const openMarkets = markets.filter((m) => m.status === 'open');
  const exposures = openMarkets.map((m) => {
    const marketBets = bets.filter((b) => b.market_id === m.id);
    return calculateExposure(m, m.selections, marketBets);
  });

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
            const hasLine = exp.market.line_value !== null;
            const marketBets = bets.filter((b) => b.market_id === exp.market.id);
            return (
              <div key={exp.market.id} className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedMarket(isExpanded ? null : exp.market.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/3 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-semibold">{exp.market.title}</div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <span>Handle: {formatCurrency(exp.total_handle)} -- {exp.overround.toFixed(1)}%</span>
                      {hasLine && (
                        <span className="text-gold font-bold">Line: {exp.market.line_value}</span>
                      )}
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
                    {/* Standard selection table */}
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

                    {/* Result slider for line markets */}
                    {hasLine && (
                      <div className="border-t border-white/5">
                        <div className="px-4 pt-3 pb-1">
                          <span className="text-[10px] text-gold uppercase tracking-wide font-bold">Result Simulator</span>
                        </div>
                        <ResultSlider
                          market={exp.market}
                          selections={exp.market.selections || []}
                          marketBets={marketBets}
                        />
                      </div>
                    )}
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
