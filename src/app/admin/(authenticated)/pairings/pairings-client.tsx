'use client';

import { useState, useEffect } from 'react';
import { MatchDefinition, DEFAULT_MATCHES, PairingOverrides } from '@/lib/matches';
import { HANDICAPS } from '@/lib/constants';

const ALL_PLAYERS = Object.keys(HANDICAPS);

// Round 2/3 use pairs, Round 4 uses individuals
const ROUND_CONFIGS: Record<number, { label: string; format: string; pairSize: 1 | 2 }> = {
  2: { label: 'Round 2 - Saturday AM', format: '2v2 Match Play (Lost Farm)', pairSize: 2 },
  3: { label: 'Round 3 - Saturday PM', format: '2v2 Scramble (Bougle Run)', pairSize: 2 },
  4: { label: 'Round 4 - Sunday', format: '1v1 Match Play (Barnbougle Dunes)', pairSize: 1 },
};

export function PairingsClient() {
  const [matches, setMatches] = useState<MatchDefinition[]>(DEFAULT_MATCHES);
  const [overrides, setOverrides] = useState<PairingOverrides>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeRound, setActiveRound] = useState(2);
  const [generatingOdds, setGeneratingOdds] = useState(false);
  const [oddsGenerated, setOddsGenerated] = useState(false);
  const [oddsResults, setOddsResults] = useState<{ match: string; updates: string[] }[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/pairings')
      .then((r) => r.json())
      .then((data) => {
        setMatches(data.matches);
        setOverrides(data.overrides || {});
      })
      .finally(() => setLoading(false));
  }, []);

  const updateTeam = (matchId: string, side: 'teamA' | 'teamB', value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: value },
    }));
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, [side]: value } : m))
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pairings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateOdds = async () => {
    setGeneratingOdds(true);
    setOddsGenerated(false);
    setOddsResults(null);
    try {
      // Save pairings first so the API uses them
      await fetch('/api/admin/pairings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides }),
      });
      // Generate and apply odds
      const res = await fetch('/api/admin/generate-odds', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOddsGenerated(true);
        setOddsResults(data.results);
        setSaved(true);
        setTimeout(() => { setOddsGenerated(false); setSaved(false); }, 5000);
      }
    } finally {
      setGeneratingOdds(false);
    }
  };

  const roundMatches = matches.filter((m) => m.round === activeRound);
  const config = ROUND_CONFIGS[activeRound];

  if (loading) {
    return (
      <div className="text-white/50 text-center py-12">Loading pairings...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-white">Match Pairings</h1>
          <p className="text-sm text-white/40 mt-1">Update who plays whom</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              saved
                ? 'bg-green-accent/20 text-green-bright border border-green-bright/30'
                : 'bg-green-accent text-white hover:bg-green-accent/80'
            } disabled:opacity-50`}
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Generate Odds button */}
      <div className="mb-6">
        <button
          onClick={handleGenerateOdds}
          disabled={generatingOdds}
          className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
            oddsGenerated
              ? 'bg-green-accent/10 text-green-bright border-green-bright/30'
              : 'bg-gold/10 text-gold border-gold/20 hover:bg-gold/20'
          } disabled:opacity-50`}
        >
          {generatingOdds ? 'Saving pairings & running 10,000 sims per match...' : oddsGenerated ? 'Odds updated for all markets!' : 'Save & Generate Odds for All Matches'}
        </button>
        {oddsGenerated && oddsResults && (
          <div className="mt-3 bg-navy-card border border-white/8 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            {oddsResults.map((r, i) => (
              <div key={i} className="px-4 py-2.5 border-b border-white/5 last:border-0">
                <div className="text-xs font-bold text-white mb-1">{r.match}</div>
                {r.updates.map((u, j) => (
                  <div key={j} className="text-[11px] text-white/40">{u}</div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Round tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {[2, 3, 4].map((r) => (
          <button
            key={r}
            onClick={() => setActiveRound(r)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeRound === r
                ? 'bg-green-accent text-white'
                : 'bg-white/5 text-white/50 hover:text-white/70'
            }`}
          >
            R{r} {r === 2 ? 'Sat AM' : r === 3 ? 'Sat PM' : 'Sunday'}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <div className="text-sm text-white/40">{config.format}</div>
      </div>

      {/* Match cards */}
      <div className="space-y-4">
        {roundMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            pairSize={config.pairSize}
            onUpdateTeam={updateTeam}
          />
        ))}
      </div>

      {/* Floating buttons for mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`px-4 py-3 rounded-full text-sm font-bold shadow-lg transition-all ${
            saved
              ? 'bg-green-accent/20 text-green-bright border border-green-bright/30'
              : 'bg-green-accent text-white hover:bg-green-accent/80'
          } disabled:opacity-50`}
        >
          {saving ? '...' : saved ? 'Saved!' : 'Save'}
        </button>
        <button
          onClick={handleGenerateOdds}
          disabled={generatingOdds}
          className={`px-4 py-3 rounded-full text-sm font-bold shadow-lg transition-all ${
            oddsGenerated
              ? 'bg-green-accent/20 text-green-bright border border-green-bright/30'
              : 'bg-gold/20 text-gold border border-gold/30'
          } disabled:opacity-50`}
        >
          {generatingOdds ? '...' : oddsGenerated ? 'Done!' : 'Gen Odds'}
        </button>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  pairSize,
  onUpdateTeam,
}: {
  match: MatchDefinition;
  pairSize: 1 | 2;
  onUpdateTeam: (matchId: string, side: 'teamA' | 'teamB', value: string) => void;
}) {
  return (
    <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
      {/* Match header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">{match.id.toUpperCase()}</span>
        <span className="text-[10px] text-white/30">{match.format}</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Team A */}
        <div>
          <label className="text-[11px] text-white/40 uppercase mb-1.5 block">Team A</label>
          {pairSize === 1 ? (
            <PlayerSelect
              value={match.teamA}
              onChange={(v) => onUpdateTeam(match.id, 'teamA', v)}
            />
          ) : (
            <PairInput
              value={match.teamA}
              onChange={(v) => onUpdateTeam(match.id, 'teamA', v)}
            />
          )}
        </div>

        <div className="flex items-center justify-center">
          <span className="text-white/20 text-xs font-medium">VS</span>
        </div>

        {/* Team B */}
        <div>
          <label className="text-[11px] text-white/40 uppercase mb-1.5 block">Team B</label>
          {pairSize === 1 ? (
            <PlayerSelect
              value={match.teamB}
              onChange={(v) => onUpdateTeam(match.id, 'teamB', v)}
            />
          ) : (
            <PairInput
              value={match.teamB}
              onChange={(v) => onUpdateTeam(match.id, 'teamB', v)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-green-bright/30"
    >
      {ALL_PLAYERS.map((p) => (
        <option key={p} value={p} className="bg-navy-card">
          {p} (HC {HANDICAPS[p]})
        </option>
      ))}
    </select>
  );
}

function PairInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Parse "Hugo and Bails" into two players
  const parts = value.split(' and ');
  const player1 = parts[0] || '';
  const player2 = parts[1] || '';

  const update = (p1: string, p2: string) => {
    onChange(`${p1} and ${p2}`);
  };

  return (
    <div className="flex gap-2">
      <select
        value={player1}
        onChange={(e) => update(e.target.value, player2)}
        className="flex-1 px-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-green-bright/30"
      >
        {ALL_PLAYERS.map((p) => (
          <option key={p} value={p} className="bg-navy-card">
            {p} ({HANDICAPS[p]})
          </option>
        ))}
      </select>
      <span className="self-center text-white/20 text-xs">&</span>
      <select
        value={player2}
        onChange={(e) => update(player1, e.target.value)}
        className="flex-1 px-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-green-bright/30"
      >
        {ALL_PLAYERS.map((p) => (
          <option key={p} value={p} className="bg-navy-card">
            {p} ({HANDICAPS[p]})
          </option>
        ))}
      </select>
    </div>
  );
}
