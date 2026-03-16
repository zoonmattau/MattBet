'use client';

import { useState } from 'react';
import { Market, MarketSelection } from '@/lib/types';
import { MATCHES } from '@/lib/matches';
import { ROUNDS } from '@/lib/constants';
import Link from 'next/link';

const PLAYER_TEAMS: Record<string, string> = {
  'Hugo': 'Group 1', 'Bails': 'Group 1', 'Brad': 'Group 1', 'Watto': 'Group 1',
  'Finn': 'Group 2', 'Ando': 'Group 2', 'Jackson': 'Group 2', 'McNaughton': 'Group 2',
  'Daniel': 'Group 3', 'Jacob': 'Group 3', 'Lewis': 'Group 3', 'Parker': 'Group 3',
};

function getTeamName(label: string): string {
  const firstName = label.split(' and ')[0];
  return PLAYER_TEAMS[firstName] || '';
}

interface MatchesClientProps {
  h2hMarkets: Record<string, Market & { selections: MarketSelection[] }>;
  stablefordMarkets: (Market & { selections: MarketSelection[] })[];
}

const TABS = [
  { round: 1, label: 'R1 Friday', sub: 'Stableford -- Barnbougle Dunes' },
  { round: 2, label: 'R2 Saturday AM', sub: '2v2 Match Play -- Lost Farm' },
  { round: 3, label: 'R3 Saturday PM', sub: '2v2 Scramble -- Bougle Run' },
  { round: 4, label: 'R4 Sunday', sub: '1v1 Match Play -- Barnbougle Dunes' },
];

export function MatchesClient({ h2hMarkets, stablefordMarkets }: MatchesClientProps) {
  const [activeRound, setActiveRound] = useState(2);

  const activeTab = TABS.find((t) => t.round === activeRound)!;
  const roundMatches = MATCHES.filter((m) => m.round === activeRound);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-white mb-6">Matches</h1>

      {/* Round Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.round}
            onClick={() => setActiveRound(tab.round)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeRound === tab.round
                ? 'bg-green-accent text-white'
                : 'bg-white/5 text-white/50 hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Round Info */}
      <div className="mb-5">
        <p className="text-sm text-white/40">{activeTab.sub}</p>
      </div>

      {/* Round 1 - Stableford markets */}
      {activeRound === 1 && (
        <div className="space-y-4">
          <div className="bg-navy-card border border-white/8 rounded-xl p-4">
            <p className="text-sm text-white/50">
              All 12 players compete individually. Points allocated for finishing order:
              1st gets 8 pts down to 8th getting 1 pt. Bottom 4 receive no points.
            </p>
          </div>

          {stablefordMarkets.map((market) => {
            const sorted = [...market.selections].sort(
              (a, b) => Number(a.odds_decimal) - Number(b.odds_decimal)
            );
            return (
              <Link
                key={market.id}
                href={`/markets/${market.slug}`}
                className="block bg-navy-card border border-white/8 rounded-xl overflow-hidden hover:border-white/15 transition-colors"
              >
                <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">{market.title}</span>
                  {market.line_value && (
                    <span className="text-xs text-gold font-bold">Line: {market.line_value}</span>
                  )}
                </div>
                <div className="divide-y divide-white/3">
                  {sorted.slice(0, 4).map((sel) => (
                    <div key={sel.id} className="px-4 py-2 flex items-center justify-between">
                      <span className="text-sm text-white/70">{sel.name}</span>
                      <span className="text-sm text-green-bright font-bold font-mono">
                        ${Number(sel.odds_decimal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {sorted.length > 4 && (
                    <div className="px-4 py-2 text-xs text-white/25">
                      +{sorted.length - 4} more selections
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Match List */}
      {activeRound > 1 && (
        <div className="space-y-2">
          {roundMatches.map((match) => {
            const h2h = h2hMarkets[match.marketSlugs.h2h];
            const sortedSels = h2h
              ? [...h2h.selections].sort((a, b) => Number(a.odds_decimal) - Number(b.odds_decimal))
              : [];
            const favSel = sortedSels[0];
            const dogSel = sortedSels[1];

            return (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block bg-navy-card border border-white/8 rounded-xl overflow-hidden hover:border-white/15 transition-colors"
              >
                <div className="px-4 py-4">
                  {/* Match title row */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="text-sm text-white font-bold">
                        {match.teamA}
                        <span className="text-white/25 font-normal mx-2">vs</span>
                        {match.teamB}
                      </div>
                      <div className="text-[10px] text-white/30 mt-0.5">
                        {getTeamName(match.teamA)} vs {getTeamName(match.teamB)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-gold font-bold">
                        {match.favourite === 'even'
                          ? `PK -${match.line}`
                          : `${match.favourite === 'a' ? match.teamA : match.teamB} -${match.line}`}
                      </span>
                    </div>
                  </div>

                  {/* Odds row */}
                  {sortedSels.length > 0 ? (
                    <div className="flex gap-2">
                      {sortedSels.map((sel) => (
                        <div key={sel.id} className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg bg-odds-bg/50 border border-green-bright/10">
                          <span className="text-xs text-white/60">{sel.name}</span>
                          <span className="text-sm text-green-bright font-bold font-mono">
                            ${Number(sel.odds_decimal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-white/25">Odds coming soon</div>
                  )}

                  {/* Footer hint */}
                  <div className="mt-2 text-[10px] text-white/20">
                    Expand -- line, margin, totals
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
