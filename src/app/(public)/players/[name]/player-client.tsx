'use client';

import Link from 'next/link';
import { Player, Team, Market, MarketSelection, LeaderboardIndividual } from '@/lib/types';
import { MatchDefinition } from '@/lib/matches';

interface PlayerClientProps {
  player: Player;
  team: Team | null;
  markets: (Market & { selections: MarketSelection[] })[];
  leaderboard: LeaderboardIndividual | null;
  matches: MatchDefinition[];
}

export function PlayerClient({ player, team, markets, leaderboard, matches }: PlayerClientProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        href="/teams"
        className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60 transition-colors mb-6"
      >
        &larr; Back to Teams
      </Link>

      {/* Player Header */}
      <div className="bg-navy-card border border-white/8 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{player.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {team && (
                <span className="text-sm text-white/50">{team.name}</span>
              )}
              <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/50 font-mono">
                HC {player.handicap}
              </span>
            </div>
          </div>
          {leaderboard?.position && (
            <div className="text-right">
              <div className="text-2xl font-black text-gold">#{leaderboard.position}</div>
              <div className="text-[10px] text-white/30 uppercase font-bold">Overall</div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard / Points Breakdown */}
      {leaderboard && (
        <div className="bg-navy-card border border-white/8 rounded-xl p-5 mb-4">
          <h2 className="text-sm font-bold text-white mb-3">Points Breakdown</h2>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {[
              { label: 'R1', points: leaderboard.round_1_points, score: leaderboard.round_1_score },
              { label: 'R2', points: leaderboard.round_2_points, score: leaderboard.round_2_score },
              { label: 'R3', points: leaderboard.round_3_points, score: leaderboard.round_3_score },
              { label: 'R4', points: leaderboard.round_4_points, score: leaderboard.round_4_score },
            ].map((round) => (
              <div key={round.label} className="text-center">
                <div className="text-[10px] text-white/30 uppercase font-bold mb-1">{round.label}</div>
                <div className="text-lg font-bold text-green-bright">
                  {round.points != null ? round.points : '--'}
                </div>
                {round.score != null && (
                  <div className="text-[10px] text-white/30">Score: {round.score}</div>
                )}
              </div>
            ))}
            <div className="text-center">
              <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Total</div>
              <div className="text-lg font-bold text-gold">{leaderboard.total_points}</div>
            </div>
          </div>
        </div>
      )}

      {/* Matches Section */}
      {matches.length > 0 && (
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-white/5">
            <h2 className="text-sm font-bold text-white">Matches</h2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block px-5 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/30 uppercase font-bold">
                    {match.roundLabel} &middot; {match.format}
                  </span>
                  <span className="text-[10px] text-white/25">{match.course}</span>
                </div>
                <div className="text-sm text-white font-medium">
                  {match.teamA}
                  <span className="text-white/25 font-normal mx-2">vs</span>
                  {match.teamB}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Markets Section */}
      {markets.length > 0 && (
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h2 className="text-sm font-bold text-white">Markets</h2>
            <p className="text-[10px] text-white/30 mt-0.5">
              {markets.length} market{markets.length !== 1 ? 's' : ''} featuring {player.name}
            </p>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {markets.map((market) => {
              // Find selections matching this player
              const playerSelections = market.selections?.filter((sel) =>
                sel.name.toLowerCase().includes(player.name.toLowerCase())
              ) || [];

              return (
                <div key={market.id} className="px-5 py-3">
                  <Link
                    href={`/markets/${market.slug}`}
                    className="text-[13px] text-white/60 hover:text-white/80 transition-colors"
                  >
                    {market.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {playerSelections.map((sel) => (
                      <Link
                        key={sel.id}
                        href={`/markets/${market.slug}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-odds-bg/50 border border-green-bright/10 hover:border-green-bright/25 transition-colors"
                      >
                        <span className="text-xs text-white/60">{sel.name}</span>
                        <span className="text-sm text-green-bright font-bold font-mono">
                          ${Number(sel.odds_decimal).toFixed(2)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {markets.length === 0 && (
        <div className="bg-navy-card border border-white/8 rounded-xl p-5 text-center">
          <p className="text-sm text-white/30">No markets featuring {player.name} yet.</p>
        </div>
      )}
    </div>
  );
}
