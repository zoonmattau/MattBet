'use client';

import { useState } from 'react';
import { Market, MarketSelection, LeaderboardTeam, LeaderboardIndividual, Team, Player } from '@/lib/types';
import Link from 'next/link';
import { ROUNDS, ITINERARY } from '@/lib/constants';

interface HomeClientProps {
  featuredMarkets: (Market & { selections: MarketSelection[] })[];
  teams: (Team & { players: Player[] })[];
  teamLeaderboard: LeaderboardTeam[];
  individualLeaderboard: LeaderboardIndividual[];
  tripStatus: string;
}

export function HomeClient({
  featuredMarkets,
  teams,
  teamLeaderboard,
  individualLeaderboard,
  tripStatus,
}: HomeClientProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Hero */}
      <section className="pt-4 pb-2 text-center">
        <p className="text-green-bright text-[11px] font-semibold tracking-widest uppercase mb-3">{tripStatus}</p>
        <h1 className="text-3xl font-black text-white tracking-tight">MattBet</h1>
        <p className="text-white/40 text-sm mt-1">Barnbougle, Tasmania -- 3-5 April 2026</p>
      </section>

      {/* Courses */}
      <section>
        <h2 className="text-sm font-bold text-white mb-3">The Courses</h2>
        <div className="bg-navy-card rounded-lg overflow-hidden divide-y divide-white/[0.06]">
          {[
            { name: 'Barnbougle Dunes', r: 'R1 + R4', d: 'Links. Wind. Pot bunkers. Bass Strait.' },
            { name: 'Lost Farm', r: 'R2', d: 'Through the dunes. Wide but demanding.' },
            { name: 'Bougle Run', r: 'R3', d: 'Short course. Scramble territory.' },
          ].map((c) => (
            <div key={c.name} className="px-4 py-3 flex items-start justify-between">
              <div>
                <div className="text-[13px] text-white font-medium">{c.name}</div>
                <div className="text-[12px] text-white/35 mt-0.5">{c.d}</div>
              </div>
              <span className="text-[11px] text-gold font-medium shrink-0 ml-3">{c.r}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Rounds */}
      <section>
        <h2 className="text-sm font-bold text-white mb-3">The Rounds</h2>
        <div className="bg-navy-card rounded-lg overflow-hidden divide-y divide-white/[0.06]">
          {ROUNDS.map((r) => (
            <div key={r.number} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gold font-bold">R{r.number}</span>
                  <span className="text-[13px] text-white font-medium">{r.format}</span>
                </div>
                <span className="text-[12px] text-white/35">{r.teeTime}</span>
              </div>
              <div className="text-[12px] text-white/35 mt-1 pl-7">{r.course}</div>
              <div className="mt-2 pl-7">
                {r.number === 1 ? (
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { pos: '1st', pts: 6 }, { pos: '2nd', pts: 5 }, { pos: '3rd', pts: 4 },
                      { pos: '4th', pts: 3 }, { pos: '5th', pts: 2 }, { pos: '6th', pts: 2 },
                      { pos: '7th', pts: 1 }, { pos: '8th', pts: 1 },
                    ].map((p) => (
                      <div key={p.pos} className="text-center py-1 rounded bg-white/[0.04]">
                        <div className="text-[9px] text-white/30">{p.pos}</div>
                        <div className="text-[11px] text-green-bright font-bold">{p.pts}</div>
                      </div>
                    ))}
                    <div className="text-center py-1 rounded bg-white/[0.03] col-span-2">
                      <div className="text-[9px] text-white/20">9-12th</div>
                      <div className="text-[11px] text-white/25 font-bold">0</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-3 gap-1 mb-1">
                      <div className="text-center py-1.5 rounded bg-white/[0.04]">
                        <div className="text-[9px] text-white/30">Win</div>
                        <div className="text-[11px] text-green-bright font-bold">{r.number === 4 ? '4pts' : '6pts'}</div>
                      </div>
                      <div className="text-center py-1.5 rounded bg-white/[0.03]">
                        <div className="text-[9px] text-white/20">Halved</div>
                        <div className="text-[11px] text-gold font-bold">{r.number === 4 ? '2pts' : '3pts'}</div>
                      </div>
                      <div className="text-center py-1.5 rounded bg-white/[0.03]">
                        <div className="text-[9px] text-white/20">Lose</div>
                        <div className="text-[11px] text-white/25 font-bold">0pts</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-white/30">
                      +0.5pts per hole won by
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Standings */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Standings</h2>
          <Link href="/leaderboard" className="text-[11px] text-green-bright/60 hover:text-green-bright">Full Board</Link>
        </div>
        <div className="bg-navy-card rounded-lg overflow-hidden divide-y divide-white/[0.06]">
          {teamLeaderboard.map((e, i) => (
            <div key={e.id} className="px-4 py-3 flex items-center gap-3">
              <span className={`text-base font-black w-5 ${i === 0 ? 'text-gold' : 'text-white/20'}`}>{e.position || i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-white font-semibold">{e.team_name}</div>
                <div className="text-[11px] text-white/30 mt-0.5">
                  {teams.find((t) => t.name === e.team_name)?.players?.sort((a, b) => a.name.localeCompare(b.name)).map((p) => p.name).join(', ')}
                </div>
              </div>
              <span className="text-[14px] text-green-bright font-bold">{e.total_points}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Individual */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Individual</h2>
          <Link href="/leaderboard" className="text-[11px] text-green-bright/60 hover:text-green-bright">Full Board</Link>
        </div>
        <div className="bg-navy-card rounded-lg overflow-hidden">
          {individualLeaderboard.slice(0, 12).map((e, i) => (
            <div key={e.id} className={`px-4 py-2 flex items-center gap-2 ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
              <span className="text-[11px] text-white/25 font-mono w-4 text-right">{e.position || i + 1}</span>
              <span className="text-[13px] text-white/70 flex-1">{e.player_name}</span>
              <span className="text-[11px] text-white/25">{e.team_name}</span>
              <span className="text-[13px] text-green-bright font-bold w-6 text-right">{e.total_points}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Teams + Featured side by side on desktop */}
      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-bold text-white">Teams</h2>
            <Link href="/teams" className="text-[11px] text-green-bright/60 hover:text-green-bright">Details</Link>
          </div>
          <div className="bg-navy-card rounded-lg overflow-hidden divide-y divide-white/[0.06]">
            {teams.map((team) => (
              <div key={team.id} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] text-white font-semibold">{team.name}</span>
                  {team.name === 'Group 2' && <span className="text-[10px] text-gold font-semibold uppercase">Fav</span>}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {team.players?.sort((a, b) => a.handicap - b.handicap).map((p) => (
                    <span key={p.id} className="text-[12px] text-white/40">{p.name} <span className="text-white/20">{p.handicap}</span></span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {featuredMarkets.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-bold text-white">Featured</h2>
              <Link href="/markets" className="text-[11px] text-green-bright/60 hover:text-green-bright">All Markets</Link>
            </div>
            <div className="bg-navy-card rounded-lg overflow-hidden divide-y divide-white/[0.06]">
              {featuredMarkets.map((market) => {
                const sorted = [...market.selections].sort((a, b) => Number(a.odds_decimal) - Number(b.odds_decimal));
                return (
                  <Link key={market.id} href={`/markets/${market.slug}`} className="block px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="text-[13px] text-white/70 font-medium mb-1.5">{market.title}</div>
                    {sorted.slice(0, 3).map((sel) => (
                      <div key={sel.id} className="flex justify-between py-0.5">
                        <span className="text-[12px] text-white/40">{sel.name}</span>
                        <span className="text-[12px] text-green-bright font-bold font-mono">${Number(sel.odds_decimal).toFixed(2)}</span>
                      </div>
                    ))}
                    {sorted.length > 3 && <span className="text-[11px] text-white/20">+{sorted.length - 3} more</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { href: '/markets', l: 'Markets', s: 'Place bets' },
          { href: '/leaderboard', l: 'Board', s: 'Standings' },
          { href: '/teams', l: 'Teams', s: 'Players' },
          { href: '/rules', l: 'Rules', s: 'Format' },
        ].map((n) => (
          <Link key={n.href} href={n.href} className="bg-navy-card rounded-lg py-3 px-2 text-center hover:bg-surface transition-colors">
            <div className="text-[12px] text-white/60 font-medium">{n.l}</div>
            <div className="text-[10px] text-white/25 mt-0.5">{n.s}</div>
          </Link>
        ))}
      </div>

      <p className="text-center text-[10px] text-white/20 pb-2">
        For entertainment only. Not a licensed betting platform.
      </p>
    </div>
  );
}
