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
  bet_type?: string;
  market: { id: string; title: string; slug: string } | null;
  selection: { id: string; name: string } | null;
}

export function AdminBetsClient({ bets }: { bets: BetRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ stake: '', odds: '', status: '' });

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

  const handleDelete = async (betId: string) => {
    if (!confirm('Delete this bet permanently? This cannot be undone.')) return;
    const supabase = createClient();
    await supabase.from('bet_legs').delete().eq('bet_id', betId);
    await supabase.from('bets').delete().eq('id', betId);
    router.refresh();
  };

  const startEdit = (bet: BetRow) => {
    setEditing(bet.id);
    setEditForm({
      stake: String(bet.stake),
      odds: String(bet.odds_taken),
      status: bet.status,
    });
  };

  const saveEdit = async (betId: string) => {
    const stake = parseFloat(editForm.stake);
    const odds = parseFloat(editForm.odds);
    if (!stake || !odds) return;
    const payout = parseFloat((stake * odds).toFixed(2));

    const supabase = createClient();
    await supabase.from('bets').update({
      stake,
      odds_taken: odds,
      potential_payout: payout,
      status: editForm.status,
      settled_at: ['won', 'lost', 'void'].includes(editForm.status) ? new Date().toISOString() : null,
    }).eq('id', betId);

    setEditing(null);
    router.refresh();
  };

  const totalStaked = filtered.reduce((s, b) => s + Number(b.stake), 0);
  const totalPayout = filtered.filter((b) => b.status === 'won').reduce((s, b) => s + Number(b.potential_payout), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-white">Bets ({bets.length})</h1>

      {/* Review Queue */}
      <ReviewQueue bets={bets} />

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
              <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Type</th>
              <th className="text-right px-4 py-2.5 text-white/40 text-xs uppercase font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((bet) => (
              <tr key={bet.id} className="border-b border-white/3">
                {editing === bet.id ? (
                  <>
                    <td className="px-4 py-2.5 text-white font-medium">{bet.bettor_name}</td>
                    <td className="px-3 py-2.5 text-white/60 text-xs">{bet.market?.title || '-'}</td>
                    <td className="px-3 py-2.5 text-white/60">{bet.selection?.name || '-'}</td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        type="number" step="0.01" value={editForm.stake}
                        onChange={(e) => setEditForm((f) => ({ ...f, stake: e.target.value }))}
                        className="w-20 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs text-right focus:outline-none focus:border-green-bright/50"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        type="number" step="0.01" value={editForm.odds}
                        onChange={(e) => setEditForm((f) => ({ ...f, odds: e.target.value }))}
                        className="w-20 px-2 py-1 rounded bg-white/5 border border-white/10 text-green-bright text-xs font-bold text-right focus:outline-none focus:border-green-bright/50"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right text-white/40 text-xs">
                      {formatCurrency(parseFloat(editForm.stake || '0') * parseFloat(editForm.odds || '0'))}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                        className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                      >
                        <option value="pending" className="bg-navy-card">Pending</option>
                        <option value="won" className="bg-navy-card">Won</option>
                        <option value="lost" className="bg-navy-card">Lost</option>
                        <option value="void" className="bg-navy-card">Void</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5 text-right text-white/30 text-xs">{bet.bet_type || 'single'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => saveEdit(bet.id)}
                          className="text-[10px] px-2 py-1 rounded bg-green-accent text-white hover:bg-green-bright transition-colors"
                        >
                          save
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
                        >
                          cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
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
                    <td className="px-3 py-2.5 text-right text-white/30 text-xs">{bet.bet_type || 'single'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => startEdit(bet)}
                          className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => handleVoid(bet.id)}
                          className="text-[10px] px-2 py-1 rounded bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                        >
                          void
                        </button>
                        <button
                          onClick={() => handleDelete(bet.id)}
                          className="text-[10px] px-2 py-1 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                        >
                          delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewQueue({ bets }: { bets: BetRow[] }) {
  const router = useRouter();
  const [partialStake, setPartialStake] = useState<Record<string, string>>({});

  const reviewBets = bets.filter((b) => (b as any).requires_review && (b as any).review_status === 'pending');
  if (reviewBets.length === 0) return null;

  const handleApprove = async (betId: string) => {
    const supabase = createClient();
    await supabase.from('bets').update({ review_status: 'approved' }).eq('id', betId);
    router.refresh();
  };

  const handleDeny = async (betId: string) => {
    if (!confirm('Deny and void this bet?')) return;
    const supabase = createClient();
    await supabase.from('bets').update({
      review_status: 'denied',
      status: 'void',
      settled_at: new Date().toISOString(),
    }).eq('id', betId);
    router.refresh();
  };

  const handlePartial = async (bet: BetRow) => {
    const newStake = parseFloat(partialStake[bet.id] || '0');
    if (!newStake || newStake <= 0 || newStake >= Number(bet.stake)) {
      alert('Enter a stake lower than the original');
      return;
    }
    const newPayout = parseFloat((newStake * Number(bet.odds_taken)).toFixed(2));
    const supabase = createClient();
    await supabase.from('bets').update({
      stake: newStake,
      potential_payout: newPayout,
      review_status: 'partial',
    }).eq('id', bet.id);
    router.refresh();
  };

  return (
    <div className="bg-danger/5 border border-danger/20 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-danger/10">
        <span className="text-danger font-bold text-sm">Review Required ({reviewBets.length})</span>
        <span className="text-[10px] text-white/30 ml-2">Bets with payout over $500</span>
      </div>
      <div className="divide-y divide-white/5">
        {reviewBets.map((bet) => (
          <div key={bet.id} className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-white font-medium text-sm">{bet.bettor_name}</span>
                <span className="text-white/40 text-xs ml-2">{bet.market?.title} -- {bet.selection?.name}</span>
              </div>
              <span className="text-[10px] text-white/30">{bet.bet_type || 'single'}</span>
            </div>
            <div className="flex items-center gap-4 mb-3 text-xs">
              <span className="text-white/50">Stake: <span className="text-white font-bold">{formatCurrency(Number(bet.stake))}</span></span>
              <span className="text-white/50">Odds: <span className="text-green-bright font-bold">{Number(bet.odds_taken).toFixed(2)}</span></span>
              <span className="text-white/50">Payout: <span className="text-danger font-bold">{formatCurrency(Number(bet.potential_payout))}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApprove(bet.id)}
                className="text-[10px] px-3 py-1.5 rounded bg-green-accent text-white hover:bg-green-bright transition-colors font-medium"
              >
                Accept
              </button>
              <button
                onClick={() => handleDeny(bet.id)}
                className="text-[10px] px-3 py-1.5 rounded bg-danger/20 text-danger hover:bg-danger/30 transition-colors font-medium"
              >
                Deny
              </button>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-white/30">Partial $</span>
                <input
                  type="number"
                  step="1"
                  value={partialStake[bet.id] || ''}
                  onChange={(e) => setPartialStake((p) => ({ ...p, [bet.id]: e.target.value }))}
                  placeholder="New stake"
                  className="w-20 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-green-bright/50"
                />
                {partialStake[bet.id] && (
                  <button
                    onClick={() => handlePartial(bet)}
                    className="text-[10px] px-2 py-1 rounded bg-warning/20 text-warning hover:bg-warning/30 transition-colors font-medium"
                  >
                    Partial Accept
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
