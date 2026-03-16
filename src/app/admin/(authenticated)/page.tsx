import { createServerSupabase } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/exposure';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createServerSupabase();

  const { data: bets } = await supabase.from('bets').select('*');
  const { data: markets } = await supabase.from('markets').select('*');

  const allBets = bets || [];
  const allMarkets = markets || [];

  const totalBets = allBets.length;
  const pendingBets = allBets.filter((b) => b.status === 'pending');
  const totalHandle = allBets.reduce((s, b) => s + Number(b.stake), 0);
  const totalLiability = pendingBets.reduce((s, b) => s + Number(b.potential_payout), 0);
  const openMarkets = allMarkets.filter((m) => m.status === 'open').length;
  const settledMarkets = allMarkets.filter((m) => m.status === 'settled').length;

  const bettors = new Set(allBets.map((b) => b.bettor_name.toLowerCase()));
  const activeBettors = bettors.size;

  // Biggest potential loss = max single bet payout
  const biggestPotentialLoss = pendingBets.length > 0
    ? Math.max(...pendingBets.map((b) => Number(b.potential_payout)))
    : 0;

  // Biggest winning customer
  const wonBets = allBets.filter((b) => b.status === 'won');
  const winningsByBettor: Record<string, number> = {};
  wonBets.forEach((b) => {
    const key = b.bettor_name.toLowerCase();
    winningsByBettor[key] = (winningsByBettor[key] || 0) + Number(b.potential_payout);
  });
  const biggestWinner = Object.entries(winningsByBettor).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    { label: 'Total Bets', value: totalBets.toString() },
    { label: 'Total Handle', value: formatCurrency(totalHandle) },
    { label: 'Total Liability', value: formatCurrency(totalLiability), danger: true },
    { label: 'Open Markets', value: openMarkets.toString() },
    { label: 'Settled Markets', value: settledMarkets.toString() },
    { label: 'Active Bettors', value: activeBettors.toString() },
    { label: 'Biggest Potential Loss', value: formatCurrency(biggestPotentialLoss), danger: true },
    { label: 'Biggest Winner', value: biggestWinner ? `${biggestWinner[0]} (${formatCurrency(biggestWinner[1])})` : 'None yet' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-white">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-navy-card border border-white/8 rounded-xl p-4"
          >
            <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">
              {stat.label}
            </div>
            <div className={`text-lg font-bold ${
              stat.danger ? 'text-danger' : 'text-white'
            }`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bets */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">Recent Bets</h2>
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Bettor</th>
                <th className="text-left px-3 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Stake</th>
                <th className="text-left px-3 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Odds</th>
                <th className="text-left px-3 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Payout</th>
                <th className="text-left px-3 py-2.5 text-white/40 text-xs uppercase tracking-wide font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {allBets
                .sort((a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime())
                .slice(0, 10)
                .map((bet) => (
                  <tr key={bet.id} className="border-b border-white/3">
                    <td className="px-4 py-2.5 text-white font-medium">{bet.bettor_name}</td>
                    <td className="px-3 py-2.5 text-white/60">{formatCurrency(Number(bet.stake))}</td>
                    <td className="px-3 py-2.5 text-green-bright font-bold">{Number(bet.odds_taken).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-white/60">{formatCurrency(Number(bet.potential_payout))}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase status-${bet.status}`}>
                        {bet.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
