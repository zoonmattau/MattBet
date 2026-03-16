'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('admin_settings').select('*');
      const map: Record<string, string> = {};
      data?.forEach((s) => { map[s.key] = s.value || ''; });
      setSettings(map);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const supabase = createClient();

    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('admin_settings').upsert({ key, value }, { onConflict: 'key' });
    }

    setMessage('Settings saved');
    setSaving(false);
  };

  if (loading) {
    return <div className="text-white/40 text-sm py-8 text-center">Loading settings...</div>;
  }

  const fields = [
    { key: 'trip_status', label: 'Trip Status Banner', type: 'text', placeholder: 'e.g. Markets Open - Betting Live' },
    { key: 'google_sheet_individual_url', label: 'Google Sheet Individual CSV URL', type: 'url', placeholder: 'https://docs.google.com/spreadsheets/d/...' },
    { key: 'google_sheet_team_url', label: 'Google Sheet Team CSV URL', type: 'url', placeholder: 'https://docs.google.com/spreadsheets/d/...' },
    { key: 'leaderboard_source', label: 'Leaderboard Source', type: 'select', options: ['manual', 'sheet'] },
    { key: 'auto_sync_enabled', label: 'Auto Sync Enabled', type: 'select', options: ['true', 'false'] },
    { key: 'auto_sync_interval_minutes', label: 'Auto Sync Interval (minutes)', type: 'number', placeholder: '5' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-white">Settings</h1>

      <div className="bg-navy-card border border-white/8 rounded-xl p-5 space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="text-xs text-white/50 uppercase tracking-wide mb-1 block">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={settings[field.key] || ''}
                onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={settings[field.key] || ''}
                onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-green-bright/50"
              />
            )}
          </div>
        ))}

        {message && (
          <div className="text-sm text-green-bright bg-green-accent/10 px-3 py-2 rounded-lg">
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-lg bg-green-accent text-white font-bold text-sm hover:bg-green-bright transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Setup Instructions */}
      <div className="bg-navy-card border border-white/8 rounded-xl p-5">
        <h2 className="text-sm font-bold text-white mb-3">Google Sheets Setup</h2>
        <div className="text-xs text-white/50 space-y-2">
          <p>1. Create a Google Sheet with your leaderboard data.</p>
          <p>2. Use column headers: player_name, team_name, handicap, round_1_score, round_1_points, round_2_score, round_2_points, round_3_score, round_3_points, round_4_score, round_4_points, total_points, position</p>
          <p>3. For team sheet: team_name, round_1_points, round_2_points, round_3_points, round_4_points, total_points, position</p>
          <p>4. Go to File &gt; Share &gt; Publish to web.</p>
          <p>5. Select the specific sheet tab, choose CSV format.</p>
          <p>6. Copy the published URL and paste it above.</p>
          <p>7. Click &quot;Sync from Sheet&quot; on the Leaderboard page to import data.</p>
        </div>
      </div>
    </div>
  );
}
