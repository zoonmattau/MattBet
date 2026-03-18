'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Market, MarketSelection } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/constants';
import { StatusBadge } from '@/components/status-badge';
import { impliedProbability, formatCurrency } from '@/lib/exposure';
import Link from 'next/link';

type MarketWithSelections = Market & { selections: MarketSelection[] };

import { Bet } from '@/lib/types';

export function AdminMarketsClient({ markets: initialMarkets, bets: allBets }: { markets: MarketWithSelections[]; bets: Bet[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState({ category: 'all', status: 'all' });
  const [showCreate, setShowCreate] = useState(false);
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

  const filtered = initialMarkets.filter((m) => {
    if (filter.category !== 'all') {
      if (filter.category === 'outrights_all' && !['outrights', 'novelty', 'trip_specials'].includes(m.category)) return false;
      if (filter.category === 'outrights' && m.category !== 'outrights') return false;
      if (filter.category === 'novelty' && m.category !== 'novelty') return false;
      if (filter.category === 'trip_specials' && m.category !== 'trip_specials') return false;
      if (filter.category === 'score_totals' && m.category !== 'score_totals') return false;
      if (filter.category === 'match_play' && m.category !== 'match_play') return false;
      if (filter.category === 'r1' && m.category !== 'stableford' && !(m.category === 'score_totals' && (m.round_label?.toLowerCase() === 'friday' || m.slug?.includes('friday')))) return false;
      if (filter.category === 'r2' && !(m.category === 'match_play' && m.round_label === 'Saturday AM')) return false;
      if (filter.category === 'r3' && !(m.category === 'match_play' && m.round_label === 'Saturday PM')) return false;
      if (filter.category === 'r4' && !(m.category === 'match_play' && m.round_label === 'Sunday')) return false;
    }
    if (filter.status !== 'all' && m.status !== filter.status) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-white">Markets ({initialMarkets.length})</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg bg-green-accent text-white font-medium text-sm hover:bg-green-bright transition-colors"
        >
          Create Market
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filter.category}
          onChange={(e) => setFilter((p) => ({ ...p, category: e.target.value }))}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
        >
          <option value="all" className="bg-navy-card">All</option>
          <option value="outrights_all" className="bg-navy-card">Outrights (all)</option>
          <option value="outrights" className="bg-navy-card">Outrights</option>
          <option value="novelty" className="bg-navy-card">Novelty</option>
          <option value="trip_specials" className="bg-navy-card">Trip Specials</option>
          <option value="score_totals" className="bg-navy-card">Score Totals</option>
          <option value="r1" className="bg-navy-card">R1 Friday</option>
          <option value="r2" className="bg-navy-card">R2 Saturday AM</option>
          <option value="r3" className="bg-navy-card">R3 Saturday PM</option>
          <option value="r4" className="bg-navy-card">R4 Sunday</option>
          <option value="match_play" className="bg-navy-card">All Match Play</option>
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value }))}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
        >
          <option value="all" className="bg-navy-card">All Status</option>
          <option value="open" className="bg-navy-card">Open</option>
          <option value="suspended" className="bg-navy-card">Suspended</option>
          <option value="settled" className="bg-navy-card">Settled</option>
          <option value="void" className="bg-navy-card">Void</option>
        </select>
      </div>

      {/* Markets by Day */}
      <div className="space-y-6">
        {[
          { label: 'Outrights', filter: (m: MarketWithSelections) => m.category === 'outrights' || m.category === 'novelty' || m.category === 'trip_specials' },
          { label: 'R1 Friday -- Stableford', filter: (m: MarketWithSelections) => m.category === 'stableford' || (m.category === 'score_totals' && (m.round_label?.toLowerCase() === 'friday' || m.slug?.includes('friday'))) },
          { label: 'R2 Saturday AM -- Match Play', filter: (m: MarketWithSelections) => m.category === 'match_play' && m.round_label === 'Saturday AM' },
          { label: 'R3 Saturday PM -- Scramble', filter: (m: MarketWithSelections) => m.category === 'match_play' && m.round_label === 'Saturday PM' },
          { label: 'R4 Sunday -- 1v1', filter: (m: MarketWithSelections) => m.category === 'match_play' && m.round_label === 'Sunday' },
          { label: 'Other', filter: (m: MarketWithSelections) => {
            const matched = ['outrights', 'novelty', 'trip_specials', 'stableford'].includes(m.category)
              || (m.category === 'score_totals' && (m.round_label?.toLowerCase() === 'friday' || m.slug?.includes('friday')))
              || (m.category === 'match_play' && ['Saturday AM', 'Saturday PM', 'Sunday'].includes(m.round_label || ''));
            return !matched;
          }},
        ].map((group) => {
          const groupMarkets = filtered.filter(group.filter);
          if (groupMarkets.length === 0) return null;
          return (
            <div key={group.label}>
              <h2 className="text-xs text-white/40 uppercase tracking-wider font-bold mb-2">{group.label} ({groupMarkets.length})</h2>
              <div className="space-y-2">
                {groupMarkets.map((market) => (
          <AdminMarketRow
            key={market.id}
            market={market}
            isExpanded={expandedMarket === market.id}
            onToggle={() => setExpandedMarket(expandedMarket === market.id ? null : market.id)}
            marketBets={allBets.filter((b) => b.market_id === market.id)}
          />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <CreateMarketModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); router.refresh(); }}
        />
      )}
    </div>
  );
}

function AdminMarketRow({
  market,
  isExpanded,
  onToggle,
  marketBets,
}: {
  market: MarketWithSelections;
  isExpanded: boolean;
  onToggle: () => void;
  marketBets: Bet[];
}) {
  const router = useRouter();
  const [editingOdds, setEditingOdds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [editingLine, setEditingLine] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  // Live overround: uses editing values when present
  const getLiveOdds = (sel: MarketSelection) => {
    const editing = editingOdds[sel.id];
    if (editing !== undefined) {
      const parsed = parseFloat(editing);
      return parsed > 0 ? parsed : Number(sel.odds_decimal);
    }
    return Number(sel.odds_decimal);
  };
  const overround = market.selections.reduce((s, sel) => s + 1 / getLiveOdds(sel), 0) * 100;
  const savedOverround = market.selections.reduce((s, sel) => s + 1 / Number(sel.odds_decimal), 0) * 100;
  const overroundChanged = Math.abs(overround - savedOverround) > 0.05;
  const sorted = [...market.selections].sort((a, b) => Number(a.odds_decimal) - Number(b.odds_decimal));

  const handleStatusChange = async (status: string) => {
    const supabase = createClient();
    await supabase.from('markets').update({ status }).eq('id', market.id);
    router.refresh();
  };


  return (
    <div className="bg-navy-card border border-white/8 rounded-xl">
      {/* Header - click to expand */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm">{market.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={market.status} />
            {market.line_value !== null && (
              <span className="text-[10px] text-gold font-bold">Line: {market.line_value}</span>
            )}
            <span className={`text-[10px] ${overroundChanged ? 'text-gold font-bold' : 'text-white/30'}`}>
              {market.selections.length} sel -- {overround.toFixed(1)}%
              {overroundChanged && <span className="text-white/30 font-normal"> (was {savedOverround.toFixed(1)}%)</span>}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick preview of top 2 odds */}
          {sorted.slice(0, 2).map((sel) => (
            <span key={sel.id} className="text-xs text-green-bright/60 font-mono">
              {Number(sel.odds_decimal).toFixed(2)}
            </span>
          ))}
          <span className="text-xs text-white/20 ml-1">{isExpanded ? 'Close' : 'Edit'}</span>
        </div>
      </button>

      {/* Expanded - odds editor */}
      {isExpanded && (
        <div className="border-t border-white/5">
          {/* Status controls */}
          <div className="px-4 py-2 border-b border-white/5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-white/30 mr-1">Status:</span>
            {['open', 'suspended', 'settled', 'void'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={market.status === s}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  market.status === s
                    ? 'bg-white/15 text-white cursor-default'
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
            <Link
              href={`/admin/markets/${market.id}`}
              className="ml-auto text-[10px] text-green-bright hover:text-green-bright/80"
            >
              Full View
            </Link>
          </div>

          {/* Line & Title editors */}
          <div className="px-4 py-2 border-b border-white/5 flex flex-wrap items-center gap-3">
            {/* Line value editor */}
            {market.line_value !== null && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-white/30">Line:</span>
                <input
                  type="number"
                  step="0.5"
                  value={editingLine ?? market.line_value}
                  onChange={(e) => setEditingLine(e.target.value)}
                  className="w-16 px-1 py-0.5 rounded bg-white/5 border border-white/10 text-gold text-xs font-bold text-center focus:outline-none focus:border-green-bright/50"
                />
                {editingLine !== null && editingLine !== String(market.line_value) && (
                  <button
                    onClick={async () => {
                      const newLine = parseFloat(editingLine);
                      const supabase = createClient();
                      await supabase.from('markets').update({ line_value: newLine }).eq('id', market.id);

                      // Check which selections have bets
                      const { data: betsOnMarket } = await supabase
                        .from('bets')
                        .select('selection_id')
                        .eq('market_id', market.id)
                        .neq('status', 'void');
                      const selIdsWithBets = new Set((betsOnMarket || []).map((b) => b.selection_id));

                      // Create new selections at the new line, keep old ones with bets
                      for (const sel of market.selections) {
                        const name = sel.name.toLowerCase();
                        let newName: string | null = null;
                        let sortOrder = sel.sort_order;

                        if (name.startsWith('over')) newName = `Over ${newLine}`;
                        else if (name.startsWith('under')) newName = `Under ${newLine}`;
                        else if (name.includes('+')) {
                          const prefix = sel.name.split(/[+-]/)[0].trim();
                          newName = `${prefix} +${newLine}`;
                        } else if (name.includes('-') && name.match(/\d/)) {
                          const prefix = sel.name.split(/\s*-\s*\d/)[0].trim();
                          newName = `${prefix} -${newLine}`;
                        }

                        if (!newName || newName === sel.name) continue;

                        if (selIdsWithBets.has(sel.id)) {
                          // Has bets: keep old selection, create new one at new line
                          await supabase.from('market_selections').insert({
                            market_id: market.id,
                            name: newName,
                            odds_decimal: Number(sel.odds_decimal),
                            sort_order: sortOrder,
                          });
                        } else {
                          // No bets: just rename
                          await supabase.from('market_selections').update({ name: newName }).eq('id', sel.id);
                        }
                      }
                      setEditingLine(null);
                      router.refresh();
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-green-accent text-white"
                  >
                    save
                  </button>
                )}
              </div>
            )}

            {/* Title editor */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <span className="text-[10px] text-white/30 shrink-0">Title:</span>
              <input
                type="text"
                value={editingTitle ?? market.title}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="flex-1 min-w-0 px-1 py-0.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-green-bright/50"
              />
              {editingTitle !== null && editingTitle !== market.title && (
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.from('markets').update({ title: editingTitle }).eq('id', market.id);
                    setEditingTitle(null);
                    router.refresh();
                  }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-green-accent text-white shrink-0"
                >
                  save
                </button>
              )}
            </div>
          </div>

          {/* Selections with inline odds editing */}
          <div className="divide-y divide-white/3">
            {sorted.map((sel) => {
              const currentVal = editingOdds[sel.id] ?? Number(sel.odds_decimal).toFixed(2);
              const selBets = marketBets.filter((b) => b.selection_id === sel.id && b.status !== 'void');
              const totalStaked = selBets.reduce((s, b) => s + Number(b.stake), 0);
              const totalPayout = selBets.reduce((s, b) => s + Number(b.potential_payout), 0);
              const totalHandle = marketBets.filter((b) => b.status !== 'void').reduce((s, b) => s + Number(b.stake), 0);
              const netResult = totalHandle - totalPayout; // positive = bookie profits if this wins
              return (
                <div key={sel.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/70">{sel.name}</div>
                    <div className="text-[10px] text-white/25">
                      {(() => {
                        const liveOdds = getLiveOdds(sel);
                        const savedOdds = Number(sel.odds_decimal);
                        const liveProb = impliedProbability(liveOdds);
                        const changed = editingOdds[sel.id] !== undefined && Math.abs(liveOdds - savedOdds) > 0.005;
                        return (
                          <span className={changed ? 'text-gold' : totalStaked === 0 ? 'text-white/20' : ''}>
                            {liveProb.toFixed(1)}%
                            {changed && <span className="text-white/20"> (was {impliedProbability(savedOdds).toFixed(1)}%)</span>}
                          </span>
                        );
                      })()}
                      {totalStaked > 0 && (
                        <span className="ml-2">
                          {selBets.length} bet{selBets.length !== 1 ? 's' : ''} -- ${totalStaked.toFixed(0)} staked
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] font-bold ${netResult === 0 ? 'text-white/25' : netResult > 0 ? 'text-green-bright' : 'text-danger'}`}>
                      {netResult >= 0 ? '+' : ''}{formatCurrency(netResult)} if wins
                    </div>
                  </div>
                  <div className="shrink-0">
                    <input
                      type="number"
                      step="0.01"
                      value={currentVal}
                      onChange={(e) => setEditingOdds((prev) => ({ ...prev, [sel.id]: e.target.value }))}
                      className="w-20 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-green-bright text-sm font-bold text-right focus:outline-none focus:border-green-bright/50"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save All + Overround summary */}
          <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
            <div className={`text-[10px] ${overroundChanged ? 'text-gold font-bold' : 'text-white/25'}`}>
              Margin: {overround.toFixed(1)}%
              {overroundChanged && <span className="text-white/25 font-normal"> (was {savedOverround.toFixed(1)}%)</span>}
              <span className="text-white/25 font-normal"> -- {market.selections.length} selections</span>
            </div>
            {Object.keys(editingOdds).length > 0 && (
              <button
                onClick={async () => {
                  setSaving('all');
                  const supabase = createClient();
                  for (const [selId, val] of Object.entries(editingOdds)) {
                    const newOdds = parseFloat(val);
                    if (newOdds && newOdds > 1) {
                      await supabase.from('market_selections').update({ odds_decimal: newOdds }).eq('id', selId);
                    }
                  }
                  setEditingOdds({});
                  setSaving(null);
                  router.refresh();
                }}
                disabled={saving === 'all'}
                className="px-3 py-1.5 rounded-lg bg-green-accent text-white text-xs font-bold hover:bg-green-bright transition-colors disabled:opacity-50"
              >
                {saving === 'all' ? 'Saving...' : `Save All (${Object.keys(editingOdds).length})`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStatusButton({ market, status }: { market: Market; status: string }) {
  const router = useRouter();
  const isCurrent = market.status === status;

  const handleClick = async () => {
    if (isCurrent) return;
    const supabase = createClient();
    await supabase.from('markets').update({ status }).eq('id', market.id);
    router.refresh();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isCurrent}
      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
        isCurrent
          ? 'bg-white/10 text-white/40 cursor-default'
          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
      }`}
    >
      {status}
    </button>
  );
}

function CreateMarketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'outrights' as string,
    market_type: 'winner',
    line_value: '',
    round_label: '',
    is_featured: false,
  });
  const [selections, setSelections] = useState([{ name: '', odds: '2.00' }]);
  const [saving, setSaving] = useState(false);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async () => {
    if (!form.title || selections.filter((s) => s.name).length === 0) return;
    setSaving(true);
    const supabase = createClient();

    const slug = form.slug || generateSlug(form.title);
    const { data: market } = await supabase
      .from('markets')
      .insert({
        title: form.title,
        slug,
        category: form.category,
        market_type: form.market_type,
        line_value: form.line_value ? parseFloat(form.line_value) : null,
        round_label: form.round_label || null,
        is_featured: form.is_featured,
        status: 'open',
      })
      .select()
      .single();

    if (market) {
      const sels = selections
        .filter((s) => s.name)
        .map((s, idx) => ({
          market_id: market.id,
          name: s.name,
          odds_decimal: parseFloat(s.odds) || 2.0,
          sort_order: idx + 1,
        }));

      if (sels.length > 0) {
        await supabase.from('market_selections').insert(sels);
      }
    }

    setSaving(false);
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-card border border-white/8 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-bold">Create Market</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/60 text-sm">close</button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-bright/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              >
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat} className="bg-navy-card">{CATEGORIES[cat]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Type</label>
              <select
                value={form.market_type}
                onChange={(e) => setForm((f) => ({ ...f, market_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              >
                <option value="winner" className="bg-navy-card">Winner</option>
                <option value="over_under" className="bg-navy-card">Over/Under</option>
                <option value="yes_no" className="bg-navy-card">Yes/No</option>
                <option value="top_n" className="bg-navy-card">Top N</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Line Value (optional)</label>
              <input
                type="number"
                step="0.5"
                value={form.line_value}
                onChange={(e) => setForm((f) => ({ ...f, line_value: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-bright/50"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Round Label</label>
              <input
                type="text"
                value={form.round_label}
                onChange={(e) => setForm((f) => ({ ...f, round_label: e.target.value }))}
                placeholder="e.g. Friday"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-bright/50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-white/60">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
              className="rounded"
            />
            Featured Market
          </label>

          <div>
            <label className="text-xs text-white/50 mb-2 block">Selections</label>
            <div className="space-y-2">
              {selections.map((sel, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={sel.name}
                    onChange={(e) => {
                      const newSels = [...selections];
                      newSels[idx].name = e.target.value;
                      setSelections(newSels);
                    }}
                    placeholder="Selection name"
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-bright/50"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={sel.odds}
                    onChange={(e) => {
                      const newSels = [...selections];
                      newSels[idx].odds = e.target.value;
                      setSelections(newSels);
                    }}
                    className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-green-bright text-sm font-bold focus:outline-none focus:border-green-bright/50"
                  />
                  {selections.length > 1 && (
                    <button
                      onClick={() => setSelections(selections.filter((_, i) => i !== idx))}
                      className="px-2 text-white/30 hover:text-danger text-xs"
                    >
                      remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelections([...selections, { name: '', odds: '2.00' }])}
              className="mt-2 text-xs text-green-bright hover:text-green-bright/80 transition-colors"
            >
              + Add Selection
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3 rounded-lg bg-green-accent text-white font-bold text-sm hover:bg-green-bright transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Market'}
          </button>
        </div>
      </div>
    </div>
  );
}
