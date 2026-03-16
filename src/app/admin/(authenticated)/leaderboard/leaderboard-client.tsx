'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeaderboardIndividual, LeaderboardTeam, SyncLog, AdminSetting } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export function AdminLeaderboardClient({
  individual,
  team,
  syncLogs,
  settings,
}: {
  individual: LeaderboardIndividual[];
  team: LeaderboardTeam[];
  syncLogs: SyncLog[];
  settings: AdminSetting[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'individual' | 'team' | 'sync'>('individual');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [editingIndividual, setEditingIndividual] = useState<Record<string, Partial<LeaderboardIndividual>>>({});
  const [editingTeam, setEditingTeam] = useState<Record<string, Partial<LeaderboardTeam>>>({});

  const sheetUrl = settings.find((s) => s.key === 'google_sheet_individual_url')?.value || '';
  const teamSheetUrl = settings.find((s) => s.key === 'google_sheet_team_url')?.value || '';

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/leaderboard/sync', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setSyncMessage(`Error: ${data.error}`);
      } else {
        setSyncMessage(`Synced ${data.individualCount || 0} individual and ${data.teamCount || 0} team rows.`);
        router.refresh();
      }
    } catch (err) {
      setSyncMessage('Sync failed');
    }
    setSyncing(false);
  };

  const handleSaveIndividual = async (id: string) => {
    const updates = editingIndividual[id];
    if (!updates) return;
    const supabase = createClient();
    await supabase.from('leaderboard_individual').update({ ...updates, source: 'manual' }).eq('id', id);
    setEditingIndividual((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    router.refresh();
  };

  const handleSaveTeam = async (id: string) => {
    const updates = editingTeam[id];
    if (!updates) return;
    const supabase = createClient();
    await supabase.from('leaderboard_team').update({ ...updates, source: 'manual' }).eq('id', id);
    setEditingTeam((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    router.refresh();
  };

  const updateIndField = (id: string, field: string, value: string) => {
    const numVal = value === '' ? null : parseFloat(value);
    setEditingIndividual((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: numVal },
    }));
  };

  const updateTeamField = (id: string, field: string, value: string) => {
    const numVal = value === '' ? null : parseFloat(value);
    setEditingTeam((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: numVal },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-white">Leaderboard Management</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-green-accent text-white font-medium text-sm hover:bg-green-bright transition-colors disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync from Sheet'}
        </button>
      </div>

      {syncMessage && (
        <div className={`text-sm px-4 py-2 rounded-lg ${syncMessage.startsWith('Error') ? 'bg-danger/10 text-danger' : 'bg-green-accent/10 text-green-bright'}`}>
          {syncMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1">
        {(['individual', 'team', 'sync'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-green-accent text-white' : 'bg-white/5 text-white/50 hover:text-white/70'
            }`}
          >
            {t === 'individual' ? 'Individual' : t === 'team' ? 'Team' : 'Sync Logs'}
          </button>
        ))}
      </div>

      {/* Individual Leaderboard Editor */}
      {tab === 'individual' && (
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Player</th>
                <th className="text-left px-2 py-2.5 text-white/40 text-xs uppercase font-medium">Team</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">R1 Score</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">R1 Pts</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">R2 Score</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">R2 Pts</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">R3 Score</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">R3 Pts</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">R4 Score</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">R4 Pts</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">Total</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">Pos</th>
                <th className="text-center px-2 py-2.5 text-white/40 text-xs uppercase font-medium">Src</th>
                <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {individual.map((entry) => {
                const editing = editingIndividual[entry.id] || {};
                const fields = [
                  'round_1_score', 'round_1_points', 'round_2_score', 'round_2_points',
                  'round_3_score', 'round_3_points', 'round_4_score', 'round_4_points',
                  'total_points', 'position',
                ] as const;
                return (
                  <tr key={entry.id} className="border-b border-white/3">
                    <td className="px-3 py-2 text-white font-medium text-xs">{entry.player_name}</td>
                    <td className="px-2 py-2 text-white/50 text-xs">{entry.team_name}</td>
                    {fields.map((field) => (
                      <td key={field} className="px-1 py-2 text-center">
                        <input
                          type="number"
                          step="0.5"
                          value={editing[field] !== undefined ? (editing[field] ?? '') : (entry[field] ?? '')}
                          onChange={(e) => updateIndField(entry.id, field, e.target.value)}
                          className="w-14 px-1 py-1 rounded bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-green-bright/50"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center">
                      <span className="text-[10px] text-white/30">{entry.source}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {editingIndividual[entry.id] && (
                        <button
                          onClick={() => handleSaveIndividual(entry.id)}
                          className="text-[10px] px-2 py-1 rounded bg-green-accent text-white"
                        >
                          save
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Team Leaderboard Editor */}
      {tab === 'team' && (
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-2.5 text-white/40 text-xs uppercase font-medium">Team</th>
                <th className="text-center px-3 py-2.5 text-white/40 text-xs uppercase font-medium">R1</th>
                <th className="text-center px-3 py-2.5 text-white/40 text-xs uppercase font-medium">R2</th>
                <th className="text-center px-3 py-2.5 text-white/40 text-xs uppercase font-medium">R3</th>
                <th className="text-center px-3 py-2.5 text-white/40 text-xs uppercase font-medium">R4</th>
                <th className="text-center px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Total</th>
                <th className="text-center px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Pos</th>
                <th className="text-right px-4 py-2.5 text-white/40 text-xs uppercase font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((entry) => {
                const editing = editingTeam[entry.id] || {};
                const fields = [
                  'round_1_points', 'round_2_points', 'round_3_points', 'round_4_points',
                  'total_points', 'position',
                ] as const;
                return (
                  <tr key={entry.id} className="border-b border-white/3">
                    <td className="px-4 py-2 text-white font-medium">{entry.team_name}</td>
                    {fields.map((field) => (
                      <td key={field} className="px-2 py-2 text-center">
                        <input
                          type="number"
                          step="0.5"
                          value={editing[field] !== undefined ? (editing[field] ?? '') : (entry[field] ?? '')}
                          onChange={(e) => updateTeamField(entry.id, field, e.target.value)}
                          className="w-16 px-1 py-1 rounded bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-green-bright/50"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right">
                      {editingTeam[entry.id] && (
                        <button
                          onClick={() => handleSaveTeam(entry.id)}
                          className="text-[10px] px-2 py-1 rounded bg-green-accent text-white"
                        >
                          save
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sync Logs */}
      {tab === 'sync' && (
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-2.5 text-white/40 text-xs uppercase font-medium">Time</th>
                <th className="text-left px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Source</th>
                <th className="text-center px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Status</th>
                <th className="text-right px-3 py-2.5 text-white/40 text-xs uppercase font-medium">Rows</th>
                <th className="text-left px-4 py-2.5 text-white/40 text-xs uppercase font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {syncLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/3">
                  <td className="px-4 py-2 text-white/60 text-xs">
                    {new Date(log.synced_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-white/50 text-xs">{log.source_type}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      log.status === 'success' ? 'status-open' : log.status === 'error' ? 'status-void' : 'status-suspended'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-white/50">{log.rows_processed}</td>
                  <td className="px-4 py-2 text-white/40 text-xs">{log.message || '-'}</td>
                </tr>
              ))}
              {syncLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-white/30 text-sm">
                    No sync logs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
