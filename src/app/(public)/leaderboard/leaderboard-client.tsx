'use client';

import { useState } from 'react';
import { LeaderboardIndividual, LeaderboardTeam } from '@/lib/types';

interface LeaderboardClientProps {
  individual: LeaderboardIndividual[];
  team: LeaderboardTeam[];
}

type TabType = 'team' | 'individual' | 'r1' | 'r2' | 'r3' | 'r4';

export function LeaderboardClient({ individual, team }: LeaderboardClientProps) {
  const [tab, setTab] = useState<TabType>('team');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'team', label: 'Teams' },
    { key: 'individual', label: 'Individual' },
    { key: 'r1', label: 'R1' },
    { key: 'r2', label: 'R2' },
    { key: 'r3', label: 'R3' },
    { key: 'r4', label: 'R4' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-white mb-6">Leaderboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'bg-green-accent text-white'
                : 'bg-white/5 text-white/50 hover:text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Team Leaderboard */}
      {tab === 'team' && (
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Pos</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Team</th>
                <th className="text-right px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">R1</th>
                <th className="text-right px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">R2</th>
                <th className="text-right px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">R3</th>
                <th className="text-right px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">R4</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {team.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className={`border-b border-white/3 ${idx === 0 ? 'bg-green-accent/5' : ''}`}
                >
                  <td className="px-4 py-3 text-white/60 font-bold">{entry.position || idx + 1}</td>
                  <td className="px-4 py-3 text-white font-semibold">{entry.team_name}</td>
                  <td className="text-right px-3 py-3 text-white/60 font-mono text-xs">{entry.round_1_points ?? '-'}</td>
                  <td className="text-right px-3 py-3 text-white/60 font-mono text-xs">{entry.round_2_points ?? '-'}</td>
                  <td className="text-right px-3 py-3 text-white/60 font-mono text-xs">{entry.round_3_points ?? '-'}</td>
                  <td className="text-right px-3 py-3 text-white/60 font-mono text-xs">{entry.round_4_points ?? '-'}</td>
                  <td className="text-right px-4 py-3 text-green-bright font-bold">{entry.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Individual Leaderboard */}
      {tab === 'individual' && (
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Pos</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Player</th>
                <th className="text-left px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Team</th>
                <th className="text-right px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">HC</th>
                <th className="text-right px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">R1</th>
                <th className="text-right px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">R2</th>
                <th className="text-right px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">R3</th>
                <th className="text-right px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">R4</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {individual.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className={`border-b border-white/3 ${idx === 0 ? 'bg-green-accent/5' : ''}`}
                >
                  <td className="px-4 py-2.5 text-white/60 font-bold">{entry.position || idx + 1}</td>
                  <td className="px-4 py-2.5 text-white font-semibold">{entry.player_name}</td>
                  <td className="px-3 py-2.5 text-white/50 text-xs">{entry.team_name}</td>
                  <td className="text-right px-3 py-2.5 text-white/40 text-xs font-mono">{entry.handicap}</td>
                  <td className="text-right px-3 py-2.5 text-white/60 font-mono text-xs">{entry.round_1_points ?? '-'}</td>
                  <td className="text-right px-3 py-2.5 text-white/60 font-mono text-xs">{entry.round_2_points ?? '-'}</td>
                  <td className="text-right px-3 py-2.5 text-white/60 font-mono text-xs">{entry.round_3_points ?? '-'}</td>
                  <td className="text-right px-3 py-2.5 text-white/60 font-mono text-xs">{entry.round_4_points ?? '-'}</td>
                  <td className="text-right px-4 py-2.5 text-green-bright font-bold">{entry.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Round-specific views */}
      {['r1', 'r2', 'r3', 'r4'].includes(tab) && (
        <RoundView
          roundNumber={parseInt(tab.replace('r', ''))}
          individual={individual}
        />
      )}
    </div>
  );
}

function RoundView({
  roundNumber,
  individual,
}: {
  roundNumber: number;
  individual: LeaderboardIndividual[];
}) {
  const roundLabels: Record<number, string> = {
    1: 'Friday Stableford',
    2: 'Saturday AM Match Play',
    3: 'Saturday PM Scramble',
    4: 'Sunday Match Play',
  };

  const getPoints = (entry: LeaderboardIndividual) => {
    const key = `round_${roundNumber}_points` as keyof LeaderboardIndividual;
    return entry[key] as number | null;
  };
  const getScore = (entry: LeaderboardIndividual) => {
    const key = `round_${roundNumber}_score` as keyof LeaderboardIndividual;
    return entry[key] as number | null;
  };

  const sorted = [...individual].sort((a, b) => {
    const pa = getPoints(a) ?? -1;
    const pb = getPoints(b) ?? -1;
    return pb - pa;
  });

  return (
    <div>
      <h2 className="text-base font-bold text-white mb-3">
        Round {roundNumber} - {roundLabels[roundNumber]}
      </h2>
      <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Pos</th>
              <th className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Player</th>
              <th className="text-left px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Team</th>
              <th className="text-right px-3 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Score</th>
              <th className="text-right px-4 py-3 text-white/40 text-xs uppercase tracking-wide font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, idx) => (
              <tr
                key={entry.id}
                className={`border-b border-white/3 ${idx === 0 && getPoints(entry) !== null ? 'bg-green-accent/5' : ''}`}
              >
                <td className="px-4 py-2.5 text-white/60 font-bold">{idx + 1}</td>
                <td className="px-4 py-2.5 text-white font-semibold">{entry.player_name}</td>
                <td className="px-3 py-2.5 text-white/50 text-xs">{entry.team_name}</td>
                <td className="text-right px-3 py-2.5 text-white/60 font-mono">{getScore(entry) ?? '-'}</td>
                <td className="text-right px-4 py-2.5 text-green-bright font-bold">{getPoints(entry) ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
