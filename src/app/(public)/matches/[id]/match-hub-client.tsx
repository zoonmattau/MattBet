'use client';

import { useState } from 'react';
import { Market, MarketSelection, BetSlipItem } from '@/lib/types';
import { MatchDefinition } from '@/lib/matches';
import { BetSlip } from '@/components/bet-slip';
import { StatusBadge } from '@/components/status-badge';
import Link from 'next/link';

interface MatchHubClientProps {
  match: MatchDefinition;
  markets: Record<string, Market & { selections: MarketSelection[] }>;
}

export function MatchHubClient({ match, markets }: MatchHubClientProps) {
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);

  const handleSelectBet = (market: Market, selection: MarketSelection) => {
    setBetSlip((prev) => {
      const existing = prev.find((item) => item.selection.id === selection.id);
      if (existing) return prev.filter((item) => item.selection.id !== selection.id);
      const filtered = prev.filter((item) => item.market.id !== market.id);
      return [...filtered, { market, selection, stake: 0 }];
    });
  };

  const h2h = markets[match.marketSlugs.h2h];
  const line = markets[match.marketSlugs.line];
  const margin = markets[match.marketSlugs.margin];
  const totalA = markets[match.marketSlugs.totalA];
  const totalB = markets[match.marketSlugs.totalB];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/matches" className="text-sm text-white/40 hover:text-white/60 transition-colors mb-4 inline-block">
        Back to Matches
      </Link>

      {/* Match Header */}
      <div className="bg-navy-card border border-white/8 rounded-xl p-5 mb-6">
        <div className="text-center">
          <div className="flex items-center gap-1.5 justify-center mb-3">
            <Link
              href={`/markets?tab=r${match.round}`}
              className="text-[10px] px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/20 font-medium hover:bg-gold/25 transition-colors"
            >
              {match.roundLabel} -- All Matches
            </Link>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 font-medium">
              {match.format}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mb-1">
            {match.teamA} <span className="text-white/30 font-normal mx-2">vs</span> {match.teamB}
          </h1>
          <p className="text-sm text-white/40 mb-2">{match.course}</p>
          <div className="inline-flex px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold">
            {match.favourite === 'even'
              ? `Pick -- Line ${match.line} holes`
              : `${match.favourite === 'a' ? match.teamA : match.teamB} -${match.line} holes`}
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${betSlip.length > 0 ? 'lg:grid-cols-3' : ''}`}>
        <div className={`${betSlip.length > 0 ? 'lg:col-span-2' : ''} space-y-4`}>
          {/* Head to Head */}
          {h2h && (
            <MarketBlock
              label="Head to Head"
              market={h2h}
              betSlip={betSlip}
              onSelect={handleSelectBet}
            />
          )}

          {/* Line */}
          {line && (
            <MarketBlock
              label="Line"
              market={line}
              betSlip={betSlip}
              onSelect={handleSelectBet}
            />
          )}

          {/* Margin */}
          {margin && (
            <MarketBlock
              label="Winning Margin"
              market={margin}
              betSlip={betSlip}
              onSelect={handleSelectBet}
            />
          )}

          {/* Totals */}
          <div className="grid gap-4 md:grid-cols-2">
            {totalA && (
              <MarketBlock
                label={`${match.teamA} Total Holes`}
                market={totalA}
                betSlip={betSlip}
                onSelect={handleSelectBet}
              />
            )}
            {totalB && (
              <MarketBlock
                label={`${match.teamB} Total Holes`}
                market={totalB}
                betSlip={betSlip}
                onSelect={handleSelectBet}
              />
            )}
          </div>

          {/* Match Info */}
          <div className="bg-navy-card border border-white/8 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">How Match Play Works</h3>
            <div className="text-xs text-white/50 space-y-2">
              <p>
                Each hole is won by the player or team with the lowest score on that hole.
                The match is scored by holes up -- if you win 3 holes and your opponent wins 1,
                you are 2 up with however many holes remaining.
              </p>
              <p>
                The match ends when one side has an insurmountable lead. For example, if you are
                4 up with only 3 holes to play, the match is over -- recorded as 4&3. If the match
                is all square after 18, it is halved.
              </p>
              <p className="text-white/30">
                Line bets settle on the final margin. A -1.5 line means the favourite must win by
                2 or more holes to cover. A halved match counts as 0.
              </p>
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

function MarketBlock({
  label,
  market,
  betSlip,
  onSelect,
}: {
  label: string;
  market: Market & { selections: MarketSelection[] };
  betSlip: BetSlipItem[];
  onSelect: (market: Market, selection: MarketSelection) => void;
}) {
  const isDisabled = market.status !== 'open';
  const sorted = [...market.selections].sort(
    (a, b) => Number(a.odds_decimal) - Number(b.odds_decimal)
  );

  return (
    <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">{label}</span>
        <div className="flex items-center gap-2">
          <StatusBadge status={market.status} />
        </div>
      </div>
      <div className="divide-y divide-white/3">
        {sorted.map((sel) => {
          const isSelected = betSlip.some((b) => b.selection.id === sel.id);
          return (
            <button
              key={sel.id}
              onClick={() => !isDisabled && onSelect(market, sel)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors disabled:cursor-default ${
                isSelected ? 'bg-green-accent/15' : 'hover:bg-white/3'
              }`}
            >
              <span className={`text-sm ${isSelected ? 'text-white font-semibold' : 'text-white/70'}`}>
                {sel.name}
              </span>
              <span className={`text-sm font-bold font-mono ${isSelected ? 'text-green-bright' : 'text-green-bright/80'}`}>
                ${Number(sel.odds_decimal).toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
