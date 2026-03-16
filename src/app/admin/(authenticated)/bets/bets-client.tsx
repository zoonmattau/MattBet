'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/exposure';

interface BetRow {
  id: string;
  bettor_name: string;
  stake: number;
  odds_taken: number;
  potential_payout: number;
  status: string;
  placed_at: string;
  settled_at: string | null;
  market: { id: string; title: string; slug: string } | null;
  selection: { id: string; name: string } | null;
}

export function AdminBetsClient({ bets }: { bets: BetRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = bets.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search && !b.bettor_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleVoid = async (betId: string) => {
    if (!confirm('Void this bet?')) return;
    const supabase = createClient();
    await supabase.from('bets').update({ status: 'void', settled_at: new Date().toISOString() }).eq('id', betId);
    router.refresh();
  };

  const totalStaked = filtered.reduce((s, b) => s + Number(b.stake), 0);
  const totalPayout = filtered.filter((b) => b.status === 'won').reduce((s, b) => s + Number(b.potential_payout), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-white">Bets ({bets.length})</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-green-bright/50 w-48"
        />
        {['all', 'pending', 'won', 'lost', 'void'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-white/15 text-white'
                : 'bg-white/5 text-white/40 hover:text-white/60'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-navy-card border border-white/8 rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase">Filtered Bets</div>
          <div className="text-lg font-bold text-white">{filtered.length}</div>
        </div>
        <div className="bg-navy-card border border-white/8 rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase">Total Staked</div>
          <div className="text-lg font-bold text-white">{formatCurrency(totalStaked)}</div>
        </div>
        <div className="bg-navy-card border border-white/8 rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase">Won Payouts</div>
          <div className="text-lg font-bold text-green-bright">{formatCurrency(totalPayout)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-2.5 text-white/40 text-xs uppercase font-medium">Bettor</th>
              <th className="text-left px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Market</th>
              <th className="text-left px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Selection</th>
              <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Stake</th>
              <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Odds</th>
              <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Payout</th>
              <th className="text-center px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Status</th>
              <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Placed</th>
              <th className="text-right px-4 py-2.5 text-white/40 text-xs uppercase font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((bet) => (
              <tr key={bet.id} className="border-b border-white/3">
                <td className="px-4 py-2.5 text-white font-medium">{bet.bettor_name}</td>
                <td className="px-3 py-2.5 text-white/60 text-xs">{bet.market?.title || '-'}</td>
                <td className="px-3 py-2.5 text-white/60">{bet.selection?.name || '-'}</td>
                <td className="px-3 py-2.5 text-right text-white/60">{formatCurrency(Number(bet.stake))}</td>
                <td className="px-3 py-2.5 text-right text-green-bright font-bold">{Number(bet.odds_taken).toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right text-white/60">{formatCurrency(Number(bet.potential_payout))}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase status-${bet.status}`}>
                    {bet.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-white/30 text-xs">
                  {new Date(bet.placed_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {bet.status === 'pending' && (
                    <button
                      onClick={() => handleVoid(bet.id)}
                      className="text-[10px] px-2 py-1 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                    >
                      void
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
