'use client';

import { useState } from 'react';
import { generateAllMatchOdds } from '@/lib/match-simulator';

const MATCH_NAMES: Record<string, { name: string; teamA: string; teamB: string }> = {
  'r2-m1': { name: 'R2 M1', teamA: 'Hugo/Bails', teamB: 'Jackson/Finn' },
  'r2-m2': { name: 'R2 M2', teamA: 'Lewis/Jacob', teamB: 'Ando/McNaughton' },
  'r2-m3': { name: 'R2 M3', teamA: 'Brad/Watto', teamB: 'Daniel/Parker' },
  'r3-m1': { name: 'R3 M1', teamA: 'Hugo/Bails', teamB: 'Daniel/Parker' },
  'r3-m2': { name: 'R3 M2', teamA: 'Jackson/Finn', teamB: 'Brad/Watto' },
  'r3-m3': { name: 'R3 M3', teamA: 'Lewis/Jacob', teamB: 'Ando/McNaughton' },
  'r4-hugo-jacko': { name: 'R4', teamA: 'Hugo', teamB: 'Jackson' },
  'r4-lewis-bails': { name: 'R4', teamA: 'Lewis', teamB: 'Bails' },
  'r4-finn-jacob': { name: 'R4', teamA: 'Jacob', teamB: 'Finn' },
  'r4-ando-daniel': { name: 'R4', teamA: 'Ando', teamB: 'Daniel' },
  'r4-brad-parker': { name: 'R4', teamA: 'Brad', teamB: 'Parker' },
  'r4-horny-general': { name: 'R4', teamA: 'Watto', teamB: 'McNaughton' },
};

export default function SimPage() {
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [sql, setSql] = useState('');
  const [copied, setCopied] = useState(false);

  const runSim = () => {
    const odds = generateAllMatchOdds();
    setResults(odds);
    setSql('');
    setCopied(false);
  };

  const generateSQL = () => {
    if (!results) return;
    const lines: string[] = ['-- Auto-generated from 10,000 match simulations', ''];

    for (const [prefix, odds] of Object.entries(results)) {
      if (!odds) continue;
      const m = MATCH_NAMES[prefix];
      if (!m) continue;

      lines.push(`-- ${m.name}: ${m.teamA} vs ${m.teamB}`);

      // H2H
      const h2hSlug = `${prefix}-h2h`;
      lines.push(`UPDATE public.market_selections SET odds_decimal = ${odds.h2h.a} WHERE market_id = (SELECT id FROM public.markets WHERE slug = '${h2hSlug}') AND sort_order = 1;`);
      lines.push(`UPDATE public.market_selections SET odds_decimal = ${odds.h2h.b} WHERE market_id = (SELECT id FROM public.markets WHERE slug = '${h2hSlug}') AND sort_order = 2;`);
      lines.push(`UPDATE public.market_selections SET odds_decimal = ${odds.h2h.halved} WHERE market_id = (SELECT id FROM public.markets WHERE slug = '${h2hSlug}') AND name = 'Halved';`);

      // Line
      const lineSlug = `${prefix}-line`;
      const favName = odds.line.favSide === 'a' ? m.teamA : m.teamB;
      const dogName = odds.line.favSide === 'a' ? m.teamB : m.teamA;
      lines.push(`UPDATE public.markets SET line_value = ${odds.line.value} WHERE slug = '${lineSlug}';`);
      lines.push(`UPDATE public.market_selections SET name = '${favName} -${odds.line.value}', odds_decimal = ${odds.line.fav} WHERE market_id = (SELECT id FROM public.markets WHERE slug = '${lineSlug}') AND sort_order = 1;`);
      lines.push(`UPDATE public.market_selections SET name = '${dogName} +${odds.line.value}', odds_decimal = ${odds.line.dog} WHERE market_id = (SELECT id FROM public.markets WHERE slug = '${lineSlug}') AND sort_order = 2;`);

      // Total A
      const totalASlug = Object.keys(MATCH_NAMES).includes(prefix)
        ? `${prefix.replace('r4-', '').split('-').slice(0, prefix.startsWith('r4') ? 2 : 1).join('-')}`
        : prefix;
      // We need to find the actual total slugs from the match config
      // For now use the pattern from matches.ts
      lines.push(`-- Total A (${m.teamA}): line ${odds.totalA.value}`);
      lines.push(`-- Total B (${m.teamB}): line ${odds.totalB.value}`);
      // These need the actual slugs which vary per match - skipping exact SQL for totals
      // as the slugs aren't uniform enough

      lines.push('');
    }

    setSql(lines.join('\n'));
  };

  const copySQL = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-white">Match Simulator</h1>
        <div className="flex gap-2">
          <button
            onClick={runSim}
            className="px-4 py-2 rounded-lg bg-green-accent text-white font-medium text-sm hover:bg-green-bright transition-colors"
          >
            Run 10,000 Sims
          </button>
          {results && (
            <button
              onClick={generateSQL}
              className="px-4 py-2 rounded-lg bg-white/[0.08] text-white font-medium text-sm hover:bg-white/[0.12] transition-colors"
            >
              Generate SQL
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-white/40">
        Simulates all matches using player handicaps. Use generated SQL to update Supabase odds.
      </p>

      {/* SQL Output */}
      {sql && (
        <div className="bg-navy-card border border-white/[0.08] rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-white font-bold text-sm">SQL Update</span>
            <button
              onClick={copySQL}
              className="px-3 py-1 rounded text-xs font-medium bg-green-accent text-white hover:bg-green-bright transition-colors"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 text-xs text-green-bright/70 overflow-x-auto max-h-64 overflow-y-auto font-mono">
            {sql}
          </pre>
        </div>
      )}

      {/* Results */}
      {results && Object.entries(results).map(([prefix, odds]) => {
        if (!odds) return null;
        const m = MATCH_NAMES[prefix];
        return (
          <div key={prefix} className="bg-navy-card border border-white/[0.08] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-white font-bold text-sm">{m?.teamA || 'A'} vs {m?.teamB || 'B'}</span>
              {odds.debug && (
                <span className="text-xs text-white/30">
                  A: {odds.debug.aWins} | B: {odds.debug.bWins} | Halved: {odds.debug.halved} | Fav: {odds.debug.winPct}%
                </span>
              )}
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-white/30 text-[10px] uppercase mb-1">H2H</div>
                <div className="text-white/70">{m?.teamA}: <span className="text-green-bright font-bold">${odds.h2h.a}</span></div>
                <div className="text-white/70">{m?.teamB}: <span className="text-green-bright font-bold">${odds.h2h.b}</span></div>
                <div className="text-white/50">Halved: <span className="text-green-bright font-bold">${odds.h2h.halved}</span></div>
              </div>
              <div>
                <div className="text-white/30 text-[10px] uppercase mb-1">DNB</div>
                <div className="text-white/70">{m?.teamA}: <span className="text-green-bright font-bold">${odds.dnb.a}</span></div>
                <div className="text-white/70">{m?.teamB}: <span className="text-green-bright font-bold">${odds.dnb.b}</span></div>
              </div>
              <div>
                <div className="text-white/30 text-[10px] uppercase mb-1">Line ({odds.line.value})</div>
                <div className="text-white/70">{odds.line.favSide === 'a' ? m?.teamA : m?.teamB} -{odds.line.value}: <span className="text-green-bright font-bold">${odds.line.fav}</span></div>
                <div className="text-white/70">{odds.line.favSide === 'a' ? m?.teamB : m?.teamA} +{odds.line.value}: <span className="text-green-bright font-bold">${odds.line.dog}</span></div>
              </div>
              <div>
                <div className="text-white/30 text-[10px] uppercase mb-1">{m?.teamA} Total ({odds.totalA.value})</div>
                <div className="text-white/70">Over: <span className="text-green-bright font-bold">${odds.totalA.over}</span></div>
                <div className="text-white/70">Under: <span className="text-green-bright font-bold">${odds.totalA.under}</span></div>
              </div>
              <div>
                <div className="text-white/30 text-[10px] uppercase mb-1">{m?.teamB} Total ({odds.totalB.value})</div>
                <div className="text-white/70">Over: <span className="text-green-bright font-bold">${odds.totalB.over}</span></div>
                <div className="text-white/70">Under: <span className="text-green-bright font-bold">${odds.totalB.under}</span></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
