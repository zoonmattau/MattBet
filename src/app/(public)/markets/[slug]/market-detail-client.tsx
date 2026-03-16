'use client';

import { useState } from 'react';
import { Market, MarketSelection, BetSlipItem } from '@/lib/types';
import { StatusBadge, RoundBadge, FeaturedBadge, CategoryBadge } from '@/components/status-badge';
import { BetSlip } from '@/components/bet-slip';
import { impliedProbability } from '@/lib/exposure';
import Link from 'next/link';

interface MarketDetailClientProps {
  market: Market & { selections: MarketSelection[] };
}

export function MarketDetailClient({ market }: MarketDetailClientProps) {
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const isDisabled = market.status !== 'open';

  const handleSelectBet = (selection: MarketSelection) => {
    setBetSlip((prev) => {
      const existing = prev.find((item) => item.selection.id === selection.id);
      if (existing) {
        return prev.filter((item) => item.selection.id !== selection.id);
      }
      return [{ market, selection, stake: 0 }];
    });
  };

  const sorted = [...market.selections].sort(
    (a, b) => Number(a.odds_decimal) - Number(b.odds_decimal)
  );

  const overround = market.selections.reduce(
    (sum, s) => sum + 1 / Number(s.odds_decimal),
    0
  ) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/markets" className="text-sm text-white/40 hover:text-white/60 transition-colors mb-4 inline-block">
        Back to Markets
      </Link>

      <div className={`grid gap-6 ${betSlip.length > 0 ? 'lg:grid-cols-3' : ''}`}>
        <div className={`${betSlip.length > 0 ? 'lg:col-span-2' : ''} space-y-4`}>
          {/* Header */}
          <div className="bg-navy-card border border-white/8 rounded-xl p-5">
            <h1 className="text-xl font-bold text-white mb-3">{market.title}</h1>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <CategoryBadge category={market.category} />
              {market.is_featured && <FeaturedBadge />}
              {market.round_label && <RoundBadge label={market.round_label} />}
            </div>

            {market.line_value && (
              <div className="mb-4 p-3 rounded-lg bg-white/3 border border-white/5">
                <span className="text-xs text-white/40 uppercase tracking-wide">Line: </span>
                <span className="text-lg font-bold text-gold">{market.line_value}</span>
              </div>
            )}

            <div className="text-xs text-white/30">
              Market margin: {overround.toFixed(1)}%
            </div>
          </div>

          {/* Selections - list format, favourite to longshot */}
          <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <h2 className="text-sm font-semibold text-white">Selections</h2>
            </div>
            <div className="divide-y divide-white/3">
              {sorted.map((sel) => {
                const isSelected = betSlip.some((b) => b.selection.id === sel.id);
                return (
                  <button
                    key={sel.id}
                    onClick={() => !isDisabled && handleSelectBet(sel)}
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors disabled:cursor-default ${
                      isSelected ? 'bg-green-accent/15' : 'hover:bg-white/3'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                        {sel.name}
                      </span>
                      <span className="text-xs text-white/25 ml-2">
                        {impliedProbability(Number(sel.odds_decimal)).toFixed(0)}%
                      </span>
                    </div>
                    <span className={`text-sm font-bold font-mono ${isSelected ? 'text-green-bright' : 'text-green-bright/80'}`}>
                      ${Number(sel.odds_decimal).toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <BetSlip
              items={betSlip}
              onRemove={(id) => setBetSlip((prev) => prev.filter((b) => b.selection.id !== id))}
              onClear={() => setBetSlip([])}
              onBetPlaced={() => setBetSlip([])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
