'use client';

import { useState, useEffect } from 'react';
import { Bet, Market, MarketSelection } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/exposure';
import { StatusBadge } from '@/components/status-badge';

export default function MyBetsPage() {
  const [name, setName] = useState('');
  const [searchName, setSearchName] = useState('');
  const [bets, setBets] = useState<(Bet & { market: Market; selection: MarketSelection })[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setSearchName(name.trim());
    const supabase = createClient();

    const { data } = await supabase
      .from('bets')
      .select('*, market:markets(*), selection:market_selections(*)')
      .ilike('bettor_name', name.trim())
      .order('placed_at', { ascending: false });

    setBets((data as typeof bets) || []);
    setLoading(false);
  };

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
            onClick={handleSearch}
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
              {bets.map((bet) => (
                <div
                  key={bet.id}
                  className="bg-navy-card border border-white/8 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-xs text-white/40">{bet.market?.title}</div>
                      <div className="text-sm text-white font-semibold">{bet.selection?.name}</div>
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
                      <div className="text-sm text-green-bright font-bold">{Number(bet.odds_taken).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/30 uppercase">Return</div>
                      <div className="text-sm text-white font-medium">{formatCurrency(Number(bet.potential_payout))}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-white/20">
                    {new Date(bet.placed_at).toLocaleString()}
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="bg-navy-card border border-white/8 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Total Staked</div>
                    <div className="text-sm text-white font-bold">
                      {formatCurrency(bets.reduce((s, b) => s + Number(b.stake), 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Pending</div>
                    <div className="text-sm text-warning font-bold">
                      {bets.filter((b) => b.status === 'pending').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Won</div>
                    <div className="text-sm text-green-bright font-bold">
                      {formatCurrency(
                        bets
                          .filter((b) => b.status === 'won')
                          .reduce((s, b) => s + Number(b.potential_payout), 0)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
