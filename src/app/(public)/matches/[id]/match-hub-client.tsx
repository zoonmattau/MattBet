'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Market, MarketSelection, BetSlipItem } from '@/lib/types';
import { MatchDefinition } from '@/lib/matches';

const PLAYER_TEAMS: Record<string, string> = {
  'Hugo': 'Grp 1', 'Bails': 'Grp 1', 'Brad': 'Grp 1', 'Watto': 'Grp 1',
  'Finn': 'Grp 2', 'Ando': 'Grp 2', 'Jackson': 'Grp 2', 'McNaughton': 'Grp 2',
  'Daniel': 'Grp 3', 'Jacob': 'Grp 3', 'Lewis': 'Grp 3', 'Parker': 'Grp 3',
};
function getTeam(name: string): string {
  return PLAYER_TEAMS[name.split(' and ')[0]] || '';
}
import { BetSlip } from '@/components/bet-slip';
import Link from 'next/link';
import { getMatchSims, getMatchConfig, registerMatchFromDefinition } from '@/lib/match-simulator';
import { getAlternateLineOdds, getAlternateTotalOdds } from '@/lib/match-simulator-client';
import { useBetSlip } from '@/lib/betslip-store';

interface MatchHubClientProps {
  matches: MatchDefinition[];
  match: MatchDefinition;
  markets: Record<string, Market & { selections: MarketSelection[] }>;
  allH2H: Record<string, Market & { selections: MarketSelection[] }>;
  fridayWinner: (Market & { selections: MarketSelection[] }) | null;
}

export function MatchHubClient({ matches, match, markets, allH2H, fridayWinner }: MatchHubClientProps) {
  const { items: betSlip, addItem, removeItem, clear } = useBetSlip();

  const handleSelectBet = (market: Market, selection: MarketSelection) => {
    addItem(market, selection);
  };

  const h2h = markets[match.marketSlugs.h2h];
  const line = markets[match.marketSlugs.line];
  const totalA = markets[match.marketSlugs.totalA];
  const totalB = markets[match.marketSlugs.totalB];

  // Register dynamic config and generate sims ONCE
  const sharedSims = useClientSims(match);

  const [activeRound, setActiveRound] = useState(match.round);
  const roundMatches = matches.filter((m) => m.round === activeRound);
  const allRounds = [
    { num: 1, label: 'Friday' },
    { num: 2, label: 'Sat AM' },
    { num: 3, label: 'Sat PM' },
    { num: 4, label: 'Sunday' },
  ];

  return (
    <div>
      {/* Scrolling match bar */}
      <div className="border-b border-white/[0.06] overflow-x-auto">
        <div className="max-w-4xl mx-auto px-4">
          {/* Round tabs */}
          <div className="flex gap-0.5 pt-2">
            {allRounds.map((r) => (
              <button
                key={r.num}
                onClick={() => setActiveRound(r.num)}
                className={`px-3 py-1.5 text-[11px] font-medium whitespace-nowrap rounded-t transition-colors ${
                  r.num === activeRound ? 'bg-white/[0.06] text-white' : 'text-white/30 hover:text-white/50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {/* Matches in selected round */}
          <div className="flex gap-1 py-2 overflow-x-auto">
            {activeRound === 1 ? (
              <>
                {fridayWinner && [...fridayWinner.selections]
                  .sort((a, b) => Number(a.odds_decimal) - Number(b.odds_decimal))
                  .slice(0, 5)
                  .map((sel) => (
                    <Link
                      key={sel.id}
                      href="/markets?tab=r1"
                      className="shrink-0 px-3 py-2 rounded-lg text-[11px] whitespace-nowrap bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.05]"
                    >
                      <span className="font-medium text-white/50">{sel.name}</span>
                      <div className="text-[10px] text-green-bright/70 font-bold font-mono mt-0.5">
                        ${Number(sel.odds_decimal).toFixed(2)}
                      </div>
                    </Link>
                  ))}
                <Link
                  href="/markets?tab=r1"
                  className="shrink-0 px-3 py-2 rounded-lg text-[11px] whitespace-nowrap bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/50 flex items-center"
                >
                  All Markets
                </Link>
              </>
            ) : (
              roundMatches.map((m) => {
                const isCurrent = m.id === match.id;
                return (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className={`shrink-0 px-3 py-2 rounded-lg text-[11px] whitespace-nowrap transition-colors ${
                      isCurrent
                        ? 'bg-green-bright/10 border border-green-bright/20 text-white'
                        : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{m.teamA}</span>
                      <span className="text-white/15">v</span>
                      <span className="font-medium">{m.teamB}</span>
                    </div>
                    <div className="text-[9px] text-white/20 mt-0.5">{getTeam(m.teamA)} v {getTeam(m.teamB)}</div>
                    <MatchBarOdds h2hMarket={allH2H[m.marketSlugs.h2h]} />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
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
          <p className="text-sm text-white/40 mb-3">{match.course}</p>
          {h2h && <HeaderOdds match={match} market={h2h} />}
        </div>
      </div>

      {/* Bet slip on mobile - top */}
      {betSlip.length > 0 && (
        <div className="lg:hidden mb-4">
          <BetSlip
            items={betSlip}
            onRemove={removeItem}
            onClear={clear}
            onBetPlaced={clear}
            allMarkets={Object.values(markets)}
          />
        </div>
      )}

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

          {/* DNB */}
          <SimDNBBlock match={match} betSlip={betSlip} onSelect={handleSelectBet} sims={sharedSims} />

          {/* Line with alternate picker */}
          <SimLineBlock match={match} betSlip={betSlip} onSelect={handleSelectBet} dbMarket={line} sims={sharedSims} />

          {/* Totals with alternate pickers */}
          <div className="text-[10px] text-white/25 px-1">Total holes won out of {match.round === 3 ? '14' : '18'}. Halved holes don't count for either side.</div>
          <div className="grid gap-4 md:grid-cols-2">
            <SimTotalBlock match={match} team="a" betSlip={betSlip} onSelect={handleSelectBet} dbMarket={totalA} sims={sharedSims} />
            <SimTotalBlock match={match} team="b" betSlip={betSlip} onSelect={handleSelectBet} dbMarket={totalB} sims={sharedSims} />
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

        <div className="hidden lg:block lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <BetSlip
              items={betSlip}
              onRemove={removeItem}
              onClear={clear}
              onBetPlaced={clear}
              allMarkets={Object.values(markets)}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

const LINE_OPTIONS = Array.from({ length: 71 }, (_, i) => (17.5 - i * 0.5)); // +17.5 to -17.5 (includes 0)
const TOTAL_OPTIONS = Array.from({ length: 35 }, (_, i) => (i + 1) * 0.5); // 0.5 to 17.5

function HeaderOdds({ match, market }: { match: MatchDefinition; market: Market & { selections: MarketSelection[] } }) {
  const sorted = [...market.selections].sort((a, b) => a.sort_order - b.sort_order);
  const nonHalved = sorted.filter((s) => s.name.toLowerCase() !== 'halved');
  const halved = sorted.find((s) => s.name.toLowerCase() === 'halved');

  return (
    <div className="flex items-center justify-center gap-4">
      {nonHalved[0] && (
        <div className="text-center">
          <div className="text-[10px] text-white/30 mb-0.5">{nonHalved[0].name}</div>
          <div className="text-green-bright font-bold font-mono text-lg">${Number(nonHalved[0].odds_decimal).toFixed(2)}</div>
        </div>
      )}
      {halved && (
        <div className="text-center">
          <div className="text-[10px] text-white/30 mb-0.5">Halved</div>
          <div className="text-white/50 font-bold font-mono text-lg">${Number(halved.odds_decimal).toFixed(2)}</div>
        </div>
      )}
      {nonHalved[1] && (
        <div className="text-center">
          <div className="text-[10px] text-white/30 mb-0.5">{nonHalved[1].name}</div>
          <div className="text-green-bright font-bold font-mono text-lg">${Number(nonHalved[1].odds_decimal).toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}

function MatchBarOdds({ h2hMarket }: { h2hMarket?: Market & { selections: MarketSelection[] } }) {
  if (!h2hMarket) return null;
  const sels = [...h2hMarket.selections]
    .filter((s) => s.name.toLowerCase() !== 'halved')
    .sort((a, b) => Number(a.odds_decimal) - Number(b.odds_decimal));
  if (sels.length < 2) return null;
  return (
    <div className="flex items-center gap-2 mt-1 text-[10px]">
      <span className="text-green-bright/70 font-bold font-mono">${Number(sels[0].odds_decimal).toFixed(2)}</span>
      <span className="text-white/15">-</span>
      <span className="text-green-bright/70 font-bold font-mono">${Number(sels[1].odds_decimal).toFixed(2)}</span>
    </div>
  );
}

function useClientSims(match: MatchDefinition) {
  const [sims, setSims] = useState<import('@/lib/match-simulator').SimResult[]>([]);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      // Register dynamic config so sims use the current pairings/handicaps
      registerMatchFromDefinition(match);
      setSims(getMatchSims(match.slugPrefix));
    }
  }, [match]);

  return sims;
}

function SimDNBBlock({
  match,
  betSlip,
  onSelect,
  sims,
}: {
  match: MatchDefinition;
  betSlip: BetSlipItem[];
  onSelect: (market: Market, selection: MarketSelection) => void;
  sims: import('@/lib/match-simulator').SimResult[];
}) {
  if (sims.length === 0) return null;

  const aWins = sims.filter((s) => s.winner === 'a').length;
  const bWins = sims.filter((s) => s.winner === 'b').length;
  const decided = aWins + bWins;
  const round5 = (v: number) => v >= 10 ? Math.round(v) : parseFloat((Math.round(v * 20) / 20).toFixed(2));
  const aOdds = round5(Math.max(1.01, (decided / (aWins || 1)) / 1.10));
  const bOdds = round5(Math.max(1.01, (decided / (bWins || 1)) / 1.10));

  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5">
        <span className="text-white font-semibold text-sm">Draw No Bet</span>
      </div>
      <div className="divide-y divide-white/3">
        <SimOddsRow
          label={match.teamA}
          odds={aOdds}
          marketTitle={`${match.teamA} vs ${match.teamB} DNB`}
          selectionName={`${match.teamA} DNB`}
          matchSlug={`${match.slugPrefix}-dnb`}
          betSlip={betSlip}
          onSelect={onSelect}
        />
        <SimOddsRow
          label={match.teamB}
          odds={bOdds}
          marketTitle={`${match.teamA} vs ${match.teamB} DNB`}
          selectionName={`${match.teamB} DNB`}
          matchSlug={`${match.slugPrefix}-dnb`}
          betSlip={betSlip}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

function SimLineBlock({
  match,
  betSlip,
  onSelect,
  dbMarket,
  sims,
}: {
  match: MatchDefinition;
  betSlip: BetSlipItem[];
  onSelect: (market: Market, selection: MarketSelection) => void;
  dbMarket?: Market & { selections: MarketSelection[] };
  sims: import('@/lib/match-simulator').SimResult[];
}) {
  const config = useMemo(() => getMatchConfig(match.slugPrefix), [match.slugPrefix]);

  const bestLine = useMemo(() => {
    if (sims.length === 0) return -1.5;
    const aWins = sims.filter((s) => s.winner === 'a').length;
    const bWins = sims.filter((s) => s.winner === 'b').length;
    const favSide = aWins >= bWins ? 'a' : 'b';
    const n = sims.length;

    // Find the line where fav covers closest to 50% of ALL sims
    let bestVal = -1.5;
    let bestDiff = Infinity;
    for (const v of [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]) {
      const covers = sims.filter((s) => {
        const wins = favSide === 'a' ? s.winner === 'a' : s.winner === 'b';
        return wins && s.margin > v;
      }).length;
      const diff = Math.abs(covers - n / 2);
      if (diff < bestDiff) { bestDiff = diff; bestVal = -v; }
    }
    return bestVal;
  }, [sims]);

  const [lineValue, setLineValue] = useState<number | null>(null);
  const displayLine = lineValue ?? bestLine;

  if (sims.length === 0 || !config) return null;

  const absLine = Math.abs(displayLine);
  const isDNB = displayLine === 0;

  let aLabel: string, bLabel: string, aOdds: number, bOdds: number;

  if (isDNB) {
    // Draw no bet: use decided matches only
    const aWins = sims.filter((s) => s.winner === 'a').length;
    const bWins = sims.filter((s) => s.winner === 'b').length;
    const decided = aWins + bWins;
    const round5 = (v: number) => v >= 10 ? Math.round(v) : parseFloat((Math.round(v * 20) / 20).toFixed(2));
    aOdds = round5(Math.max(1.01, (decided / (aWins || 1)) / 1.10));
    bOdds = round5(Math.max(1.01, (decided / (bWins || 1)) / 1.10));
    aLabel = `${match.teamA} DNB`;
    bLabel = `${match.teamB} DNB`;
  } else {
    const aGiving = displayLine < 0;
    const odds = aGiving
      ? getAlternateLineOdds(sims, absLine, 'a')
      : getAlternateLineOdds(sims, absLine, 'b');
    aLabel = displayLine < 0 ? `${match.teamA} ${displayLine}` : `${match.teamA} +${displayLine}`;
    bLabel = displayLine < 0 ? `${match.teamB} +${absLine}` : `${match.teamB} -${absLine}`;
    aOdds = aGiving ? odds.fav : odds.dog;
    bOdds = aGiving ? odds.dog : odds.fav;
  }

  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">Line</span>
        <select
          value={displayLine}
          onChange={(e) => setLineValue(parseFloat(e.target.value))}
          className="px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] text-green-bright text-xs font-bold focus:outline-none bg-navy-card"
        >
          {LINE_OPTIONS.map((v) => (
            <option key={v} value={v} className="bg-navy-card">
              {v > 0 ? `+${v}` : v === 0 ? 'DNB (0)' : v}
            </option>
          ))}
        </select>
      </div>
      <div className="divide-y divide-white/3">
        <SimOddsRow
          label={aLabel}
          odds={aOdds}
          marketTitle={`${match.teamA} vs ${match.teamB} Line ${displayLine}`}
          selectionName={aLabel}
          matchSlug={`${match.slugPrefix}-line`}
          betSlip={betSlip}
          onSelect={onSelect}
        />
        <SimOddsRow
          label={bLabel}
          odds={bOdds}
          marketTitle={`${match.teamA} vs ${match.teamB} Line ${displayLine}`}
          selectionName={bLabel}
          matchSlug={`${match.slugPrefix}-line`}
          betSlip={betSlip}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

function SimTotalBlock({
  match,
  team,
  betSlip,
  onSelect,
  dbMarket,
  sims,
}: {
  match: MatchDefinition;
  team: 'a' | 'b';
  betSlip: BetSlipItem[];
  onSelect: (market: Market, selection: MarketSelection) => void;
  dbMarket?: Market & { selections: MarketSelection[] };
  sims: import('@/lib/match-simulator').SimResult[];
}) {

  // Find most balanced total from sims
  const bestTotal = useMemo(() => {
    if (sims.length === 0) return 7.5;
    const holes = sims.map((s) => team === 'a' ? s.holesWonA : s.holesWonB).sort((a, b) => a - b);
    const median = holes[Math.floor(holes.length / 2)];
    // Use .5 above the median to ensure no push and balanced odds
    return median - 0.5;
  }, [sims, team]);

  const [totalValue, setTotalValue] = useState<number | null>(null);
  const displayValue = totalValue ?? bestTotal;

  if (sims.length === 0) return null;

  const teamName = team === 'a' ? match.teamA : match.teamB;
  const odds = getAlternateTotalOdds(sims, displayValue, team);

  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">{teamName}</span>
        <select
          value={displayValue}
          onChange={(e) => setTotalValue(parseFloat(e.target.value))}
          className="px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] text-green-bright text-xs font-bold focus:outline-none bg-navy-card"
        >
          {TOTAL_OPTIONS.map((v) => (
            <option key={v} value={v} className="bg-navy-card">{v}</option>
          ))}
        </select>
      </div>
      <div className="divide-y divide-white/3">
        <SimOddsRow
          label={`Over ${displayValue}`}
          odds={odds.over}
          marketTitle={`${teamName} Total Holes`}
          selectionName={`Over ${displayValue}`}
          matchSlug={`${match.slugPrefix}-total-${team}`}
          betSlip={betSlip}
          onSelect={onSelect}
        />
        <SimOddsRow
          label={`Under ${displayValue}`}
          odds={odds.under}
          marketTitle={`${teamName} Total Holes`}
          selectionName={`Under ${displayValue}`}
          matchSlug={`${match.slugPrefix}-total-${team}`}
          betSlip={betSlip}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

function OldAlternateMarkets({ match }: { match: MatchDefinition }) {
  const [altLine, setAltLine] = useState(1.5);
  const [altTotalA, setAltTotalA] = useState(7.5);
  const [altTotalB, setAltTotalB] = useState(7.5);
  const [expanded, setExpanded] = useState(false);

  const sims = useMemo(() => {
    registerMatchFromDefinition(match);
    return getMatchSims(match.slugPrefix);
  }, [match]);
  const config = useMemo(() => getMatchConfig(match.slugPrefix), [match.slugPrefix]);

  if (sims.length === 0 || !config) return null;

  const aWins = sims.filter((s) => s.winner === 'a').length;
  const bWins = sims.filter((s) => s.winner === 'b').length;
  const favSide: 'a' | 'b' = aWins >= bWins ? 'a' : 'b';
  const favName = favSide === 'a' ? match.teamA : match.teamB;
  const dogName = favSide === 'a' ? match.teamB : match.teamA;

  const lineOdds = getAlternateLineOdds(sims, altLine, favSide);
  const totalAOdds = getAlternateTotalOdds(sims, altTotalA, 'a');
  const totalBOdds = getAlternateTotalOdds(sims, altTotalB, 'b');

  const lineOptions = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5];
  const totalOptions = [3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11];

  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-white font-semibold text-sm">Alternate Lines and Totals</span>
        <span className="text-xs text-white/30">{expanded ? 'Hide' : 'Show'}</span>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] p-4 space-y-5">
          {/* Alternate Line */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40 uppercase">Alternate Line</span>
              <select
                value={altLine}
                onChange={(e) => setAltLine(parseFloat(e.target.value))}
                className="px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] text-white text-xs focus:outline-none bg-navy-card"
              >
                {lineOptions.map((v) => (
                  <option key={v} value={v} className="bg-navy-card">{v}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg bg-odds-bg/50 border border-green-bright/10">
                <span className="text-xs text-white/60">{favName} -{altLine}</span>
                <span className="text-sm text-green-bright font-bold font-mono">${lineOdds.fav.toFixed(2)}</span>
              </div>
              <div className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg bg-odds-bg/50 border border-green-bright/10">
                <span className="text-xs text-white/60">{dogName} +{altLine}</span>
                <span className="text-sm text-green-bright font-bold font-mono">${lineOdds.dog.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Alternate Total A */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40 uppercase">{match.teamA} Total Holes</span>
              <select
                value={altTotalA}
                onChange={(e) => setAltTotalA(parseFloat(e.target.value))}
                className="px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] text-white text-xs focus:outline-none bg-navy-card"
              >
                {totalOptions.map((v) => (
                  <option key={v} value={v} className="bg-navy-card">{v}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg bg-odds-bg/50 border border-green-bright/10">
                <span className="text-xs text-white/60">Over {altTotalA}</span>
                <span className="text-sm text-green-bright font-bold font-mono">${totalAOdds.over.toFixed(2)}</span>
              </div>
              <div className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg bg-odds-bg/50 border border-green-bright/10">
                <span className="text-xs text-white/60">Under {altTotalA}</span>
                <span className="text-sm text-green-bright font-bold font-mono">${totalAOdds.under.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Alternate Total B */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40 uppercase">{match.teamB} Total Holes</span>
              <select
                value={altTotalB}
                onChange={(e) => setAltTotalB(parseFloat(e.target.value))}
                className="px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] text-white text-xs focus:outline-none bg-navy-card"
              >
                {totalOptions.map((v) => (
                  <option key={v} value={v} className="bg-navy-card">{v}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg bg-odds-bg/50 border border-green-bright/10">
                <span className="text-xs text-white/60">Over {altTotalB}</span>
                <span className="text-sm text-green-bright font-bold font-mono">${totalBOdds.over.toFixed(2)}</span>
              </div>
              <div className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg bg-odds-bg/50 border border-green-bright/10">
                <span className="text-xs text-white/60">Under {altTotalB}</span>
                <span className="text-sm text-green-bright font-bold font-mono">${totalBOdds.under.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-white/20">
            Odds generated from 10,000 simulated matches. Select to add to bet slip.
          </p>
        </div>
      )}
    </div>
  );
}

function SimOddsRow({
  label,
  odds,
  marketTitle,
  selectionName,
  matchSlug,
  betSlip,
  onSelect,
}: {
  label: string;
  odds: number;
  marketTitle: string;
  selectionName: string;
  matchSlug: string;
  betSlip: BetSlipItem[];
  onSelect: (market: Market, selection: MarketSelection) => void;
}) {
  const syntheticId = `sim-${matchSlug}-${selectionName}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const isSelected = betSlip.some((b) => b.selection.id === syntheticId);

  const handleClick = () => {
    const syntheticMarket: Market = {
      id: `sim-market-${matchSlug}-${marketTitle}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
      title: marketTitle,
      slug: matchSlug,
      category: 'match_play',
      market_type: 'sim',
      line_value: null,
      status: 'open',
      round_label: null,
      is_featured: false,
      settlement_type: 'manual',
      created_at: '',
      updated_at: '',
    };
    const syntheticSelection: MarketSelection = {
      id: syntheticId,
      market_id: syntheticMarket.id,
      name: selectionName,
      odds_decimal: odds,
      sort_order: 0,
      is_winner: null,
      created_at: '',
      updated_at: '',
    };
    onSelect(syntheticMarket, syntheticSelection);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-white/70">{label}</span>
      <button
        onClick={handleClick}
        className={`text-sm font-bold font-mono odds-display px-3 py-1.5 rounded-md odds-btn ${isSelected ? 'selected' : ''}`}
      >
        ${odds.toFixed(2)}
      </button>
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
  const sorted = [...market.selections].sort((a, b) => {
    const aIsOver = a.name.toLowerCase().startsWith('over') || a.name.toLowerCase().startsWith('yes');
    const bIsOver = b.name.toLowerCase().startsWith('over') || b.name.toLowerCase().startsWith('yes');
    if (aIsOver && !bIsOver) return -1;
    if (!aIsOver && bIsOver) return 1;
    return Number(a.odds_decimal) - Number(b.odds_decimal);
  });

  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">{label}</span>
      </div>
      <div className="divide-y divide-white/3">
        {sorted.map((sel) => {
          const isSelected = betSlip.some((b) => b.selection.id === sel.id);
          return (
            <div key={sel.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-white/70">{sel.name}</span>
              <button
                onClick={() => !isDisabled && onSelect(market, sel)}
                disabled={isDisabled}
                className={`text-sm font-bold font-mono odds-display px-3 py-1.5 rounded-md odds-btn ${isSelected ? 'selected' : ''} disabled:cursor-default disabled:opacity-50`}
              >
                ${Number(sel.odds_decimal).toFixed(2)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
