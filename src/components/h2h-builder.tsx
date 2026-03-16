'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const PLAYERS = [
  { name: 'Lewis', handicap: 9 },
  { name: 'Jacob', handicap: 9 },
  { name: 'Hugo', handicap: 15 },
  { name: 'Jackson', handicap: 14 },
  { name: 'Bails', handicap: 14 },
  { name: 'Brad', handicap: 15 },
  { name: 'Watto', handicap: 21 },
  { name: 'Finn', handicap: 10 },
  { name: 'Ando', handicap: 15 },
  { name: 'McNaughton', handicap: 18 },
  { name: 'Daniel', handicap: 20 },
  { name: 'Parker', handicap: 22 },
];

function getOdds(playerA: string, playerB: string): { oddsA: number; oddsB: number } {
  const a = PLAYERS.find((p) => p.name === playerA);
  const b = PLAYERS.find((p) => p.name === playerB);
  if (!a || !b) return { oddsA: 1.90, oddsB: 1.90 };

  const diff = a.handicap - b.handicap;
  // Lower handicap = better player = shorter odds
  // Each stroke of difference shifts odds roughly 0.15
  const shift = diff * 0.08;
  const oddsA = Math.max(1.15, parseFloat((1.90 + shift).toFixed(2)));
  const oddsB = Math.max(1.15, parseFloat((1.90 - shift).toFixed(2)));
  return { oddsA, oddsB };
}

export function H2HBuilder() {
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);
  const [stake, setStake] = useState('');
  const [bettorName, setBettorName] = useState('');
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  const bothSelected = playerA && playerB && playerA !== playerB;
  const { oddsA, oddsB } = bothSelected ? getOdds(playerA, playerB) : { oddsA: 0, oddsB: 0 };
  const selectedOdds = selected === 'a' ? oddsA : selected === 'b' ? oddsB : 0;
  const stakeNum = parseFloat(stake) || 0;
  const payout = stakeNum * selectedOdds;

  const handlePlace = async () => {
    if (!bettorName.trim()) { setError('Enter your name'); return; }
    if (!selected || stakeNum <= 0) { setError('Select a player and enter a stake'); return; }

    setPlacing(true);
    setError('');
    const supabase = createClient();

    // Create a custom market and bet in one go
    const title = `${playerA} vs ${playerB}: Higher Stableford`;
    const slug = `friday-h2h-${playerA.toLowerCase()}-${playerB.toLowerCase()}-${Date.now()}`;

    const { data: market } = await supabase
      .from('markets')
      .insert({
        title,
        slug,
        category: 'stableford',
        market_type: 'winner',
        status: 'open',
        round_label: 'Friday',
      })
      .select()
      .single();

    if (!market) { setError('Failed to create market'); setPlacing(false); return; }

    const { data: selections } = await supabase
      .from('market_selections')
      .insert([
        { market_id: market.id, name: playerA, odds_decimal: oddsA, sort_order: 1 },
        { market_id: market.id, name: playerB, odds_decimal: oddsB, sort_order: 2 },
      ])
      .select();

    if (!selections || selections.length < 2) { setError('Failed to create selections'); setPlacing(false); return; }

    const chosenSel = selections.find((s) => s.name === (selected === 'a' ? playerA : playerB));
    if (!chosenSel) { setError('Selection error'); setPlacing(false); return; }

    await supabase.from('bets').insert({
      bettor_name: bettorName.trim(),
      market_id: market.id,
      selection_id: chosenSel.id,
      stake: stakeNum,
      odds_taken: selectedOdds,
      potential_payout: parseFloat(payout.toFixed(2)),
      status: 'pending',
    });

    setConfirmation(
      `${selected === 'a' ? playerA : playerB} to outscore ${selected === 'a' ? playerB : playerA} at $${selectedOdds.toFixed(2)}. Stake: $${stakeNum.toFixed(2)}, return: $${payout.toFixed(2)}.`
    );
    setPlacing(false);
    setSelected(null);
    setStake('');
  };

  if (confirmation) {
    return (
      <div className="bg-navy-card border border-white/8 rounded-xl p-5 text-center">
        <div className="text-green-bright font-bold text-base mb-2">Bet Placed</div>
        <p className="text-white/50 text-sm mb-4">{confirmation}</p>
        <button
          onClick={() => { setConfirmation(''); setPlayerA(''); setPlayerB(''); }}
          className="px-5 py-2 rounded-lg bg-green-accent text-white font-medium text-sm hover:bg-green-bright transition-colors"
        >
          Build Another
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-3">
        <div className="text-xs text-white/40">Pick any two players -- who scores higher on Friday?</div>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {/* Player Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wide mb-1 block">Player A</label>
            <select
              value={playerA}
              onChange={(e) => { setPlayerA(e.target.value); setSelected(null); }}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-bright/50"
            >
              <option value="" className="bg-navy-card text-white">Select</option>
              {PLAYERS.filter((p) => p.name !== playerB).map((p) => (
                <option key={p.name} value={p.name} className="bg-navy-card text-white">{p.name} ({p.handicap})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wide mb-1 block">Player B</label>
            <select
              value={playerB}
              onChange={(e) => { setPlayerB(e.target.value); setSelected(null); }}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-bright/50"
            >
              <option value="" className="bg-navy-card text-white">Select</option>
              {PLAYERS.filter((p) => p.name !== playerA).map((p) => (
                <option key={p.name} value={p.name} className="bg-navy-card text-white">{p.name} ({p.handicap})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Odds Display */}
        {bothSelected && (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected('a')}
                className={`flex-1 flex items-center justify-between px-3 py-3 rounded-lg border transition-colors ${
                  selected === 'a'
                    ? 'bg-green-accent/15 border-green-bright/30'
                    : 'bg-odds-bg/50 border-green-bright/10 hover:border-green-bright/20'
                }`}
              >
                <span className={`text-sm ${selected === 'a' ? 'text-white font-semibold' : 'text-white/60'}`}>
                  {playerA}
                </span>
                <span className="text-sm text-green-bright font-bold font-mono">
                  ${oddsA.toFixed(2)}
                </span>
              </button>
              <button
                onClick={() => setSelected('b')}
                className={`flex-1 flex items-center justify-between px-3 py-3 rounded-lg border transition-colors ${
                  selected === 'b'
                    ? 'bg-green-accent/15 border-green-bright/30'
                    : 'bg-odds-bg/50 border-green-bright/10 hover:border-green-bright/20'
                }`}
              >
                <span className={`text-sm ${selected === 'b' ? 'text-white font-semibold' : 'text-white/60'}`}>
                  {playerB}
                </span>
                <span className="text-sm text-green-bright font-bold font-mono">
                  ${oddsB.toFixed(2)}
                </span>
              </button>
            </div>

            {selected && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={bettorName}
                  onChange={(e) => setBettorName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-green-bright/50"
                />
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-green-bright/50"
                    />
                  </div>
                  {stakeNum > 0 && (
                    <span className="text-xs text-white/40 shrink-0">
                      Returns ${payout.toFixed(2)}
                    </span>
                  )}
                </div>

                {error && <div className="text-xs text-danger">{error}</div>}

                <button
                  onClick={handlePlace}
                  disabled={placing || stakeNum <= 0}
                  className="w-full py-2.5 rounded-lg bg-green-accent text-white font-bold text-sm hover:bg-green-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {placing ? 'Placing...' : `Place Bet -- $${stakeNum.toFixed(2)}`}
                </button>

                <p className="text-[10px] text-white/20 leading-relaxed">
                  By placing this bet you agree to pay MattBet in full on any losing bets. All bets are final -- non-cancellable, non-editable, and involve real money.
                </p>
                <p className="text-[10px] text-white/15 italic text-center">
                  Imagine what you could be buying instead.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
