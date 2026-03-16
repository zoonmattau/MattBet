'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Market, MarketSelection } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/constants';
import { StatusBadge } from '@/components/status-badge';
import { impliedProbability } from '@/lib/exposure';
import Link from 'next/link';

type MarketWithSelections = Market & { selections: MarketSelection[] };

export function AdminMarketsClient({ markets: initialMarkets }: { markets: MarketWithSelections[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState({ category: 'all', status: 'all' });
  const [showCreate, setShowCreate] = useState(false);
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

  const filtered = initialMarkets.filter((m) => {
    if (filter.category !== 'all' && m.category !== filter.category) return false;
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
          <option value="all" className="bg-navy-card">All Categories</option>
          {CATEGORY_ORDER.map((cat) => (
            <option key={cat} value={cat} className="bg-navy-card">{CATEGORIES[cat]}</option>
          ))}
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

      {/* Markets List */}
      <div className="space-y-2">
        {filtered.map((market) => (
          <AdminMarketRow
            key={market.id}
            market={market}
            isExpanded={expandedMarket === market.id}
            onToggle={() => setExpandedMarket(expandedMarket === market.id ? null : market.id)}
          />
        ))}
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
}: {
  market: MarketWithSelections;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [editingOdds, setEditingOdds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const overround = market.selections.reduce((s, sel) => s + 1 / Number(sel.odds_decimal), 0) * 100;
  const sorted = [...market.selections].sort((a, b) => Number(a.odds_decimal) - Number(b.odds_decimal));

  const handleStatusChange = async (status: string) => {
    const supabase = createClient();
    await supabase.from('markets').update({ status }).eq('id', market.id);
    router.refresh();
  };

  const saveOdds = async (selId: string) => {
    const newOdds = parseFloat(editingOdds[selId]);
    if (!newOdds || newOdds <= 1) return;
    setSaving(selId);
    const supabase = createClient();
    await supabase.from('market_selections').update({ odds_decimal: newOdds }).eq('id', selId);
    setEditingOdds((prev) => { const next = { ...prev }; delete next[selId]; return next; });
    setSaving(null);
    router.refresh();
  };

  return (
    <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
      {/* Header - click to expand */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm">{market.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={market.status} />
            <span className="text-[10px] text-white/30">
              {market.selections.length} sel -- {overround.toFixed(1)}%
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
          <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
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

          {/* Selections with inline odds editing */}
          <div className="divide-y divide-white/3">
            {sorted.map((sel) => {
              const isEditing = editingOdds[sel.id] !== undefined;
              const currentVal = editingOdds[sel.id] ?? Number(sel.odds_decimal).toFixed(2);
              return (
                <div key={sel.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/70">{sel.name}</div>
                    <div className="text-[10px] text-white/25">
                      {impliedProbability(Number(sel.odds_decimal)).toFixed(1)}% implied
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      step="0.01"
                      value={currentVal}
                      onChange={(e) => setEditingOdds((prev) => ({ ...prev, [sel.id]: e.target.value }))}
                      className="w-20 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-green-bright text-sm font-bold text-right focus:outline-none focus:border-green-bright/50"
                    />
                    {isEditing && (
                      <button
                        onClick={() => saveOdds(sel.id)}
                        disabled={saving === sel.id}
                        className="text-[10px] px-2 py-1 rounded bg-green-accent text-white hover:bg-green-bright transition-colors"
                      >
                        {saving === sel.id ? '...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overround summary */}
          <div className="px-4 py-2 border-t border-white/5 text-[10px] text-white/25">
            Margin: {overround.toFixed(1)}% -- {market.selections.length} selections
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
