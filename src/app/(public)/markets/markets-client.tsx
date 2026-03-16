'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Market, MarketSelection, BetSlipItem } from '@/lib/types';
import { BetSlip } from '@/components/bet-slip';
import { MATCHES } from '@/lib/matches';
import Link from 'next/link';
import { H2HBuilder } from '@/components/h2h-builder';

const PLAYER_TEAMS: Record<string, string> = {
  'Hugo': 'Group 1', 'Bails': 'Group 1', 'Brad': 'Group 1', 'Watto': 'Group 1',
  'Finn': 'Group 2', 'Ando': 'Group 2', 'Jackson': 'Group 2', 'McNaughton': 'Group 2',
  'Daniel': 'Group 3', 'Jacob': 'Group 3', 'Lewis': 'Group 3', 'Parker': 'Group 3',
};

const TEAM_MEMBERS: Record<string, string> = {
  'Group 1': 'Hugo, Bails, Brad, Watto',
  'Group 2': 'Finn, Ando, Jackson, McNaughton',
  'Group 3': 'Lewis, Jacob, Daniel, Parker',
  'Group 3 top scorer': 'Lewis, Jacob, Daniel, Parker',
  'Group 1 top scorer': 'Hugo, Bails, Brad, Watto',
  'Group 2 top scorer': 'Finn, Ando, Jackson, McNaughton',
};

const MARKET_SUBTITLES: Record<string, string> = {
  'group-1-total-points': 'Hugo, Bails, Brad, Watto',
  'group-2-total-points': 'Finn, Ando, Jackson, McNaughton',
  'group-3-total-points': 'Lewis, Jacob, Daniel, Parker',
};

function getTeamName(label: string): string {
  const firstName = label.split(' and ')[0];
  return PLAYER_TEAMS[firstName] || '';
}

const TABS = [
  { key: 'outrights', label: 'Outrights' },
  { key: 'r1', label: 'R1 Friday' },
  { key: 'r2', label: 'R2 Sat AM' },
  { key: 'r3', label: 'R3 Sat PM' },
  { key: 'r4', label: 'R4 Sunday' },
];

const COLLAPSE_THRESHOLD = 4;

interface MarketsClientProps {
  markets: (Market & { selections: MarketSelection[] })[];
}

export function MarketsClient({ markets }: MarketsClientProps) {
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'outrights';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedMarkets, setExpandedMarkets] = useState<Record<string, boolean>>({});

  const handleSelectBet = (market: Market, selection: MarketSelection) => {
    setBetSlip((prev) => {
      const existing = prev.find((item) => item.selection.id === selection.id);
      if (existing) return prev.filter((item) => item.selection.id !== selection.id);
      const filtered = prev.filter((item) => item.market.id !== market.id);
      return [...filtered, { market, selection, stake: 0 }];
    });
  };

  const toggleMarket = (id: string) => {
    setExpandedMarkets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // H2H market slugs for matches
  const allMatchSlugs = MATCHES.flatMap((m) => Object.values(m.marketSlugs));
  const h2hSlugs = MATCHES.map((m) => m.marketSlugs.h2h);

  // Outrights: non-match, non-stableford, non-score-totals-that-are-round-specific
  const outrightCategories = ['outrights', 'novelty', 'trip_specials', 'score_totals'];
  const outrightMarkets = markets
    .filter((m) => outrightCategories.includes(m.category) && !allMatchSlugs.includes(m.slug))
    .filter((m) => !(m.category === 'score_totals' && (m.round_label?.toLowerCase() === 'friday' || m.slug.includes('friday'))))
    .sort((a, b) => {
      const order: Record<string, number> = {
        'winning-team': 0,
        'trip-champion': 1,
        'overall-top-3': 2,
        'overall-bottom-3': 3,
        'wooden-spoon': 4,
        'trip-hole-in-one': 5,
        'trip-lowest-gross': 6,
        'group-1-total-points': 7,
        'group-2-total-points': 8,
        'group-3-total-points': 9,
        'lewis-total-pts': 10,
        'jacob-total-pts': 11,
        'finn-total-pts': 12,
        'bails-total-pts': 13,
        'jackson-total-pts': 14,
        'brad-total-pts': 15,
        'ando-total-pts': 16,
        'hugo-total-pts': 17,
        'mcnaughton-total-pts': 18,
        'daniel-total-pts': 19,
        'watto-total-pts': 20,
        'parker-total-pts': 21,
      };
      const oa = order[a.slug] ?? 50;
      const ob = order[b.slug] ?? 50;
      if (oa !== ob) return oa - ob;
      return (a.selections?.length || 0) - (b.selections?.length || 0);
    });

  // Stableford markets for R1
  const stablefordMarkets = markets.filter((m) => m.category === 'stableford');

  // Friday score totals (e.g. highest stableford score over/under)
  const fridayScoreTotals = markets.filter(
    (m) => m.category === 'score_totals' && (m.round_label?.toLowerCase() === 'friday' || m.slug.includes('friday'))
  );

  // H2H markets lookup
  const h2hMarketMap: Record<string, Market & { selections: MarketSelection[] }> = {};
  markets.forEach((m) => {
    if (h2hSlugs.includes(m.slug)) h2hMarketMap[m.slug] = m;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl font-black text-white mb-6">Markets</h1>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-8 border-b border-white/[0.04] overflow-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-green-bright text-white'
                : 'border-transparent text-white/30 hover:text-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`grid gap-6 ${betSlip.length > 0 ? 'lg:grid-cols-3' : ''}`}>
        <div className={`${betSlip.length > 0 ? 'lg:col-span-2' : ''} space-y-3`}>

          {/* OUTRIGHTS TAB */}
          {activeTab === 'outrights' && (
            <OutrightsTab
              markets={outrightMarkets}
              expandedMarkets={expandedMarkets}
              toggleMarket={toggleMarket}
              betSlip={betSlip}
              onSelectBet={handleSelectBet}
            />
          )}

          {/* R1 FRIDAY TAB */}
          {activeTab === 'r1' && (
            <R1FridayTab
              stablefordMarkets={stablefordMarkets}
              scoreTotalsMarkets={fridayScoreTotals}
              expandedMarkets={expandedMarkets}
              toggleMarket={toggleMarket}
              betSlip={betSlip}
              onSelectBet={handleSelectBet}
            />
          )}

          {/* R2, R3, R4 TABS */}
          {['r2', 'r3', 'r4'].includes(activeTab) && (
            <RoundMatchTab
              roundNum={parseInt(activeTab.replace('r', ''))}
              h2hMarketMap={h2hMarketMap}
              allMarkets={markets}
              expandedMarkets={expandedMarkets}
              toggleMarket={toggleMarket}
              betSlip={betSlip}
              onSelectBet={handleSelectBet}
            />
          )}
        </div>

        {betSlip.length > 0 && (
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
        )}
      </div>
    </div>
  );
}

function RoundMatchTab({
  roundNum,
  h2hMarketMap,
  allMarkets,
  expandedMarkets,
  toggleMarket,
  betSlip,
  onSelectBet,
}: {
  roundNum: number;
  h2hMarketMap: Record<string, Market & { selections: MarketSelection[] }>;
  allMarkets: (Market & { selections: MarketSelection[] })[];
  expandedMarkets: Record<string, boolean>;
  toggleMarket: (id: string) => void;
  betSlip: BetSlipItem[];
  onSelectBet: (market: Market, selection: MarketSelection) => void;
}) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (label: string) => setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));

  const roundLabels: Record<number, string> = {
    2: '2v2 Match Play -- Lost Farm, 8:30am',
    3: '2v2 Scramble -- Bougle Run, 3:00pm',
    4: '1v1 Match Play -- Barnbougle Dunes, 8:00am',
  };

  const roundMatches = MATCHES.filter((m) => m.round === roundNum);

  // All match slugs for this round (to exclude from extras)
  const matchSlugs = roundMatches.flatMap((m) => Object.values(m.marketSlugs));

  // Extra markets for this round: match_play category, matching round label, not a match-specific market
  const roundLabelMap: Record<number, string> = { 2: 'Saturday AM', 3: 'Saturday PM', 4: 'Sunday' };
  const extraMarkets = allMarkets.filter(
    (m) => m.category === 'match_play' && m.round_label === roundLabelMap[roundNum] && !matchSlugs.includes(m.slug)
  );

  // Group extras
  const teamPtsSlugs = extraMarkets.filter((m) => m.slug.includes('group-') && m.slug.includes('-pts'));
  const specialSlugs = extraMarkets.filter((m) => !m.slug.includes('group-') || !m.slug.includes('-pts'));

  const extraSections = [
    { label: 'Round Specials', markets: specialSlugs },
    { label: 'Team Points', markets: teamPtsSlugs },
  ].filter((s) => s.markets.length > 0);

  return (
    <>
      <div className="text-sm text-white/40 mb-2">{roundLabels[roundNum]}</div>

      <div className="space-y-2 mb-6">
        {roundMatches.map((match) => {
          const h2h = h2hMarketMap[match.marketSlugs.h2h];
          const sortedSels = h2h
            ? [...h2h.selections].sort((a, b) => Number(a.odds_decimal) - Number(b.odds_decimal))
            : [];
          return (
            <Link
              key={match.id}
              href={`/matches/${match.id}`}
              className="block bg-navy-card border border-white/8 rounded-xl overflow-hidden hover:border-white/15 transition-colors"
            >
              <div className="px-4 py-4">
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

                <div className="mt-2 text-[10px] text-white/20">
                  Expand -- line, margin, totals
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Extra markets in collapsible sections */}
      {extraSections.length > 0 && (
        <div className="space-y-3">
          {extraSections.map((section) => {
            const isOpen = openSections[section.label] ?? false;
            return (
              <div key={section.label} className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggle(section.label)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/3 transition-colors"
                >
                  <div>
                    <span className="text-sm text-white font-semibold">{section.label}</span>
                    {section.label === 'Team Points' && (
                      <div className="text-[10px] text-white/25 mt-0.5">
                        {roundNum === 4 ? 'Win: 4pts + 0.5 per hole' : 'Win: 6pts + 0.5 per hole'}
                        {' -- Halved: ' + (roundNum === 4 ? '2pts' : '3pts')}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-white/30">{isOpen ? 'Hide' : `${section.markets.length} markets`}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-white/5">
                    {section.markets.map((market) => (
                      <MarketBlock
                        key={market.id}
                        market={market}
                        expanded={expandedMarkets[market.id] ?? false}
                        onToggle={() => toggleMarket(market.id)}
                        betSlip={betSlip}
                        onSelectBet={onSelectBet}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function OutrightsTab({
  markets,
  expandedMarkets,
  toggleMarket,
  betSlip,
  onSelectBet,
}: {
  markets: (Market & { selections: MarketSelection[] })[];
  expandedMarkets: Record<string, boolean>;
  toggleMarket: (id: string) => void;
  betSlip: BetSlipItem[];
  onSelectBet: (market: Market, selection: MarketSelection) => void;
}) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ 'Winners': true });
  const toggle = (label: string) => setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));

  const winnerSlugs = ['winning-team', 'trip-champion'];
  const placingSlugs = ['overall-top-3', 'overall-bottom-3', 'wooden-spoon'];
  const specialSlugs = ['trip-hole-in-one', 'trip-lowest-gross'];
  const teamPointsSlugs = ['group-1-total-points', 'group-2-total-points', 'group-3-total-points'];
  const playerPointsSlugs = [
    'lewis-total-pts', 'jacob-total-pts', 'finn-total-pts',
    'bails-total-pts', 'jackson-total-pts',
    'brad-total-pts', 'ando-total-pts', 'hugo-total-pts',
    'mcnaughton-total-pts', 'daniel-total-pts', 'watto-total-pts', 'parker-total-pts',
  ];

  const winners = markets.filter((m) => winnerSlugs.includes(m.slug));
  const placings = markets.filter((m) => placingSlugs.includes(m.slug));
  const specials = markets.filter((m) => specialSlugs.includes(m.slug));
  const teamPoints = markets.filter((m) => teamPointsSlugs.includes(m.slug));
  const playerPoints = markets.filter((m) => playerPointsSlugs.includes(m.slug))
    .sort((a, b) => playerPointsSlugs.indexOf(a.slug) - playerPointsSlugs.indexOf(b.slug));
  const allKnownSlugs = [...winnerSlugs, ...placingSlugs, ...specialSlugs, ...teamPointsSlugs, ...playerPointsSlugs];
  const other = markets.filter((m) => !allKnownSlugs.includes(m.slug));

  const sections = [
    { label: 'Winners', markets: winners },
    { label: 'Placings', markets: placings },
    { label: 'Team Points', markets: teamPoints },
    { label: 'Player Points', markets: playerPoints },
    { label: 'Trip Specials', markets: specials },
    ...(other.length > 0 ? [{ label: 'Other', markets: other }] : []),
  ].filter((s) => s.markets.length > 0);

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const isOpen = openSections[section.label] ?? false;
        return (
          <div key={section.label} className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
            <button
              onClick={() => toggle(section.label)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/3 transition-colors"
            >
              <span className="text-sm text-white font-semibold">{section.label}</span>
              <span className="text-xs text-white/30">{isOpen ? 'Hide' : `${section.markets.length} markets`}</span>
            </button>
            {isOpen && (
              <div className="border-t border-white/5">
                {section.markets.map((market) => (
                  <MarketBlock
                    key={market.id}
                    market={market}
                    expanded={expandedMarkets[market.id] ?? false}
                    onToggle={() => toggleMarket(market.id)}
                    betSlip={betSlip}
                    onSelectBet={onSelectBet}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      {markets.length === 0 && (
        <div className="text-center py-12 text-white/40 text-sm">No outright markets yet.</div>
      )}
    </div>
  );
}

function R1FridayTab({
  stablefordMarkets,
  scoreTotalsMarkets,
  expandedMarkets,
  toggleMarket,
  betSlip,
  onSelectBet,
}: {
  stablefordMarkets: (Market & { selections: MarketSelection[] })[];
  scoreTotalsMarkets: (Market & { selections: MarketSelection[] })[];
  expandedMarkets: Record<string, boolean>;
  toggleMarket: (id: string) => void;
  betSlip: BetSlipItem[];
  onSelectBet: (market: Market, selection: MarketSelection) => void;
}) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ 'Winner and Last Place': true, 'Head to Head': true });

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Group stableford markets into sections
  const winnerSlugs: string[] = ['friday-stableford-winner', 'friday-last-place'];
  const placingSlugs = ['friday-top-3', 'friday-top-4', 'friday-top-half', 'friday-bottom-half', 'friday-bottom-4'];
  const h2hSlugs = ['friday-best-of-group', 'friday-best-team'];

  // Explicit sort order for all friday markets - top to bottom
  const fridayOrder: Record<string, number> = {
    'friday-stableford-winner': 0,
    'friday-top-3': 1,
    'friday-top-4': 2,
    'friday-top-half': 3,
    'friday-bottom-half': 4,
    'friday-bottom-4': 5,
    'friday-last-place': 6,
    'friday-best-team': 5,
    'friday-best-of-group': 6,
    'highest-friday-score': 0,
    'lowest-friday-score': 1,
    'friday-avg-score': 2,
    'friday-total-points': 3,
    'friday-30-plus-count': 4,
    'friday-margin-1st-last': 5,
    'friday-40-plus': 0,
    'friday-net-eagle': 1,
  };
  const sortByOrder = (a: Market, b: Market) => (fridayOrder[a.slug] ?? 99) - (fridayOrder[b.slug] ?? 99);

  const winnerMarkets = stablefordMarkets
    .filter((m) => winnerSlugs.includes(m.slug))
    .sort(sortByOrder);
  const placingMarkets = stablefordMarkets.filter((m) => placingSlugs.includes(m.slug)).sort(sortByOrder);
  const h2hMarkets = stablefordMarkets.filter((m) => h2hSlugs.includes(m.slug)).sort(sortByOrder);
  const otherStableford = stablefordMarkets.filter(
    (m) => ![...winnerSlugs, ...placingSlugs, ...h2hSlugs].includes(m.slug)
  );

  // Group score totals into sections
  const yesNoSlugs = ['friday-40-plus', 'friday-net-eagle'];
  const ouSlugs = ['highest-friday-score', 'lowest-friday-score', 'friday-avg-score', 'friday-total-points', 'friday-30-plus-count', 'friday-margin-1st-last'];

  const yesNoMarkets = scoreTotalsMarkets.filter((m) => yesNoSlugs.includes(m.slug)).sort(sortByOrder);
  const ouMarkets = scoreTotalsMarkets.filter((m) => ouSlugs.includes(m.slug)).sort(sortByOrder);
  const otherTotals = scoreTotalsMarkets.filter(
    (m) => ![...yesNoSlugs, ...ouSlugs].includes(m.slug)
  );

  const sections = [
    { label: 'Winner and Last Place', markets: winnerMarkets },
    { label: 'Placings', markets: placingMarkets },
    { label: 'Teams', markets: h2hMarkets },
    ...(otherStableford.length > 0 ? [{ label: 'Other', markets: otherStableford }] : []),
    { label: 'Score Lines', markets: ouMarkets },
    { label: 'Specials', markets: yesNoMarkets },
    ...(otherTotals.length > 0 ? [{ label: 'Other Totals', markets: otherTotals }] : []),
  ].filter((s) => s.markets.length > 0);

  return (
    <>
      <div className="text-sm text-white/40 mb-4">
        Individual Stableford -- Barnbougle Dunes, 1:30pm
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const isOpen = openSections[section.label] ?? false;
          return (
            <div key={section.label} className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/3 transition-colors"
              >
                <span className="text-sm text-white font-semibold">{section.label}</span>
                <span className="text-xs text-white/30">{isOpen ? 'Hide' : `${section.markets.length} markets`}</span>
              </button>
              {isOpen && (
                <div className="border-t border-white/5">
                  {section.markets.map((market) => (
                    <MarketBlock
                      key={market.id}
                      market={market}
                      expanded={expandedMarkets[market.id] ?? false}
                      onToggle={() => toggleMarket(market.id)}
                      betSlip={betSlip}
                      onSelectBet={onSelectBet}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Build Your Own H2H */}
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('Head to Head')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/3 transition-colors"
          >
            <span className="text-sm text-white font-semibold">Head to Head</span>
            <span className="text-xs text-white/30">{openSections['Head to Head'] ? 'Hide' : 'Build your own'}</span>
          </button>
          {openSections['Head to Head'] && (
            <div className="border-t border-white/5">
              <H2HBuilder />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MarketBlock({
  market,
  expanded,
  onToggle,
  betSlip,
  onSelectBet,
}: {
  market: Market & { selections: MarketSelection[] };
  expanded: boolean;
  onToggle: () => void;
  betSlip: BetSlipItem[];
  onSelectBet: (market: Market, selection: MarketSelection) => void;
}) {
  const isDisabled = market.status !== 'open';
  const hasGroups = market.selections.some((s) => s.name.startsWith('Group '));
  const sorted = [...market.selections].sort((a, b) =>
    hasGroups ? a.sort_order - b.sort_order : Number(a.odds_decimal) - Number(b.odds_decimal)
  );
  const needsExpand = sorted.length > COLLAPSE_THRESHOLD;
  const visible = needsExpand && !expanded ? sorted.slice(0, COLLAPSE_THRESHOLD) : sorted;

  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <div className="px-4 py-2.5">
        <div className="min-w-0">
          <span className="text-[13px] text-white/80 font-medium">{market.title}</span>
          {MARKET_SUBTITLES[market.slug] && (
            <span className="text-[11px] text-white/35 ml-2">{MARKET_SUBTITLES[market.slug]}</span>
          )}
          {market.status !== 'open' && (
            <span className={`text-[10px] font-medium uppercase status-${market.status} ml-2`}>{market.status}</span>
          )}
        </div>
      </div>

      {visible.map((sel) => {
        const isSelected = betSlip.some((b) => b.selection.id === sel.id);
        return (
          <button key={sel.id} onClick={() => !isDisabled && onSelectBet(market, sel)} disabled={isDisabled}
            className={`w-full flex items-center justify-between px-4 py-1.5 text-left transition-colors disabled:cursor-default ${isSelected ? 'bg-green-bright/[0.06]' : 'hover:bg-white/[0.02]'}`}>
            <div className="min-w-0">
              <span className={`text-[13px] ${isSelected ? 'text-white font-medium' : 'text-white/60'}`}>{sel.name}</span>
              {TEAM_MEMBERS[sel.name] && <span className="text-[11px] text-white/25 ml-1.5">{TEAM_MEMBERS[sel.name]}</span>}
            </div>
            <span className={`text-[13px] font-bold font-mono shrink-0 ml-3 ${isSelected ? 'text-green-bright' : 'text-green-bright/80'}`}>
              ${Number(sel.odds_decimal).toFixed(2)}
            </span>
          </button>
        );
      })}
      {needsExpand && (
        <button onClick={onToggle} className="w-full px-4 py-1.5 text-[11px] text-white/30 hover:text-white/50 text-left">
          {expanded ? 'Less' : `+${sorted.length - COLLAPSE_THRESHOLD} more`}
        </button>
      )}
    </div>
  );
}
