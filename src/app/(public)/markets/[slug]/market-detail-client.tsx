'use client';

import { useState } from 'react';
import { Market, MarketSelection, BetSlipItem } from '@/lib/types';
import { RoundBadge, CategoryBadge } from '@/components/status-badge';
import { BetSlip } from '@/components/bet-slip';
import Link from 'next/link';

const MARKET_DESCRIPTIONS: Record<string, string> = {
  'trip-champion': 'Most total points across all 4 rounds wins. Points from Stableford (R1), Match Play (R2/R3) and 1v1s (R4) all count. Dead heat rules apply.',
  'winning-team': 'The group with the most combined points across all 4 rounds. Each group has 4 players — all their points add up. Dead heat rules apply.',
  'overall-top-3': 'Finish in the top 3 on total points across the trip. Includes points from all 4 rounds. Dead heat rules apply at the cut-off.',
  'overall-bottom-3': 'Finish in the bottom 3 on total points across the trip. Includes points from all 4 rounds. Dead heat rules apply.',
  'wooden-spoon': 'The player with the fewest total points across all 4 rounds. Includes Stableford, Match Play and 1v1 points. Dead heat rules apply.',
  'friday-stableford-winner': 'Highest net stableford score in Round 1. Handicaps applied. Dead heat rules apply.',
  'friday-last-place': 'Lowest net stableford score in Round 1. Dead heat rules apply.',
  'friday-top-3': 'Top 3 stableford scorers on Friday. Dead heat rules apply at the cut-off.',
  'friday-top-4': 'Top 4 stableford scorers on Friday. Dead heat rules apply at the cut-off.',
  'friday-top-half': 'Finish in the top 6 on Friday stableford. Dead heat rules apply.',
  'friday-bottom-half': 'Finish in the bottom 6 on Friday stableford. Dead heat rules apply.',
  'friday-bottom-4': 'Bottom 4 stableford scorers on Friday. Dead heat rules apply.',
  'friday-best-team': 'The team whose players combine for the most stableford points on Friday.',
  'friday-best-of-group': 'The top individual scorer from each group on Friday stableford.',
  'trip-hole-in-one': 'Will any player make a hole-in-one during the trip? Settled yes/no.',
  'trip-lowest-gross': 'The player with the lowest gross (pre-handicap) score in Round 1.',
};

const MATCH_DESC = 'Head-to-head match play. Settled on match result after 18 holes. Handicap strokes applied per hole.';
const LINE_DESC = 'Handicap line market. The favoured side must win by more than the line to cover. Push (exact margin = line) results in void/refund.';
const TOTAL_DESC = 'Total holes won by this player/pair. Settled on the actual holes won count. Half-holes (.5) mean no push is possible.';
const OU_DESC = 'Over/under line market. Settled on the actual score/stat. Push at exact line results in void/refund.';

function getMarketDescription(market: Market): string | null {
  if (MARKET_DESCRIPTIONS[market.slug]) return MARKET_DESCRIPTIONS[market.slug];
  if (market.slug.includes('-h2h')) return MATCH_DESC;
  if (market.slug.includes('-line')) return LINE_DESC;
  if (market.slug.includes('-total')) return TOTAL_DESC;
  if (market.category === 'score_totals') return OU_DESC;
  if (market.slug.includes('-total-pts')) return 'Total individual points scored across the entire trip. Settled on final points tally.';
  if (market.slug.includes('group-') && market.slug.includes('-points')) return 'Total team points for this group across all rounds.';
  return null;
}

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

  const isOverUnderOrYesNo = market.selections.some((s) => {
    const n = s.name.toLowerCase();
    return n.startsWith('over') || n.startsWith('under') || n === 'yes' || n === 'no';
  });
  const sorted = [...market.selections].sort((a, b) => {
    if (isOverUnderOrYesNo) {
      const aFirst = a.name.toLowerCase().startsWith('over') || a.name.toLowerCase() === 'yes';
      const bFirst = b.name.toLowerCase().startsWith('over') || b.name.toLowerCase() === 'yes';
      if (aFirst && !bFirst) return -1;
      if (!aFirst && bFirst) return 1;
      return a.sort_order - b.sort_order;
    }
    return Number(a.odds_decimal) - Number(b.odds_decimal);
  });


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
              {market.round_label && <RoundBadge label={market.round_label} />}
            </div>

            {market.line_value && (
              <div className="mb-4 p-3 rounded-lg bg-white/3 border border-white/5">
                <span className="text-xs text-white/40 uppercase tracking-wide">Line: </span>
                <span className="text-lg font-bold text-gold">{market.line_value}</span>
              </div>
            )}

            {getMarketDescription(market) && (
              <div className="mb-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="text-[11px] text-white/30 uppercase tracking-wide mb-1">Settlement Rules</div>
                <p className="text-xs text-white/50 leading-relaxed">{getMarketDescription(market)}</p>
              </div>
            )}

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
                      <span className={`text-[14px] font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                        {sel.name}
                      </span>
                    </div>
                    <span className={`text-[14px] font-black font-mono odds-display px-3 py-1.5 rounded-lg odds-btn ${isSelected ? 'selected' : ''}`}>
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
