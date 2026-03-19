'use client';

import { useState, useEffect } from 'react';
import { Market, MarketSelection, LeaderboardTeam, LeaderboardIndividual, Team, Player } from '@/lib/types';
import Link from 'next/link';
import { useBetSlip } from '@/lib/betslip-store';

const TRIP_START = new Date('2026-04-03T08:00:00+11:00'); // 8am AEST April 3

function Countdown() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = TRIP_START.getTime() - now.getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return (
    <div className="mt-5">
      <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2">Tee off in</div>
      <div className="flex gap-3 justify-center">
        {[
          { val: days, label: 'days' },
          { val: hours, label: 'hrs' },
          { val: mins, label: 'min' },
          { val: secs, label: 'sec' },
        ].map((u) => (
          <div key={u.label} className="text-center">
            <div className="text-2xl md:text-3xl font-black text-white font-mono tabular-nums w-12">{String(u.val).padStart(2, '0')}</div>
            <div className="text-[10px] text-white/30 uppercase mt-0.5">{u.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TickerBet {
  id: string;
  stake: number;
  odds: number;
  market: string;
  slug: string;
  selection: string;
  placedAt: string;
}

interface HomeClientProps {
  featuredMarkets: (Market & { selections: MarketSelection[] })[];
  teams: (Team & { players: Player[] })[];
  teamLeaderboard: LeaderboardTeam[];
  individualLeaderboard: LeaderboardIndividual[];
  tripStatus: string;
  recentBets: TickerBet[];
}

// Fake bets to pad the ticker when there aren't enough real ones
const FAKE_BETS: Omit<TickerBet, 'id' | 'placedAt'>[] = [
  { stake: 20, odds: 4.50, market: 'Trip Champion', slug: 'trip-champion', selection: 'Lewis' },
  { stake: 10, odds: 8.00, market: 'Trip Champion', slug: 'trip-champion', selection: 'Hugo' },
  { stake: 15, odds: 5.00, market: 'Trip Champion', slug: 'trip-champion', selection: 'Jacob' },
  { stake: 50, odds: 2.25, market: 'Winning Team', slug: 'winning-team', selection: 'Group 3' },
  { stake: 10, odds: 3.00, market: 'Wooden Spoon', slug: 'wooden-spoon', selection: 'Parker' },
  { stake: 25, odds: 3.50, market: 'Winning Team', slug: 'winning-team', selection: 'Group 1' },
  { stake: 5, odds: 12.00, market: 'Friday Stableford Winner', slug: 'friday-stableford-winner', selection: 'Watto' },
  { stake: 30, odds: 1.80, market: 'Overall Top 3 Finish', slug: 'overall-top-3', selection: 'Lewis' },
  { stake: 10, odds: 6.00, market: 'Wooden Spoon', slug: 'wooden-spoon', selection: 'Daniel' },
  { stake: 20, odds: 2.75, market: 'Overall Bottom 3 Finish', slug: 'overall-bottom-3', selection: 'Parker' },
  { stake: 15, odds: 9.50, market: 'Trip Champion', slug: 'trip-champion', selection: 'Brad' },
  { stake: 10, odds: 4.00, market: 'Friday Stableford Winner', slug: 'friday-stableford-winner', selection: 'Jackson' },
  { stake: 40, odds: 1.55, market: 'Overall Top 3 Finish', slug: 'overall-top-3', selection: 'Jacob' },
  { stake: 10, odds: 15.00, market: 'Trip Champion', slug: 'trip-champion', selection: 'McNaughton' },
  { stake: 25, odds: 3.25, market: 'Winning Team', slug: 'winning-team', selection: 'Group 2' },
  { stake: 200, odds: 4.50, market: 'Trip Champion', slug: 'trip-champion', selection: 'Lewis' },
  { stake: 150, odds: 8.70, market: 'Trip Champion', slug: 'trip-champion', selection: 'Brad' },
  { stake: 100, odds: 2.25, market: 'Winning Team', slug: 'winning-team', selection: 'Group 3' },
];

function BetTicker({ realBets }: { realBets: TickerBet[] }) {
  const items = realBets.map((b) => ({
    key: b.id,
    selection: b.selection,
    market: b.market,
    slug: b.slug,
    stake: b.stake,
    odds: b.odds,
  }));

  // Pad with fake bets if we have fewer than 12
  const needed = Math.max(0, 12 - items.length);
  for (let i = 0; i < needed; i++) {
    const fake = FAKE_BETS[i % FAKE_BETS.length];
    items.push({
      key: `fake-${i}`,
      selection: fake.selection,
      market: fake.market,
      slug: fake.slug,
      stake: fake.stake,
      odds: fake.odds,
    });
  }

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden -mx-4 py-3 bg-[#111b27] border-y border-white/[0.06]">
      <div className="flex animate-ticker whitespace-nowrap" style={{ width: `${doubled.length * 300}px` }}>
        {doubled.map((b, i) => (
          <Link key={`${b.key}-${i}`} href={`/markets/${b.slug}`} className={`inline-flex items-center gap-2 px-6 shrink-0 hover:bg-white/[0.03] rounded ${b.stake >= 100 ? 'py-0.5 rounded-full bg-gold/10 border border-gold/15' : ''}`}>
            {b.stake >= 100 && <span className="text-gold text-[10px] font-black uppercase">Big Bet</span>}
            <span className="text-green-bright font-bold text-sm">${b.stake}</span>
            <span className="text-white/40 text-sm">on</span>
            <span className="text-white font-bold text-sm">{b.selection}</span>
            <span className="text-white/40 text-sm">@</span>
            <span className="text-green-bright font-black text-sm font-mono">${b.odds.toFixed(2)}</span>
            <span className="text-white/20 text-xs">({b.market})</span>
            <span className="text-white/10">|</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FeaturedMarketCard({ market, sorted }: { market: Market & { selections: MarketSelection[] }; sorted: MarketSelection[] }) {
  const [expanded, setExpanded] = useState(false);
  const { items: betSlip, addItem } = useBetSlip();
  const visible = expanded ? sorted : sorted.slice(0, 3);

  return (
    <div className="card-elevated card-featured rounded-xl overflow-hidden">
      <Link href={`/markets/${market.slug}`}
        className="block px-4 py-3 flex items-center justify-between border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
        <span className="text-white font-bold">{market.title}</span>
        <span className="text-[10px] text-green-bright font-semibold uppercase tracking-wide">
          {sorted.length} runners
        </span>
      </Link>
      <div className="p-3">
        <div>
          {visible.map((sel) => {
            const isSelected = betSlip.some((b) => b.selection.id === sel.id);
            return (
              <button key={sel.id}
                onClick={() => addItem(market, sel)}
                className="w-full flex items-center justify-between py-2.5 px-1 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors text-left">
                <span className="text-[14px] text-white/70 font-medium">{sel.name}</span>
                <span className={`text-[14px] font-black font-mono odds-display px-3 py-1.5 rounded-lg odds-btn ${isSelected ? 'selected' : ''}`}>
                  ${Number(sel.odds_decimal).toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
        {sorted.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-2 text-center text-xs text-green-bright font-semibold py-2 hover:text-green-bright/80 transition-colors"
          >
            {expanded ? 'Show less' : `+${sorted.length - 3} more selections`}
          </button>
        )}
      </div>
    </div>
  );
}

export function HomeClient({
  featuredMarkets,
  teams,
  teamLeaderboard,
  individualLeaderboard,
  tripStatus,
  recentBets,
}: HomeClientProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 pb-8">

      {/* ===== HERO BANNER ===== */}
      <section className="-mx-4 px-6 pt-8 pb-6 bg-[#0f1923] border-b border-white/[0.06]">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
            <span className="text-white">Matt</span><span className="text-green-bright">Bet</span>
          </h1>
          <p className="text-white/40 text-sm mt-3 font-medium">Barnbougle, Tasmania &middot; 3-5 April 2026</p>

          {/* Quick action buttons */}
          {/* Countdown */}
          <Countdown />

          <div className="flex gap-3 justify-center mt-5">
            <Link href="/matches"
              className="px-6 py-2.5 rounded-lg bg-green-bright text-white font-bold text-sm hover:bg-green-bright/90 transition-all">
              View Matches
            </Link>
            <Link href="/markets"
              className="px-6 py-2.5 rounded-lg bg-white/[0.08] text-white font-bold text-sm hover:bg-white/[0.12] border border-white/[0.1] transition-all">
              All Markets
            </Link>
          </div>
        </div>
      </section>

      {/* ===== BET TICKER ===== */}
      <BetTicker realBets={recentBets} />

      <div className="mt-6" />

      {/* ===== FEATURED MARKETS ===== */}
      {featuredMarkets.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white">Featured Markets</h2>
            <Link href="/markets" className="text-xs text-green-bright font-semibold hover:text-green-bright/80">All Markets &rarr;</Link>
          </div>

          <div className="space-y-4">
            {featuredMarkets.map((market) => {
              const hasGroups = market.selections.some((s) => s.name.startsWith('Group '));
              const sorted = [...market.selections].sort((a, b) =>
                hasGroups ? a.sort_order - b.sort_order : Number(a.odds_decimal) - Number(b.odds_decimal)
              );
              return (
                <FeaturedMarketCard key={market.id} market={market} sorted={sorted} />
              );
            })}
          </div>
        </section>
      )}

      {/* ===== MATCH DAY QUICK LINKS ===== */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-white mb-4">Matches</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/matches?round=1', label: 'R1 Friday', sub: 'Stableford', course: 'Barnbougle Dunes' },
            { href: '/matches?round=2', label: 'R2 Saturday AM', sub: '2v2 Match Play', course: 'Lost Farm' },
            { href: '/matches?round=3', label: 'R3 Saturday PM', sub: '2v2 Scramble', course: 'Bougle Run' },
            { href: '/matches?round=4', label: 'R4 Sunday', sub: '1v1 Match Play', course: 'Barnbougle Dunes' },
          ].map((r) => (
            <Link key={r.href} href={r.href}
              className="card-elevated rounded-xl p-4 hover:border-white/15 transition-all">
              <div className="text-white font-bold text-sm">{r.label}</div>
              <div className="text-white/50 text-xs mt-0.5">{r.sub}</div>
              <div className="text-white/25 text-[11px] mt-1">{r.course}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== LEADERBOARD SNAPSHOT ===== */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white">Leaderboard</h2>
          <Link href="/leaderboard" className="text-xs text-green-bright font-semibold hover:text-green-bright/80">Full Board &rarr;</Link>
        </div>

        {/* Team standings - horizontal cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {teamLeaderboard.slice(0, 3).map((t, i) => (
            <div key={t.id} className={`card-elevated rounded-xl p-3 text-center ${i === 0 ? 'border-gold/20' : ''}`}>
              <div className={`text-2xl font-black ${i === 0 ? 'text-gold' : i === 1 ? 'text-white/40' : 'text-white/25'}`}>
                {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}
              </div>
              <div className="text-white font-bold text-sm mt-1">{t.team_name}</div>
              <div className="text-green-bright font-black text-xl font-mono mt-1">{t.total_points}</div>
              <div className="text-white/25 text-[10px] mt-0.5">
                {teams.find((tm) => tm.name === t.team_name)?.players?.map((p) => p.name).join(', ')}
              </div>
            </div>
          ))}
        </div>

        {/* Individual top 5 */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-white/50 text-xs font-bold uppercase tracking-wide">Top Players</span>
          </div>
          {individualLeaderboard.slice(0, 5).map((e, i) => (
            <div key={e.id} className={`px-4 py-2.5 flex items-center gap-3 ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
              <span className={`text-base font-black w-6 text-center ${i === 0 ? 'text-gold' : i < 3 ? 'text-white/50' : 'text-white/20'}`}>
                {e.position || i + 1}
              </span>
              <span className="text-sm text-white font-semibold flex-1">{e.player_name}</span>
              <span className="text-[11px] text-white/30 font-medium">{e.team_name}</span>
              <span className="text-base text-green-bright font-black font-mono w-10 text-right">{e.total_points}</span>
            </div>
          ))}
          <Link href="/leaderboard" className="block px-4 py-2.5 text-center text-xs text-green-bright/60 font-medium border-t border-white/[0.04] hover:text-green-bright hover:bg-white/[0.02] transition-colors">
            View all 12 players &rarr;
          </Link>
        </div>
      </section>

      {/* ===== QUICK LINKS FOOTER ===== */}
      <section className="mb-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { href: '/teams', label: 'Teams', sub: '3 groups' },
            { href: '/rules', label: 'Rules', sub: 'Format & scoring' },
            { href: '/my-bets', label: 'My Bets', sub: 'Track bets' },
          ].map((n) => (
            <Link key={n.href} href={n.href} className="card-elevated rounded-xl py-3 px-3 text-center hover:border-white/15 transition-all">
              <div className="text-sm text-white font-bold">{n.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{n.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-center text-[10px] text-white/15 pb-2">
        For entertainment only. Not a licensed betting platform.
      </p>
    </div>
  );
}
