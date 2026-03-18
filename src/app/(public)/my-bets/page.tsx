'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bet, Market, MarketSelection } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/exposure';
import { StatusBadge } from '@/components/status-badge';

interface BetLeg {
  id: string;
  bet_id: string;
  market_id: string;
  selection_id: string;
  market_title: string;
  selection_name: string;
  odds_taken: number;
  result: 'pending' | 'won' | 'lost' | 'void';
}

type BetWithRelations = Bet & { market: Market; selection: MarketSelection };

const ROUND_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Outrights', value: 'outrights' },
  { label: 'R1 Friday', value: 'R1 Friday' },
  { label: 'R2 Sat AM', value: 'R2 Sat AM' },
  { label: 'R3 Sat PM', value: 'R3 Sat PM' },
  { label: 'R4 Sunday', value: 'R4 Sunday' },
] as const;

export default function MyBetsPage() {
  const [name, setName] = useState('');
  const [searchName, setSearchName] = useState('');
  const [bets, setBets] = useState<BetWithRelations[]>([]);
  const [betLegs, setBetLegs] = useState<Record<string, BetLeg[]>>({});
  const [loading, setLoading] = useState(false);
  const [roundFilter, setRoundFilter] = useState('all');
  const [expandedMultis, setExpandedMultis] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(async (searchValue?: string) => {
    const query = (searchValue ?? name).trim();
    if (!query) return;
    setLoading(true);
    setSearchName(query);
    setExpandedMultis(new Set());
    const supabase = createClient();

    const { data } = await supabase
      .from('bets')
      .select('*, market:markets(*), selection:market_selections(*)')
      .ilike('bettor_name', query)
      .order('placed_at', { ascending: false });

    const fetchedBets = (data as typeof bets) || [];
    setBets(fetchedBets);

    // Fetch legs for multi bets
    const multiBetIds = fetchedBets
      .filter((b) => (b as any).bet_type === 'multi')
      .map((b) => b.id);

    if (multiBetIds.length > 0) {
      const { data: legs } = await supabase
        .from('bet_legs')
        .select('*')
        .in('bet_id', multiBetIds);

      if (legs) {
        const grouped: Record<string, BetLeg[]> = {};
        for (const leg of legs as BetLeg[]) {
          if (!grouped[leg.bet_id]) grouped[leg.bet_id] = [];
          grouped[leg.bet_id].push(leg);
        }
        setBetLegs(grouped);
      }
    } else {
      setBetLegs({});
    }

    setLoading(false);
  }, [name]);

  // Auto-fill from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mattbet-bettor-name');
    if (saved) {
      setName(saved);
      handleSearch(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMulti = (betId: string) => {
    setExpandedMultis((prev) => {
      const next = new Set(prev);
      if (next.has(betId)) next.delete(betId);
      else next.add(betId);
      return next;
    });
  };

  // Filter bets by round
  const filteredBets = bets.filter((bet) => {
    if (roundFilter === 'all') return true;
    if (roundFilter === 'outrights') return bet.market?.category === 'outrights';
    return bet.market?.round_label === roundFilter;
  });

  // P&L calculations
  const totalStaked = bets.reduce((s, b) => s + Number(b.stake), 0);
  const pendingCount = bets.filter((b) => b.status === 'pending').length;
  const wonBets = bets.filter((b) => b.status === 'won');
  const lostBets = bets.filter((b) => b.status === 'lost');
  const wonPayouts = wonBets.reduce((s, b) => s + Number(b.potential_payout), 0);
  const totalLost = lostBets.reduce((s, b) => s + Number(b.stake), 0);
  const settledStaked = [...wonBets, ...lostBets].reduce((s, b) => s + Number(b.stake), 0);
  const netPnL = wonPayouts - settledStaked;
  const roi = settledStaked > 0 ? (netPnL / settledStaked) * 100 : 0;
  const hitRate = wonBets.length + lostBets.length > 0
    ? (wonBets.length / (wonBets.length + lostBets.length)) * 100
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-white mb-6">My Bets</h1>

      {/* Search */}
      <div className="bg-navy-card border border-white/8 rounded-xl p-4 mb-6">
        <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">
          Enter your name to view your bets
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Your name"
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-green-bright/50"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-accent text-white font-medium text-sm hover:bg-green-bright transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      {searchName && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">
              Bets for {searchName} ({bets.length})
            </h2>
          </div>

          {bets.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">
              No bets found for &quot;{searchName}&quot;.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary */}
              <div className="bg-navy-card border border-white/8 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Total Staked</div>
                    <div className="text-sm text-white font-bold">
                      {formatCurrency(totalStaked)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Pending</div>
                    <div className="text-sm text-warning font-bold">
                      {pendingCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Won</div>
                    <div className="text-sm text-green-bright font-bold">
                      {formatCurrency(wonPayouts)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-white/5">
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Total Lost</div>
                    <div className="text-sm text-danger font-bold">
                      {formatCurrency(totalLost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Net P&L</div>
                    <div className={`text-sm font-bold ${netPnL >= 0 ? 'text-green-bright' : 'text-danger'}`}>
                      {netPnL >= 0 ? '+' : ''}{formatCurrency(netPnL)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">ROI</div>
                    <div className={`text-sm font-bold ${roi >= 0 ? 'text-green-bright' : 'text-danger'}`}>
                      {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Hit Rate</div>
                    <div className="text-sm text-white font-bold">
                      {hitRate.toFixed(0)}%
                      <span className="text-[10px] text-white/30 ml-1">
                        ({wonBets.length}/{wonBets.length + lostBets.length})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Round filter tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                {ROUND_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setRoundFilter(filter.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      roundFilter === filter.value
                        ? 'bg-green-accent text-white'
                        : 'bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/8'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Filtered count */}
              {roundFilter !== 'all' && (
                <div className="text-[11px] text-white/40">
                  Showing {filteredBets.length} of {bets.length} bets
                </div>
              )}

              {/* Bet cards */}
              {filteredBets.map((bet) => {
                const isMulti = (bet as any).bet_type === 'multi';
                const isExpanded = expandedMultis.has(bet.id);
                const legs = betLegs[bet.id] || [];

                return (
                  <div
                    key={bet.id}
                    className={`bg-navy-card border border-white/8 rounded-xl p-4 ${
                      isMulti ? 'cursor-pointer hover:border-white/15 transition-colors' : ''
                    }`}
                    onClick={isMulti ? () => toggleMulti(bet.id) : undefined}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="text-xs text-white/40 flex items-center gap-2">
                          {bet.market?.title}
                          {isMulti && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gold/15 text-gold border border-gold/20">
                              MULTI
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-white font-semibold">
                          {isMulti
                            ? `${legs.length > 0 ? legs.length : '?'}-Leg Multi`
                            : bet.selection?.name}
                        </div>
                      </div>
                      <StatusBadge status={bet.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
                      <div>
                        <div className="text-[10px] text-white/30 uppercase">Stake</div>
                        <div className="text-sm text-white font-medium">{formatCurrency(Number(bet.stake))}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/30 uppercase">Odds</div>
                        <div className="text-sm text-green-bright font-bold">
                          {isMulti && (bet as any).multi_odds
                            ? Number((bet as any).multi_odds).toFixed(2)
                            : Number(bet.odds_taken).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/30 uppercase">Return</div>
                        <div className="text-sm text-white font-medium">{formatCurrency(Number(bet.potential_payout))}</div>
                      </div>
                    </div>

                    {/* Multi-bet leg breakdown */}
                    {isMulti && isExpanded && legs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                        <div className="text-[10px] text-white/30 uppercase mb-1">Legs</div>
                        {legs.map((leg) => (
                          <div
                            key={leg.id}
                            className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] text-white/40 truncate">{leg.market_title}</div>
                              <div className="text-xs text-white font-medium">{leg.selection_name}</div>
                            </div>
                            <div className="flex items-center gap-3 ml-3 shrink-0">
                              <span className="text-xs text-green-bright font-bold">
                                {Number(leg.odds_taken).toFixed(2)}
                              </span>
                              <StatusBadge status={leg.result} className="text-[10px] px-1.5 py-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isMulti && isExpanded && legs.length === 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="text-xs text-white/30 italic">No leg data available</div>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-[10px] text-white/20">
                        {new Date(bet.placed_at).toLocaleString()}
                      </div>
                      {isMulti && (
                        <div className="text-[10px] text-white/30">
                          {isExpanded ? 'tap to collapse' : 'tap to expand'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
