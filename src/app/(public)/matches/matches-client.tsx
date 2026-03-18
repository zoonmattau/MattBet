'use client';

import { useState } from 'react';
import { Market, MarketSelection } from '@/lib/types';
import { MatchDefinition } from '@/lib/matches';
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
  matches: MatchDefinition[];
  h2hMarkets: Record<string, Market & { selections: MarketSelection[] }>;
  stablefordMarkets: (Market & { selections: MarketSelection[] })[];
}

const TABS = [
  { round: 1, label: 'R1 Friday', sub: 'Stableford -- Barnbougle Dunes' },
  { round: 2, label: 'R2 Saturday AM', sub: '2v2 Match Play -- Lost Farm' },
  { round: 3, label: 'R3 Saturday PM', sub: '2v2 Scramble -- Bougle Run' },
  { round: 4, label: 'R4 Sunday', sub: '1v1 Match Play -- Barnbougle Dunes' },
];

export function MatchesClient({ matches, h2hMarkets, stablefordMarkets }: MatchesClientProps) {
  const [activeRound, setActiveRound] = useState(2);

  const activeTab = TABS.find((t) => t.round === activeRound)!;
  const roundMatches = matches.filter((m) => m.round === activeRound);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-white mb-6">Matches</h1>

      {/* Round Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.round}
            onClick={() => setActiveRound(tab.round)}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              activeRound === tab.round
                ? 'bg-green-accent text-white shadow-lg shadow-green-accent/20'
                : 'bg-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.1]'
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
          <div className="card-elevated rounded-xl p-4">
            <p className="text-sm text-white/60">
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
                className="block card-elevated rounded-xl overflow-hidden hover:border-white/15 transition-all"
              >
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-white font-bold text-[15px]">{market.title}</span>
                  {market.line_value && (
                    <span className="text-sm text-gold font-black">{market.line_value}</span>
                  )}
                </div>
                <div>
                  {sorted.slice(0, 5).map((sel) => (
                    <div key={sel.id} className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.04] last:border-0">
                      <span className="text-[14px] text-white/80">{sel.name}</span>
                      <span className="text-[15px] text-green-bright font-black font-mono odds-display px-3 py-1.5 rounded-lg odds-btn">
                        ${Number(sel.odds_decimal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {sorted.length > 5 && (
                    <div className="px-4 py-2.5 text-sm text-green-bright/50 font-medium text-center border-t border-white/[0.04]">
                      +{sorted.length - 5} more &rarr;
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
                className="block card-elevated rounded-xl overflow-hidden hover:border-white/15 transition-all"
              >
                {/* Match header */}
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-white/40 font-medium">
                      {getTeamName(match.teamA)} vs {getTeamName(match.teamB)}
                    </div>
                    <div className="text-[11px] text-gold font-semibold">
                      {match.favourite === 'even'
                        ? `PK -${match.line}`
                        : `${match.favourite === 'a' ? match.teamA : match.teamB} -${match.line}`}
                    </div>
                  </div>
                  <div className="text-base text-white font-bold mt-1">
                    {match.teamA}
                    <span className="text-white/30 font-normal mx-2">v</span>
                    {match.teamB}
                  </div>
                </div>

                {/* Odds boxes - big and prominent like Sportsbet */}
                <div className="px-4 pb-4 pt-1">
                  {sortedSels.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {sortedSels.map((sel) => (
                        <div key={sel.id} className="odds-btn flex flex-col items-center py-3 px-2">
                          <span className="text-[11px] text-white/50 font-medium mb-1 truncate w-full text-center">{sel.name}</span>
                          <span className="text-lg text-green-bright font-black font-mono odds-display">
                            ${Number(sel.odds_decimal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-white/30 py-2">Odds coming soon</div>
                  )}
                </div>

                {/* Tap hint */}
                <div className="px-4 pb-3 flex items-center justify-between">
                  <span className="text-[10px] text-white/25">Line, totals, DNB</span>
                  <span className="text-[10px] text-green-bright/50 font-medium">View all &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
